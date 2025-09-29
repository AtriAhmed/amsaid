import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/file-upload";

// Validation schemas
const CreateVideoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  speakers: z
    .array(
      z.union([
        z.number().int().positive("Speaker ID must be a positive integer"),
        z
          .string()
          .min(1, "Speaker name is required")
          .max(100, "Speaker name must be less than 100 characters"),
      ])
    )
    .min(1, "At least one speaker is required"),
  categoryId: z
    .number()
    .int()
    .positive("Category ID must be a positive integer"),
  language: z
    .string()
    .min(1, "Language is required")
    .max(50, "Language must be less than 50 characters"),
  place: z.union([
    z.number().int().positive("Place ID must be a positive integer"),
    z
      .string()
      .min(1, "Place name is required")
      .max(100, "Place name must be less than 100 characters"),
  ]),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  duration: z
    .number()
    .int()
    .positive("Duration must be a positive integer in seconds"),
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
});

// GET - Fetch all videos with pagination and filters
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
    const speakerIds = searchParams.get("speakerIds");
    const placeId = searchParams.get("placeId");
    const language = searchParams.get("language");
    const active = searchParams.get("active");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId && !isNaN(parseInt(categoryId))) {
      where.categoryId = parseInt(categoryId);
    }

    if (speakerIds) {
      const speakerIdArray = speakerIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      if (speakerIdArray.length > 0) {
        where.speakers = {
          some: {
            personId: { in: speakerIdArray },
          },
        };
      }
    }

    if (placeId && !isNaN(parseInt(placeId))) {
      where.placeId = parseInt(placeId);
    }

    if (language) {
      where.language = language;
    }

    if (active !== null && active !== undefined) {
      where.active = active === "true";
    }

    const [videos, totalCount] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          speakers: {
            include: {
              person: {
                select: {
                  id: true,
                  name: true,
                  bio: true,
                },
              },
            },
          },
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
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    console.log("-------------------- videos --------------------");
    console.log(videos);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      videos: videos.map((video) => ({
        ...video,
        speakers: video.speakers.map((vs) => vs.person),
        tags: video.tags.map((vt) => vt.tag),
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// POST - Create a new video
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const speakersInput = formData.get("speakers") as string;
    const categoryId = formData.get("categoryId") as string;
    const language = formData.get("language") as string;
    const placeInput = formData.get("place") as string;
    const date = formData.get("date") as string;
    const duration = (formData.get("duration") as string) || undefined;
    const poster = formData.get("poster") as File;
    const videoFile = formData.get("videoFile") as File;
    const tagsInput = formData.get("tags") as string;

    console.log("-------------------- videoFile --------------------");
    console.log(videoFile);

    // Parse speakers and tags if provided
    let speakers: (string | number)[] = [];
    if (speakersInput) {
      try {
        speakers = JSON.parse(speakersInput);
      } catch {
        return NextResponse.json(
          { error: "Invalid speakers format" },
          { status: 400 }
        );
      }
    }

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

    // Parse place (could be ID or name)
    let place: string | number;
    const placeAsNumber = parseInt(placeInput);
    if (!isNaN(placeAsNumber) && placeAsNumber > 0) {
      place = placeAsNumber;
    } else {
      place = placeInput;
    }

    // Validate basic fields
    const validation = CreateVideoSchema.safeParse({
      title,
      description,
      speakers,
      categoryId: parseInt(categoryId),
      language,
      place,
      date,
      duration: duration && parseInt(duration),
      tags,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Validate files
    if (!poster || !(poster instanceof File)) {
      return NextResponse.json(
        { error: "Poster image is required" },
        { status: 400 }
      );
    }

    if (!videoFile || !(videoFile instanceof File)) {
      return NextResponse.json(
        { error: "Video file is required" },
        { status: 400 }
      );
    }

    // Validate video file type
    if (!videoFile.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid video file type" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.videoCategory.findUnique({
      where: { id: validation.data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Video category not found" },
        { status: 400 }
      );
    }

    // Handle speakers (find existing or create new)
    const speakerConnections = [];
    for (const speakerInput of validation.data.speakers) {
      let speakerRecord;
      if (typeof speakerInput === "number") {
        speakerRecord = await prisma.person.findUnique({
          where: { id: speakerInput },
        });
        if (!speakerRecord) {
          return NextResponse.json(
            { error: `Speaker with ID ${speakerInput} not found` },
            { status: 400 }
          );
        }
      } else {
        speakerRecord = await prisma.person.create({
          data: { name: speakerInput },
        });
      }
      speakerConnections.push({ personId: speakerRecord.id });
    }

    // Handle place (find existing or create new)
    let placeRecord;
    if (typeof validation.data.place === "number") {
      placeRecord = await prisma.place.findUnique({
        where: { id: validation.data.place },
      });
      if (!placeRecord) {
        return NextResponse.json({ error: "Place not found" }, { status: 400 });
      }
    } else {
      placeRecord = await prisma.place.create({
        data: { name: validation.data.place },
      });
    }

    // Upload poster image
    const posterPath = await uploadFile(poster);

    // Upload video file
    const videoPath = await uploadFile(videoFile);

    // Handle tags
    const tagConnections = [];
    for (const tagInput of validation.data.tags) {
      let tagRecord;
      if (typeof tagInput === "number") {
        // It's a tag ID
        tagRecord = await prisma.tag.findUnique({
          where: { id: tagInput },
        });
        if (!tagRecord) {
          return NextResponse.json(
            { error: `Tag with ID ${tagInput} not found` },
            { status: 400 }
          );
        }
      } else {
        // It's a tag name - find or create
        tagRecord = await prisma.tag.upsert({
          where: { name: tagInput },
          update: {},
          create: { name: tagInput },
        });
      }
      tagConnections.push({ tagId: tagRecord.id });
    }

    // Create the video
    const video = await prisma.video.create({
      data: {
        title: validation.data.title,
        description: validation.data.description,
        categoryId: validation.data.categoryId,
        language: validation.data.language,
        placeId: placeRecord.id,
        date: new Date(validation.data.date),
        poster: posterPath,
        url: videoPath,
        duration: validation.data.duration,
        speakers: {
          create: speakerConnections,
        },
        tags: {
          create: tagConnections,
        },
      },
      include: {
        speakers: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                bio: true,
              },
            },
          },
        },
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
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      ...video,
      speakers: video.speakers.map((vs) => vs.person),
      tags: video.tags.map((vt) => vt.tag),
    });
  } catch (error: any) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
