// types/prisma-schema-direct-relations.ts

/** Enum from schema */
export enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
}

/** User model */
export interface User {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash: string;
  emailVerified: Date | null;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Person */
export interface Person {
  id: number;
  name: string;
  bio?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations (optional — present only when included) */
  books?: Book[]; // Person -> Book (author)
  videos?: Video[]; // Person appears as speaker in many videos
}

/** BookCategory */
export interface BookCategory {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations */
  books?: Book[];
}

/** VideoCategory */
export interface VideoCategory {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations */
  videos?: Video[];
}

/** Place */
export interface Place {
  id: number;
  name: string;
  address?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations */
  videos?: Video[];
}

/** Tag */
export interface Tag {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations */
  books?: Book[];
  videos?: Video[];
}

/** Book */
export interface Book {
  id: number;
  title: string;
  description: string;
  authorId: number;
  categoryId: number;
  active: boolean;
  downloads: number;
  language: string;
  coverPhoto: string | null;
  fileUrl: string;
  pages: number;
  size: number; // file size (KB/MB per your comment)
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations (optional when included) */
  author?: Person;
  category?: BookCategory;
  tags?: Tag[]; // directly point to Tag[]
}

/** Video */
export interface Video {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  duration: number; // in seconds
  url: string;
  poster: string | null;
  active: boolean;
  views: number;
  date: Date; // actual event date
  placeId: number | null;
  language: string;
  createdAt?: Date;
  updatedAt?: Date;

  /** Relations (optional when included) */
  category?: VideoCategory;
  place?: Place | null;
  speakers?: Person[]; // directly point to Person[]
  tags?: Tag[]; // directly point to Tag[]
}

/** Helper union (all model names) */
export type PrismaModelName =
  | "User"
  | "Person"
  | "BookCategory"
  | "VideoCategory"
  | "Place"
  | "Tag"
  | "Book"
  | "Video";

/** Optional: map name -> type (useful generically) */
export type PrismaModels = {
  User: User;
  Person: Person;
  BookCategory: BookCategory;
  VideoCategory: VideoCategory;
  Place: Place;
  Tag: Tag;
  Book: Book;
  Video: Video;
};
