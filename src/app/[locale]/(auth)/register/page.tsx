"use client";

import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;

    setMsg("...");
    try {
      const res = await axios.post("/api/register", {
        email,
        password,
        name,
      });
      setMsg("Registered!");
    } catch (error: any) {
      setMsg(error.response?.data?.error || "Failed");
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border w-full px-3 py-2 rounded"
          name="name"
          placeholder="Name (optional)"
        />
        <input
          className="border w-full px-3 py-2 rounded"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
        <input
          className="border w-full px-3 py-2 rounded"
          name="password"
          type="password"
          required
          placeholder="Min 6 chars"
        />
        <button className="border px-3 py-2 rounded w-full" type="submit">
          Create account
        </button>
      </form>
      {msg && <div className="text-sm">{msg}</div>}
    </main>
  );
}
