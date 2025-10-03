import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

// Validation schema for password reset confirmation
const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// GET - Verify if reset token is valid
export async function GET(
  req: Request,
  ctx: RouteContext<"/api/users/password-reset/[token]">
) {
  const params = await ctx.params;

  try {
    const { token } = params;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token should not be expired
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        email: user.email,
        expiresAt: user.resetTokenExpiry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST - Reset password using token
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/users/password-reset/[token]">
) {
  const params = await ctx.params;

  try {
    const { token } = params;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    const body = await req.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token should not be expired
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
