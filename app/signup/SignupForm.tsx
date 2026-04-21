"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgName, name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sam Reyes"
          required
        />
      </div>
      <div>
        <label className="label">Facility / Organization (optional)</label>
        <input
          className="input"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Northside Manufacturing"
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="sam@northside.co"
          required
        />
      </div>
      <div>
        <label className="label">Password</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </div>
      {error && (
        <div className="text-sm text-signal-red border border-signal-red/30 bg-signal-red/5 px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center"
      >
        {loading ? "Creating account…" : "Sign Up"}
      </button>
    </form>
  );
}
