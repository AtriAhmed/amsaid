import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookForm from "@/components/admin/books/BookForm";
import { Book } from "@/types";
import { SWRConfig } from "swr";

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
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      return null;
    }

    return book;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

async function getAuthors() {
  try {
    const authors = await prisma.person.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return { data: authors };
  } catch (error) {
    console.error("Error fetching authors:", error);
    return [];
  }
}

async function getTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

async function getBookCategories() {
  try {
    const categories = await prisma.bookCategory.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return { data: categories };
  } catch (error) {
    console.error("Error fetching book categories:", error);
    return [];
  }
}
const EditBook = async ({ params }: EditBookProps) => {
  const { id } = await params;
  const book = await getBook(id);
  const authors = await getAuthors();
  const tags = await getTags();
  const bookCategories = await getBookCategories();

  if (!book) {
    notFound();
  }

  return (
    <SWRConfig value={{ fallback: { authors, tags, bookCategories } }}>
      <BookForm initialBook={book} />;
    </SWRConfig>
  );
};

export default EditBook;
