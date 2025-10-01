import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/file-upload";

// Validation schemas
const UpdateVideoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
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
  place: z
    .union([
      z.number().int().positive("Place ID must be a positive integer"),
      z
        .string()
        .min(1, "Place name is required")
        .max(100, "Place name must be less than 100 characters"),
    ])
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .optional(),
  active: z.boolean().optional(),
  duration: z
    .number()
    .int()
    .positive("Duration must be a positive integer in seconds")
    .optional(),
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

// GET - Fetch a single video by ID
export async function GET(req: Request, ctx: RouteContext<"/api/videos/[id]">) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        speakers: {
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
        place: {
          select: {
            id: true,
            name: true,
            address: true,
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

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Increment views count
    await prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(video);
  } catch (error: any) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// PUT - Update a video
export async function PUT(req: Request, ctx: RouteContext<"/api/videos/[id]">) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type");
    let updateData: any = {};
    let newPoster: File | null = null;
    let newVideoFile: File | null = null;
    let tagsInput: string | null = null;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();

      updateData.title = formData.get("title") as string;
      updateData.description = formData.get("description") as string;
      updateData.speakers = formData.get("speakers") as string;
      updateData.categoryId = formData.get("categoryId") as string;
      updateData.language = formData.get("language") as string;
      updateData.place = formData.get("place") as string;
      updateData.date = formData.get("date") as string;
      updateData.duration = formData.get("duration") || undefined;
      updateData.active = formData.get("active") || undefined;
      tagsInput = formData.get("tags") as string;

      newPoster = formData.get("poster") as File;
      newVideoFile = formData.get("videoFile") as File;

      // Parse speakers if provided
      if (updateData.speakers) {
        try {
          updateData.speakers = JSON.parse(updateData.speakers);
        } catch {
          return NextResponse.json(
            { error: "Invalid speakers format" },
            { status: 400 }
          );
        }
      }

      if (updateData.place) {
        const placeAsNumber = parseInt(updateData.place);
        updateData.place =
          !isNaN(placeAsNumber) && placeAsNumber > 0
            ? placeAsNumber
            : updateData.place;
      }

      if (updateData.categoryId)
        updateData.categoryId = parseInt(updateData.categoryId);
      if (updateData.duration)
        updateData.duration = parseInt(updateData.duration);
      if (updateData.active !== null && updateData.active !== undefined) {
        updateData.active = updateData.active === "true";
      }
    } else {
      const body = await req.json();
      updateData = body;
      tagsInput = body.tags ? JSON.stringify(body.tags) : null;
    }

    // Parse tags if provided
    let tags: (string | number)[] | undefined;
    if (tagsInput) {
      try {
        tags = JSON.parse(tagsInput);
      } catch {
        return NextResponse.json(
          { error: "Invalid tags format" },
          { status: 400 }
        );
      }
      updateData.tags = tags;
    }

    // Validate the update data
    const validation = UpdateVideoSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
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
    if (validatedData.date) finalUpdateData.date = new Date(validatedData.date);
    if (validatedData.duration)
      finalUpdateData.duration = validatedData.duration;
    if (validatedData.active !== undefined)
      finalUpdateData.active = validatedData.active;

    // Handle category
    if (validatedData.categoryId) {
      const category = await prisma.videoCategory.findUnique({
        where: { id: validatedData.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Video category not found" },
          { status: 400 }
        );
      }
      finalUpdateData.categoryId = validatedData.categoryId;
    }

    // Handle speakers
    let speakerOperations: any = {};
    if (validatedData.speakers !== undefined) {
      const speakerIds = [];

      for (const speakerInput of validatedData.speakers) {
        let speakerRecord;
        if (typeof speakerInput === "number") {
          // Connect by ID - verify speaker exists
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
          // Create new speaker (since name is not unique, we create a new one)
          speakerRecord = await prisma.person.create({
            data: { name: speakerInput },
          });
        }
        speakerIds.push(speakerRecord.id);
      }

      // Use set to replace all existing speaker relationships
      speakerOperations.set = speakerIds.map((id) => ({ id }));
    }

    // Handle place
    if (validatedData.place !== undefined) {
      let placeRecord;
      if (typeof validatedData.place === "number") {
        placeRecord = await prisma.place.findUnique({
          where: { id: validatedData.place },
        });
        if (!placeRecord) {
          return NextResponse.json(
            { error: "Place not found" },
            { status: 400 }
          );
        }
      } else {
        placeRecord = await prisma.place.create({
          data: { name: validatedData.place },
        });
      }
      finalUpdateData.placeId = placeRecord.id;
    }

    // Handle poster update
    if (newPoster && newPoster instanceof File) {
      try {
        const posterPath = await uploadFile(newPoster);

        // Delete old poster if exists
        if (existingVideo.poster) {
          try {
            await deleteFile(existingVideo.poster);
          } catch (error) {
            console.error("Error deleting old poster:", error);
          }
        }

        finalUpdateData.poster = posterPath;
      } catch (error) {
        console.error("Error uploading new poster:", error);
        return NextResponse.json(
          { error: "Failed to upload poster" },
          { status: 500 }
        );
      }
    }

    // Handle video file update
    if (newVideoFile && newVideoFile instanceof File) {
      try {
        // Validate video file type
        if (!newVideoFile.type.startsWith("video/")) {
          return NextResponse.json(
            { error: "Invalid video file type" },
            { status: 400 }
          );
        }

        const videoPath = await uploadFile(newVideoFile);

        // Delete old video file if exists
        if (existingVideo.url) {
          try {
            await deleteFile(existingVideo.url);
          } catch (error) {
            console.error("Error deleting old video file:", error);
          }
        }

        finalUpdateData.url = videoPath;
      } catch (error) {
        console.error("Error uploading new video file:", error);
        return NextResponse.json(
          { error: "Failed to upload video file" },
          { status: 500 }
        );
      }
    }

    // Handle tags
    let tagOperations: any = {};
    if (validatedData.tags !== undefined) {
      const tagIds = [];

      for (const tagInput of validatedData.tags) {
        let tagRecord;
        if (typeof tagInput === "number") {
          // Connect by ID - verify tag exists
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
          // Find or create by name
          tagRecord = await prisma.tag.upsert({
            where: { name: tagInput },
            update: {},
            create: { name: tagInput },
          });
        }
        tagIds.push(tagRecord.id);
      }

      // Use set to replace all existing tag relationships
      tagOperations.set = tagIds.map((id) => ({ id }));
    }

    // Update the video
    const video = await prisma.video.update({
      where: { id },
      data: {
        ...finalUpdateData,
        ...(Object.keys(speakerOperations).length > 0 && {
          speakers: speakerOperations,
        }),
        ...(Object.keys(tagOperations).length > 0 && {
          tags: tagOperations,
        }),
      },
      include: {
        speakers: {
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
        place: {
          select: {
            id: true,
            name: true,
            address: true,
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

    return NextResponse.json({
      ...video,
      speakers: video.speakers.map((vs: any) => vs.person),
      tags: video.tags.map((vt: any) => vt.tag),
    });
  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a video
export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/videos/[id]">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Delete the video record (this will also delete related VideoTag records due to CASCADE)
    await prisma.video.delete({
      where: { id },
    });

    // Delete associated files
    try {
      if (existingVideo.poster) {
        await deleteFile(existingVideo.poster);
      }
      if (existingVideo.url) {
        await deleteFile(existingVideo.url);
      }
    } catch (error) {
      console.error("Error deleting video files:", error);
      // Don't fail the request if file deletion fails
    }

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
