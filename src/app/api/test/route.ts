import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Clone all books in the database
export async function GET(req: Request) {
  try {
    const titleSuffix = " (Copy)";

    // Fetch all books with their relationships
    const allBooks = await prisma.book.findMany({
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (allBooks.length === 0) {
      return NextResponse.json(
        { message: "No books found in database" },
        { status: 200 }
      );
    }

    console.log(`Starting to clone ${allBooks.length} books...`);

    const clonedBooks = [];
    const errors = [];

    // Clone each book
    for (const book of allBooks) {
      try {
        const clonedBook = await prisma.book.create({
          data: {
            title: book.title + titleSuffix,
            description: book.description,
            authorId: book.authorId,
            categoryId: book.categoryId,
            language: book.language,
            coverPhoto: book.coverPhoto,
            fileUrl: book.fileUrl,
            pages: book.pages,
            size: book.size,
            active: book.active,
            tags: {
              connect: book.tags.map((tag) => ({ id: tag.id })),
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

        clonedBooks.push(clonedBook);
        console.log(`Successfully cloned book: ${book.title}`);
      } catch (error: any) {
        console.error(`Error cloning book "${book.title}":`, error);
        errors.push({
          originalBookId: book.id,
          originalBookTitle: book.title,
          error: error.message,
        });
      }
    }

    const successCount = clonedBooks.length;
    const errorCount = errors.length;

    return NextResponse.json(
      {
        message: `Book cloning completed. ${successCount} books cloned successfully, ${errorCount} errors occurred.`,
        summary: {
          totalOriginalBooks: allBooks.length,
          successfulClones: successCount,
          errors: errorCount,
        },
        clonedBooks: clonedBooks.map((book) => ({
          id: book.id,
          title: book.title,
          originalTitle: book.title.replace(titleSuffix, ""),
        })),
        ...(errors.length > 0 && { errors }),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error during bulk book cloning:", error);
    return NextResponse.json(
      { error: "Failed to clone books", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Preview how many books will be cloned
// export async function GET() {
//   try {
//     const bookCount = await prisma.book.count();

//     const recentBooks = await prisma.book.findMany({
//       select: {
//         id: true,
//         title: true,
//         author: {
//           select: {
//             name: true,
//           },
//         },
//         category: {
//           select: {
//             name: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 5,
//     });

//     return NextResponse.json({
//       message: `Found ${bookCount} books that will be cloned`,
//       totalBooks: bookCount,
//       recentBooks,
//     });
//   } catch (error: any) {
//     console.error("Error fetching book count:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch book information" },
//       { status: 500 }
//     );
//   }
// }
