import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

// Helper function to validate and parse ID
function parseId(id: string): number | null {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 1 ? null : parsedId;
}

// GET - Serve book PDF file
export async function GET(
  req: Request,
  ctx: RouteContext<"/api/books/[id]/media">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return new NextResponse("Invalid book ID", { status: 400 });
    }

    // Fetch the book
    const book = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        active: true,
      },
    });

    if (!book) {
      return new NextResponse("Book not found", { status: 404 });
    }

    if (!book.active) {
      return new NextResponse("Book is not available", { status: 403 });
    }

    if (!book.fileUrl) {
      return new NextResponse("Book file not found", { status: 404 });
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), "uploads", book.fileUrl);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Book file not found on server", { status: 404 });
    }

    // Increment downloads count
    await prisma.book.update({
      where: { id },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Create response with proper headers for PDF
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    return response;
  } catch (error: any) {
    console.error("Error serving book file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
