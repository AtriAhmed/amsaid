"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="border px-3 py-2 rounded"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Sign out
    </button>
  );
}
