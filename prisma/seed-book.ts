import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Change these to what you want
const PREFIX = "[COPY] ";
const SUFFIX = " (Duplicate)";

async function main() {
  console.log("🌱 Starting book duplication...");

  // Fetch all books including tags
  const books = await prisma.book.findMany({
    include: { tags: true },
  });

  if (books.length === 0) {
    console.log("⚠️ No books found in the database.");
    return;
  }

  console.log(`📚 Found ${books.length} books. Duplicating...`);

  // Prepare duplication promises
  const duplicationPromises = books.map((book) =>
    prisma.book.create({
      data: {
        title: `${PREFIX}${book.title}${SUFFIX}`,
        description: book.description,
        authorId: book.authorId,
        categoryId: book.categoryId,
        active: book.active,
        downloads: book.downloads,
        language: book.language,
        coverPhoto: book.coverPhoto,
        fileUrl: book.fileUrl,
        pages: book.pages,
        size: book.size,
        tags: {
          connect: book.tags.map((tag) => ({ id: tag.id })),
        },
      },
    })
  );

  // Run all at once
  await Promise.all(duplicationPromises);

  console.log("🎉 Book duplication completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during duplication:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
