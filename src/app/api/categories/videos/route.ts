import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const CreateVideoCategorySchema = z.object({
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

// GET - Fetch video categories with pagination
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
    const total = await prisma.videoCategory.count({
      where: whereClause,
    });

    // Get categories with pagination
    const categories = await prisma.videoCategory.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            videos: true,
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
    console.error("Error fetching video categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch video categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new video category
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = CreateVideoCategorySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Check if category already exists
    const existing = await prisma.videoCategory.findFirst({
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
    const category = await prisma.videoCategory.create({
      data: { name },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating video category:", error);
    return NextResponse.json(
      { error: "Failed to create video category" },
      { status: 500 }
    );
  }
}
