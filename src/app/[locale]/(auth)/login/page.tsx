"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: any) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const res = await signIn("credentials", {
      redirect: false, // manual redirect
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          className="border px-3 py-2 w-full rounded"
        />
        <input
          name="password"
          type="password"
          required
          className="border px-3 py-2 w-full rounded"
        />
        <button type="submit" className="border px-3 py-2 w-full rounded">
          Sign in
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
