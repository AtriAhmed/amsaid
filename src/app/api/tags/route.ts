import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating tags
const CreateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
});

// GET - Fetch all tags with optional search
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

    const tags = await prisma.tag.findMany({
      where,
      select: {
        id: true,
        name: true,
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

    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST - Create a new tag
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = CreateTagSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Check if tag with this name already exists
    const existing = await prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }

    // Create the tag
    const tag = await prisma.tag.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
