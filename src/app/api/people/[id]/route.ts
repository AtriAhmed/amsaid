import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Route context type for dynamic routes
type RouteContext<T extends string> = {
  params: Promise<{
    [K in T extends `${string}[${infer P}]${string}`
      ? P extends `...${infer Rest}`
        ? Rest
        : P
      : never]: string;
  }>;
};

// Validation schemas
const UpdatePersonSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  bio: z.string().optional(),
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

// GET - Fetch a single person by ID
export async function GET(req: Request, ctx: RouteContext<"/api/people/[id]">) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    const person = await prisma.person.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
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

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error: any) {
    console.error("Error fetching person:", error);
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: 500 }
    );
  }
}

// PUT - Update a person
export async function PUT(req: Request, ctx: RouteContext<"/api/people/[id]">) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    const json = await req.json().catch(() => ({}));
    const bodyParsed = UpdatePersonSchema.safeParse(json);

    if (!bodyParsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: bodyParsed.error.issues },
        { status: 400 }
      );
    }

    const updateData = bodyParsed.data;

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== existingPerson.name) {
      const duplicateName = await prisma.person.findFirst({
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
          { error: "A person with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the person
    const updatedPerson = await prisma.person.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedPerson);
  } catch (error: any) {
    console.error("Error updating person:", error);
    return NextResponse.json(
      { error: "Failed to update person" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a person
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/people/[id]">
) {
  const params = await ctx.params;

  try {
    const parsed = IdParamSchema.safeParse({ id: params.id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    const { id } = parsed.data;

    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
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

    if (!existingPerson) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // Check if person has associated books or videos
    if (existingPerson._count.books > 0 || existingPerson._count.videos > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete person with associated books or videos",
          details: {
            books: existingPerson._count.books,
            videos: existingPerson._count.videos,
          },
        },
        { status: 409 }
      );
    }

    // Delete the person
    await prisma.person.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Person deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { error: "Failed to delete person" },
      { status: 500 }
    );
  }
}
