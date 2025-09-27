import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const CreateBookCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 10 : Math.min(num, 100); // Max 100 items per page
    }),
  search: z.string().optional().or(z.literal("")),
});

// GET - Fetch book categories with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = PaginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, search } = parsed.data;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    // Get total count for pagination
    const total = await prisma.bookCategory.count({
      where: whereClause,
    });

    // Get categories with pagination
    const categories = await prisma.bookCategory.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: categories,
      page,
      limit,
      total,
      pages: totalPages,
    });
  } catch (error: any) {
    console.error("Error fetching book categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch book categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new book category
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = CreateBookCategorySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Check if category already exists
    const existing = await prisma.bookCategory.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Create the category
    const category = await prisma.bookCategory.create({
      data: { name },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book category:", error);
    return NextResponse.json(
      { error: "Failed to create book category" },
      { status: 500 }
    );
  }
}
