import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Change these to what you want
const PREFIX = "[COPY] ";
const SUFFIX = " (Duplicate)";

async function main() {
  console.log("🌱 Starting video duplication...");

  // Fetch all videos including tags & speakers
  const videos = await prisma.video.findMany({
    include: { tags: true, speakers: true },
  });

  if (videos.length === 0) {
    console.log("⚠️ No videos found in the database.");
    return;
  }

  console.log(`🎥 Found ${videos.length} videos. Duplicating...`);

  // Prepare duplication promises
  const duplicationPromises = videos.map((video) =>
    prisma.video.create({
      data: {
        title: `${PREFIX}${video.title}${SUFFIX}`,
        description: video.description,
        categoryId: video.categoryId,
        duration: video.duration,
        url: video.url,
        poster: video.poster,
        active: video.active,
        views: video.views,
        date: video.date,
        placeId: video.placeId,
        language: video.language,
        tags: {
          connect: video.tags.map((tag) => ({ id: tag.id })),
        },
        speakers: {
          connect: video.speakers.map((person) => ({ id: person.id })),
        },
      },
    })
  );

  // Run all at once
  await Promise.all(duplicationPromises);

  console.log("🎉 Video duplication completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during duplication:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
