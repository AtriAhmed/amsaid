import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filePathQuery = url.searchParams.get("path");

    if (!filePathQuery) {
      return new NextResponse("Query parameter 'path' is required", {
        status: 400,
      });
    }

    // Prevent directory traversal attacks
    const safePath = path
      .normalize(filePathQuery)
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(UPLOAD_DIR, safePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";

    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".mp4") contentType = "video/mp4";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
