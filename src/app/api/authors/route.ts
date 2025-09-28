import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating authors
const CreateAuthorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  bio: z.string().optional(),
});

// GET - Fetch all authors with optional search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const authors = await prisma.person.findMany({
      where,
      select: {
        id: true,
        name: true,
        bio: true,
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    return NextResponse.json(authors);
  } catch (error: any) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}

// POST - Create a new author
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = CreateAuthorSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, bio } = parsed.data;

    // Check if author with this name already exists
    const existing = await prisma.person.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Author with this name already exists" },
        { status: 409 }
      );
    }

    // Create the author
    const author = await prisma.person.create({
      data: {
        name,
        bio,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(author, { status: 201 });
  } catch (error: any) {
    console.error("Error creating author:", error);
    return NextResponse.json(
      { error: "Failed to create author" },
      { status: 500 }
    );
  }
}
