import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating places
const CreatePlaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  address: z.string().optional(),
});

// GET - Fetch all places with optional search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const places = await prisma.place.findMany({
      where,
      select: {
        id: true,
        name: true,
        address: true,
        _count: {
          select: {
            videos: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    return NextResponse.json(places);
  } catch (error: any) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}

// POST - Create a new place
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = CreatePlaceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, address } = validation.data;

    // Check if place already exists
    const existingPlace = await prisma.place.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (existingPlace) {
      return NextResponse.json(
        { error: "Place with this name already exists" },
        { status: 409 }
      );
    }

    // Create the place
    const place = await prisma.place.create({
      data: {
        name,
        address,
      },
      select: {
        id: true,
        name: true,
        address: true,
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    return NextResponse.json(place, { status: 201 });
  } catch (error: any) {
    console.error("Error creating place:", error);
    return NextResponse.json(
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}
