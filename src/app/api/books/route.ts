import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/file-upload";
import { z } from "zod";
import pdfParse from "pdf-parse";

// Validation schemas
const CreateBookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional().or(z.literal("")),
  author: z.union([
    z.number().int().positive("Author ID must be a positive integer"),
    z
      .string()
      .min(1, "Author name is required")
      .max(100, "Author name must be less than 100 characters"),
  ]),
  categoryId: z
    .number()
    .int()
    .positive("Category ID must be a positive integer"),
  language: z
    .string()
    .min(1, "Language is required")
    .max(50, "Language must be less than 50 characters"),
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
    .optional()
    .default([]),
  active: z.boolean().optional().default(true),
});

// GET - Fetch all books with pagination and filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const authorId = searchParams.get("authorId");
    const language = searchParams.get("language");
    const active = searchParams.get("active");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { author: { name: { contains: search } } },
      ];
    }

    if (categoryId && !isNaN(parseInt(categoryId))) {
      where.categoryId = parseInt(categoryId);
    }

    if (authorId && !isNaN(parseInt(authorId))) {
      where.authorId = parseInt(authorId);
    }

    if (language) {
      where.language = language;
    }

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      books: books.map((book) => ({
        ...book,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST - Create a new book
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const authorInput = formData.get("author") as string;
    const categoryId = formData.get("categoryId") as string;
    const language = formData.get("language") as string;
    const coverPhoto = formData.get("coverPhoto") as File;
    const pdfFile = formData.get("fileUrl") as File;
    const tagsInput = formData.get("tags") as string;
    const active = formData.get("active") as string;

    console.log("-------------------- pdfFile --------------------");
    console.log(pdfFile);

    // Parse tags if provided
    let tags: (string | number)[] = [];
    if (tagsInput) {
      try {
        tags = JSON.parse(tagsInput);
      } catch {
        return NextResponse.json(
          { error: "Invalid tags format" },
          { status: 400 }
        );
      }
    }

    // Parse author (could be ID or name)
    let author: string | number;
    const authorAsNumber = parseInt(authorInput);
    if (!isNaN(authorAsNumber) && authorAsNumber > 0) {
      author = authorAsNumber;
    } else {
      author = authorInput;
    }

    // Validate basic fields
    const validation = CreateBookSchema.safeParse({
      title,
      description,
      author,
      categoryId: parseInt(categoryId),
      language,
      tags,
      active:
        active !== null && active !== undefined ? active === "true" : true,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Validate files
    if (!coverPhoto || !(coverPhoto instanceof File)) {
      return NextResponse.json(
        { error: "Cover photo is required" },
        { status: 400 }
      );
    }

    if (!pdfFile || !(pdfFile instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 }
      );
    }

    // Validate PDF file type
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.bookCategory.findUnique({
      where: { id: validation.data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Book category not found" },
        { status: 404 }
      );
    }

    // Handle author (find existing or create new)
    let authorRecord;
    if (typeof validation.data.author === "number") {
      authorRecord = await prisma.person.findUnique({
        where: { id: validation.data.author },
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
          name: validation.data.author,
        },
      });
    }

    // Upload cover photo
    const coverPhotoPath = await uploadFile(coverPhoto);

    // Process PDF file
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfData = await pdfParse(pdfBuffer);
    const pages = pdfData.numpages;
    const sizeInBytes = pdfFile.size;
    const sizeInKB = Math.round(sizeInBytes / 1024);

    // Upload PDF file
    const pdfPath = await uploadFile(pdfFile);

    // Handle tags
    const tagConnectOperations = [];
    const tagConnectOrCreateOperations = [];

    for (const tag of validation.data.tags) {
      if (typeof tag === "number") {
        // Connect by ID - verify tag exists
        const tagRecord = await prisma.tag.findUnique({
          where: { id: tag },
        });

        if (!tagRecord) {
          return NextResponse.json(
            { error: `Tag with ID ${tag} not found` },
            { status: 404 }
          );
        }

        tagConnectOperations.push({ id: tag });
      } else {
        // Connect or create by name
        tagConnectOrCreateOperations.push({
          where: { name: tag },
          create: { name: tag },
        });
      }
    }

    // Create the book
    const book = await prisma.book.create({
      data: {
        title: validation.data.title,
        description: validation.data.description || "",
        authorId: authorRecord.id,
        categoryId: validation.data.categoryId,
        language: validation.data.language,
        coverPhoto: coverPhotoPath,
        fileUrl: pdfPath,
        pages,
        size: sizeInKB,
        active: validation.data.active,
        tags: {
          ...(tagConnectOperations.length > 0 && {
            connect: tagConnectOperations,
          }),
          ...(tagConnectOrCreateOperations.length > 0 && {
            connectOrCreate: tagConnectOrCreateOperations,
          }),
        },
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

    return NextResponse.json(
      {
        ...book,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
