import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const CreatePersonSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  bio: z.string().optional(),
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

// GET - Fetch all people with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = PaginationSchema.safeParse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
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
    const total = await prisma.person.count({
      where: whereClause,
    });

    // Get people with pagination
    const people = await prisma.person.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: people,
      page,
      limit,
      total,
      pages: totalPages,
    });
  } catch (error: any) {
    console.error("Error fetching people:", error);
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

// POST - Create a new person
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = CreatePersonSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, bio } = parsed.data;

    // Check if person with this name already exists
    const existing = await prisma.person.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A person with this name already exists" },
        { status: 409 }
      );
    }

    // Create the person
    const person = await prisma.person.create({
      data: {
        name,
        bio,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error: any) {
    console.error("Error creating person:", error);
    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    );
  }
}
