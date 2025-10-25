"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function logVisit(fingerprint: string) {
  const headersList = await headers();

  // Check if a visit with the same fingerprint exists
  const existingVisit = await prisma.visitLog.findFirst({
    where: {
      fingerprint: fingerprint,
    },
  });

  const ip =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "127.0.0.1";

  if (!existingVisit) {
    await prisma.visitLog.create({
      data: {
        ipAddress: ip.toString(),
        fingerprint: fingerprint,
      },
    });

    // ensure that the stats object is created
    let statsObject = await prisma.stats.findFirst();
    if (!statsObject) {
      statsObject = await prisma.stats.create({
        data: {},
      });
    }

    // Increment unique visits count
    await prisma.stats.update({
      where: {
        id: statsObject.id,
      },
      data: {
        visits: {
          increment: 1,
        },
      },
    });
    return { new: true };
  }
  return { new: false };
}
