import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

// Validation schemas
const UpdatePlaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  address: z.string().optional(),
});

const IdParamSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error("Invalid ID");
    }
    return num;
  }),
});

// GET - Fetch a single place by ID
export async function GET(req: Request, ctx: RouteContext<"/api/places/[id]">) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    const place = await prisma.place.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        videos: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            language: true,
            active: true,
            views: true,
            date: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            speakers: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json(place);
  } catch (error: any) {
    console.error("Error fetching place:", error);
    return NextResponse.json(
      { error: "Failed to fetch place" },
      { status: 500 }
    );
  }
}

// PUT - Update a place
export async function PUT(req: Request, ctx: RouteContext<"/api/places/[id]">) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    const json = await req.json().catch(() => ({}));
    const bodyParsed = UpdatePlaceSchema.safeParse(json);

    if (!bodyParsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: bodyParsed.error.issues },
        { status: 400 }
      );
    }

    const updateData = bodyParsed.data;

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    });

    if (!existingPlace) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== existingPlace.name) {
      const duplicateName = await prisma.place.findFirst({
        where: {
          name: {
            equals: updateData.name,
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: "A place with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the place
    const updatedPlace = await prisma.place.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPlace);
  } catch (error: any) {
    console.error("Error updating place:", error);
    return NextResponse.json(
      { error: "Failed to update place" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a place
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/places/[id]">
) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid place ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!existingPlace) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    // Check if place has associated videos
    if (existingPlace._count.videos > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete place that is associated with videos",
          details: {
            videos: existingPlace._count.videos,
          },
        },
        { status: 409 }
      );
    }

    // Delete the place
    await prisma.place.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Place deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting place:", error);
    return NextResponse.json(
      { error: "Failed to delete place" },
      { status: 500 }
    );
  }
}
