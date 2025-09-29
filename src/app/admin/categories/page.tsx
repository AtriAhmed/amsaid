import { redirect } from "next/navigation";

export default async function page() {
  redirect("/admin/categories/books");

  return null;
}
