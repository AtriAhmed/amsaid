import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/file-upload";
import { z } from "zod";
import pdfParse from "pdf-parse";

// Validation schemas
const UpdateBookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  author: z
    .union([
      z.number().int().positive("Author ID must be a positive integer"),
      z
        .string()
        .min(1, "Author name is required")
        .max(100, "Author name must be less than 100 characters"),
    ])
    .optional(),
  categoryId: z
    .number()
    .int()
    .positive("Category ID must be a positive integer")
    .optional(),
  language: z
    .string()
    .min(1, "Language is required")
    .max(50, "Language must be less than 50 characters")
    .optional(),
  active: z.boolean().optional(),
  tags: z
    .array(
      z.union([
        z.number().int().positive("Tag ID must be a positive integer"),
        z
          .string()
          .min(1, "Tag name is required")
          .max(50, "Tag name must be less than 50 characters"),
      ])
    )
    .optional(),
});

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

// Helper function to validate and parse ID
function parseId(id: string): number | null {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 1 ? null : parsedId;
}

// GET - Fetch a single book by ID
export async function GET(req: Request, ctx: RouteContext<"/api/books/[id]">) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error: any) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

// PUT - Update a book
export async function PUT(req: Request, ctx: RouteContext<"/api/books/[id]">) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type");
    let updateData: any = {};
    let newCoverPhoto: File | null = null;
    let newPdfFile: File | null = null;
    let tagsInput: string | null = null;

    if (contentType?.includes("multipart/form-data")) {
      // Handle form data (with files)
      const formData = await req.formData();

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const authorInput = formData.get("author") as string;
      const categoryId = formData.get("categoryId") as string;
      const language = formData.get("language") as string;
      const active = formData.get("active") as string;
      newCoverPhoto = formData.get("coverPhoto") as File;
      newPdfFile = formData.get("fileUrl") as File;
      tagsInput = formData.get("tags") as string;

      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (authorInput) {
        const authorAsNumber = parseInt(authorInput);
        updateData.author =
          !isNaN(authorAsNumber) && authorAsNumber > 0
            ? authorAsNumber
            : authorInput;
      }
      if (categoryId) updateData.categoryId = parseInt(categoryId);
      if (language) updateData.language = language;
      if (active !== null && active !== undefined)
        updateData.active = active === "true";
    } else {
      // Handle JSON data (without files)
      const json = await req.json().catch(() => ({}));
      updateData = json;
      if (json.tags) tagsInput = JSON.stringify(json.tags);
    }

    // Parse tags if provided
    let tags: (string | number)[] | undefined;
    if (tagsInput) {
      try {
        tags = JSON.parse(tagsInput);
        updateData.tags = tags;
      } catch {
        return NextResponse.json(
          { error: "Invalid tags format" },
          { status: 400 }
        );
      }
    }

    // Validate the update data
    const validation = UpdateBookSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    let finalUpdateData: any = {};

    // Handle basic fields
    if (validatedData.title) finalUpdateData.title = validatedData.title;
    if (validatedData.description)
      finalUpdateData.description = validatedData.description;
    if (validatedData.language)
      finalUpdateData.language = validatedData.language;
    if (validatedData.active !== undefined)
      finalUpdateData.active = validatedData.active;

    // Handle category
    if (validatedData.categoryId) {
      const category = await prisma.bookCategory.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Book category not found" },
          { status: 404 }
        );
      }
      finalUpdateData.categoryId = validatedData.categoryId;
    }

    // Handle author
    if (validatedData.author !== undefined) {
      let authorRecord;
      if (typeof validatedData.author === "number") {
        authorRecord = await prisma.person.findUnique({
          where: { id: validatedData.author },
        });

        if (!authorRecord) {
          return NextResponse.json(
            { error: "Author not found" },
            { status: 404 }
          );
        }
      } else {
        // Create new author
        authorRecord = await prisma.person.create({
          data: {
            name: validatedData.author,
          },
        });
      }
      finalUpdateData.authorId = authorRecord.id;
    }

    // Handle cover photo update
    if (newCoverPhoto && newCoverPhoto instanceof File) {
      try {
        const newCoverPath = await uploadFile(newCoverPhoto);

        // Delete old cover photo
        if (existingBook.coverPhoto) {
          await deleteFile(existingBook.coverPhoto).catch(console.error);
        }

        finalUpdateData.coverPhoto = newCoverPath;
      } catch (error) {
        console.error("Error uploading cover photo:", error);
        return NextResponse.json(
          { error: "Failed to upload cover photo" },
          { status: 500 }
        );
      }
    }

    // Handle PDF file update
    if (newPdfFile && newPdfFile instanceof File) {
      // Validate PDF file type
      if (newPdfFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "File must be a PDF" },
          { status: 400 }
        );
      }

      try {
        // Process PDF file
        const pdfBuffer = Buffer.from(await newPdfFile.arrayBuffer());
        const pdfData = await pdfParse(pdfBuffer);
        const pages = pdfData.numpages;
        const sizeInBytes = newPdfFile.size;
        const sizeInKB = Math.round(sizeInBytes / 1024);

        // Upload new PDF file
        const newPdfPath = await uploadFile(newPdfFile);

        // Delete old PDF file
        if (existingBook.fileUrl) {
          await deleteFile(existingBook.fileUrl).catch(console.error);
        }

        finalUpdateData.fileUrl = newPdfPath;
        finalUpdateData.pages = pages;
        finalUpdateData.size = sizeInKB;
      } catch (error) {
        console.error("Error processing PDF:", error);
        return NextResponse.json(
          { error: "Failed to process PDF file" },
          { status: 500 }
        );
      }
    }

    // Handle tags
    let tagOperations: any = {};
    if (validatedData.tags !== undefined) {
      const tagIds = [];

      for (const tag of validatedData.tags) {
        let tagRecord;
        if (typeof tag === "number") {
          // Connect by ID - verify tag exists
          tagRecord = await prisma.tag.findUnique({
            where: { id: tag },
          });

          if (!tagRecord) {
            return NextResponse.json(
              { error: `Tag with ID ${tag} not found` },
              { status: 404 }
            );
          }
        } else {
          // Find or create by name
          tagRecord = await prisma.tag.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag },
          });
        }
        tagIds.push(tagRecord.id);
      }

      // Use set to replace all existing tag relationships
      tagOperations.set = tagIds.map((id) => ({ id }));
    }

    // Update the book
    const book = await prisma.book.update({
      where: { id },
      data: {
        ...finalUpdateData,
        ...(Object.keys(tagOperations).length > 0 && {
          tags: tagOperations,
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(book);
  } catch (error: any) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a book
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/books/[id]">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Delete the book (this will cascade to delete BookTag relationships)
    await prisma.book.delete({
      where: { id },
    });

    // Delete associated files
    try {
      if (existingBook.coverPhoto) {
        await deleteFile(existingBook.coverPhoto);
      }
      if (existingBook.fileUrl) {
        await deleteFile(existingBook.fileUrl);
      }
    } catch (error) {
      console.error("Error deleting files:", error);
      // Don't fail the request if file deletion fails
    }

    return NextResponse.json(
      { message: "Book deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
