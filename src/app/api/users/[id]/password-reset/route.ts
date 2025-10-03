import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";
import { randomBytes } from "crypto";

// Helper function to validate and parse ID
function parseId(id: string): number | null {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 1 ? null : parsedId;
}

// POST - Generate password reset token and send email for specific user
export async function POST(
  req: Request,
  ctx: RouteContext<"/api/users/[id]/password-reset">
) {
  try {
    const params = await ctx.params;
    const userId = parseId(params.id);

    if (!userId) {
      return new NextResponse("Invalid user ID", { status: 400 });
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      // Don't reveal whether the user exists or not for security
      return NextResponse.json(
        { message: "If the user exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    // Generate a secure random token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const emailSent = await sendResetPasswordEmail(
      targetUser.email,
      resetToken
    );

    if (!emailSent) {
      // Clean up the token if email failed
      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return new NextResponse("Failed to send reset email", { status: 500 });
    }

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating password reset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
