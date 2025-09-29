import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const UpdateVideoCategorySchema = z.object({
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

// GET - Fetch a single video category by ID
export async function GET(
  req: Request,
  ctx: RouteContext<"/api/categories/videos/[id]">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const category = await prisma.videoCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
        videos: {
          select: {
            id: true,
            title: true,
            speakers: {
              include: {
                person: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            poster: true,
            active: true,
            views: true,
            createdAt: true,
          },
          where: {
            active: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Limit to recent 10 videos
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Video category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error fetching video category:", error);
    return NextResponse.json(
      { error: "Failed to fetch video category" },
      { status: 500 }
    );
  }
}

// PUT - Update a video category
export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/categories/videos/[id]">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = UpdateVideoCategorySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Check if category exists
    const existing = await prisma.videoCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Video category not found" },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists
    const duplicate = await prisma.videoCategory.findFirst({
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
    const category = await prisma.videoCategory.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating video category:", error);
    return NextResponse.json(
      { error: "Failed to update video category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a video category
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/categories/videos/[id]">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await prisma.videoCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Video category not found" },
        { status: 404 }
      );
    }

    // Check if category has associated videos
    if (existing._count.videos > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with associated videos",
          videosCount: existing._count.videos,
        },
        { status: 409 }
      );
    }

    // Delete the category
    await prisma.videoCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Video category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting video category:", error);
    return NextResponse.json(
      { error: "Failed to delete video category" },
      { status: 500 }
    );
  }
}
