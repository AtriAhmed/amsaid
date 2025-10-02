import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

// Helper function to validate and parse ID
function parseId(id: string): number | null {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 1 ? null : parsedId;
}

// Helper function to parse range header
function parseRange(
  range: string,
  fileSize: number
): { start: number; end: number } | null {
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  // Validate range
  if (
    isNaN(start) ||
    isNaN(end) ||
    start > end ||
    start < 0 ||
    end >= fileSize
  ) {
    return null;
  }

  return { start, end };
}

// GET - Serve video file
export async function GET(
  req: Request,
  ctx: RouteContext<"/api/videos/[id]/media">
) {
  try {
    const params = await ctx.params;
    const id = parseId(params.id);

    if (!id) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    // Fetch the video
    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        url: true,
        active: true,
      },
    });

    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    if (!video.active) {
      return new NextResponse("Video is not available", { status: 403 });
    }

    if (!video.url) {
      return new NextResponse("Video file not found", { status: 404 });
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), "uploads", video.url);

    // Ensure the resolved path is still within uploads directory
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!filePath.startsWith(uploadsDir)) {
      return new NextResponse("Invalid file path", { status: 403 });
    }

    // Check if file exists and is a file
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new NextResponse("Video file not found on server", {
        status: 404,
      });
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Increment views count only on first request (not for range requests)
    const rangeHeader = req.headers.get("range");
    if (rangeHeader === "bytes=0-") {
      // Fire and forget - don't await to avoid slowing down response
      prisma.video
        .update({
          where: { id },
          data: {
            views: {
              increment: 1,
            },
          },
        })
        .catch((err) => console.error("Error incrementing views:", err));
    }

    // Handle range requests
    if (rangeHeader) {
      const range = parseRange(rangeHeader, fileSize);

      if (!range) {
        return new NextResponse("Invalid range", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const { start, end } = range;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      return new NextResponse(fileStream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "video/mp4",
          "Content-Disposition": `inline; filename="${encodeURIComponent(
            video.title
          )}.mp4"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Return entire file using stream
    const fileStream = fs.createReadStream(filePath);

    return new NextResponse(fileStream as any, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          video.title
        )}.mp4"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error serving video file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
