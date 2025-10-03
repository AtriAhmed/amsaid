import { readFileSync } from "fs";

import nodemailer from "nodemailer";
import { join } from "path";

// Email configuration interface
interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter object using SMTP transport
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send an email using nodemailer
 * @param config Email configuration object
 * @returns Promise<boolean> indicating success/failure
 */
export async function sendEmail(config: EmailConfig): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify SMTP configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Product Genius"}" <${
        process.env.SMTP_FROM_EMAIL
      }>`,
      to: config.to,
      subject: config.subject,
      text: config.text,
      html: config.html,
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send verification email to user
 * @param email User's email address
 * @param token Verification token
 * @param emailTemplate HTML template for the email
 * @returns Promise<boolean> indicating success/failure
 */
export async function sendResetPasswordEmail(
  email: string,
  token: string
): Promise<boolean> {
  const templatePath = join(
    process.cwd(),
    "src",
    "email-templates",
    "password-reset.html"
  );
  const emailTemplate = readFileSync(templatePath, "utf-8");

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/password-reset/${token}`;

  // Replace placeholder in template with actual verification URL
  const htmlContent = emailTemplate.replaceAll("{{RESET_URL}}", resetUrl);

  return sendEmail({
    to: email,
    subject: "Reset Your Password - Islamic Preacher",
    html: htmlContent,
    text: `Please reset your password by clicking this link: ${resetUrl}`,
  });
}
