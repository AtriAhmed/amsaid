import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const UpdateBookCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

// Helper function to validate and parse ID
function parseId(id: string): number | null {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 1 ? null : parsedId;
}

// GET - Fetch a single book category by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await prisma.bookCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
        books: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            coverPhoto: true,
            active: true,
            downloads: true,
            createdAt: true,
          },
          where: {
            active: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Limit to recent 10 books
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Book category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error fetching book category:", error);
    return NextResponse.json(
      { error: "Failed to fetch book category" },
      { status: 500 }
    );
  }
}

// PUT - Update a book category
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = UpdateBookCategorySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Check if category exists
    const existing = await prisma.bookCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Book category not found" },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists
    const duplicate = await prisma.bookCategory.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: name,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Update the category
    const category = await prisma.bookCategory.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating book category:", error);
    return NextResponse.json(
      { error: "Failed to update book category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a book category
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseId(idParam);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await prisma.bookCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Book category not found" },
        { status: 404 }
      );
    }

    // Check if category has associated books
    if (existing._count.books > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with associated books",
          booksCount: existing._count.books,
        },
        { status: 409 }
      );
    }

    // Delete the category
    await prisma.bookCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Book category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting book category:", error);
    return NextResponse.json(
      { error: "Failed to delete book category" },
      { status: 500 }
    );
  }
}
