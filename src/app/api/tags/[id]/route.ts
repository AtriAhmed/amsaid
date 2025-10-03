import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

// Validation schemas
const UpdateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .optional(),
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

// GET - Fetch a single tag by ID
export async function GET(req: Request, ctx: RouteContext<"/api/tags/[id]">) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        books: {
          select: {
            id: true,
            title: true,
            description: true,
            language: true,
            active: true,
            downloads: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            title: "asc",
          },
        },
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
            place: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error: any) {
    console.error("Error fetching tag:", error);
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

// PUT - Update a tag
export async function PUT(req: Request, ctx: RouteContext<"/api/tags/[id]">) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    const json = await req.json().catch(() => ({}));
    const bodyParsed = UpdateTagSchema.safeParse(json);

    if (!bodyParsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: bodyParsed.error.issues },
        { status: 400 }
      );
    }

    const updateData = bodyParsed.data;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== existingTag.name) {
      const duplicateName = await prisma.tag.findFirst({
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
          { error: "A tag with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
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

    return NextResponse.json(updatedTag);
  } catch (error: any) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tag
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/tags/[id]">
) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            books: true,
            videos: true,
          },
        },
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if tag has associated books or videos
    if (existingTag._count.books > 0 || existingTag._count.videos > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tag that is associated with books or videos",
          details: {
            books: existingTag._count.books,
            videos: existingTag._count.videos,
          },
        },
        { status: 409 }
      );
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Tag deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
