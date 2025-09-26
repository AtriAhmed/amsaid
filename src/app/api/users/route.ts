// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" }
    });
    return NextResponse.json(users);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

// POST /api/users  with JSON body: { "email": "a@b.com", "name": "Ahmed" }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name } = body || {};
console.log(body);
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const created = await prisma.user.create({
      data: { email, name: name ?? null }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
