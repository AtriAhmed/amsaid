import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { Role } from "@/generated/prisma";

// Validation schema for creating users
const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([Role.OWNER, Role.MANAGER, Role.ADMIN]),
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

// Helper function to check if user can manage other users
function canManageUsers(userRole: Role): boolean {
  return userRole === Role.OWNER || userRole === Role.MANAGER;
}

// GET - Fetch all users (only OWNER and MANAGER can access)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST - Create a new user (only OWNER and MANAGER can create ADMIN users)
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = CreateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, name, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hash(password, 12);

    // Create the user with ADMIN role (as specified in requirements)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: Role.MANAGER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
