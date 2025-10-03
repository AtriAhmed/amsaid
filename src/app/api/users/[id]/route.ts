import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { Role } from "@/generated/prisma";

// Validation schema for updating users
const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(Role).optional(),
});

// Helper function to get current user with role
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt((session.user as any).id) },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}

// Helper function to check permissions
function canManageUser(currentUserRole: Role, targetUserRole: Role): boolean {
  // OWNER can manage MANAGER and ADMIN
  if (currentUserRole === Role.OWNER) {
    return targetUserRole === Role.MANAGER || targetUserRole === Role.ADMIN;
  }

  // MANAGER can manage ADMIN but not OWNER
  if (currentUserRole === Role.MANAGER) {
    return targetUserRole === Role.ADMIN;
  }

  return false;
}

// Helper function to validate and parse ID
function parseId(id: string): number | null {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 1 ? null : parsedId;
}

// GET - Fetch a specific user
export async function GET(req: Request, ctx: RouteContext<"/api/users/[id]">) {
  const params = await ctx.params;

  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseId(params.id);
    if (!userId) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if current user can view this user
    if (
      currentUser.id !== user.id &&
      !canManageUser(currentUser.role, user.role)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT - Update a specific user
export async function PUT(req: Request, ctx: RouteContext<"/api/users/[id]">) {
  const params = await ctx.params;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseId(params.id);
    if (!userId) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check permissions
    if (
      currentUser.id !== targetUser.id &&
      !canManageUser(currentUser.role, targetUser.role)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const validation = UpdateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData: any = {};
    const { email, name, password, role } = validation.data;

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 409 }
        );
      }
      updateData.email = email;
    }

    if (name) {
      updateData.name = name;
    }

    if (password) {
      updateData.passwordHash = await hash(password, 12);
    }

    if (role) {
      // Only managers and owners can change roles
      if (
        currentUser.role !== Role.OWNER &&
        currentUser.role !== Role.MANAGER
      ) {
        return NextResponse.json(
          { error: "Insufficient permissions to change role" },
          { status: 403 }
        );
      }

      // Additional role change restrictions
      if (currentUser.role === Role.MANAGER && role !== Role.ADMIN) {
        return NextResponse.json(
          { error: "Managers can only assign ADMIN role" },
          { status: 403 }
        );
      }

      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { user: updatedUser, message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE - Delete a specific user
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/users/[id]">
) {
  const params = await ctx.params;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseId(params.id);
    if (!userId) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check permissions
    if (!canManageUser(currentUser.role, targetUser.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Prevent users from deleting themselves
    if (currentUser.id === targetUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
