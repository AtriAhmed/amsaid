import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookForm from "@/components/admin/books/BookForm";

interface Book {
  id: number;
  title: string;
  description: string;
  author: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  language: string;
  coverPhoto: string | null;
  fileUrl: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

interface EditBookProps {
  params: Promise<{ id: string }>;
}

async function getBook(id: string): Promise<Book | null> {
  const bookId = parseInt(id, 10);

  if (isNaN(bookId) || bookId < 1) {
    return null;
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
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

    if (!book) {
      return null;
    }

    return {
      ...book,
      tags: book.tags.map((bt) => bt.tag),
    };
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

const EditBook = async ({ params }: EditBookProps) => {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  return <BookForm initialBook={book} />;
};

export default EditBook;
