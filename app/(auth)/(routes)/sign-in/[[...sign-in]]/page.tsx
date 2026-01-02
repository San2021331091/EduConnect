"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/auth/auth";

const SignInPage: React.FC = (): React.JSX.Element => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338]">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md bg-[#2b2d31] p-8 rounded-md shadow-xl"
      >
        <h2 className="text-2xl font-semibold text-center text-white mb-2">
          Welcome back!
        </h2>
        <p className="text-center text-sm text-gray-400 mb-6">
          We are so excited to see you again!
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1e1f22] border border-[#1e1f22] rounded px-3 py-2 text-white focus:outline-none focus:border-[#5865F2]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1e1f22] border border-[#1e1f22] rounded px-3 py-2 text-white focus:outline-none focus:border-[#5865F2]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-2 rounded font-medium transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Need an account?{" "}
          <span className="text-[#5865F2] hover:underline cursor-pointer">
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignInPage;
