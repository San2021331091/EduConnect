'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const SignInPage: React.FC = (): React.JSX.Element => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_FIBER_URL}/login`, {
        email,
        password
      });

      const { token } = response.data;

      if (token) {
      
        localStorage.setItem("jwt", token);

        // Redirect to home page
        router.push("/");
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
       const error = err as AxiosError<{ error: string }>;
      setError(error.response?.data?.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#313338] px-4">
      <Card className="w-full max-w-md bg-[#2b2d31] border-none shadow-xl text-white">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">Welcome back!</CardTitle>
          <CardDescription className="text-gray-400">
            We are so excited to see you again!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <Alert className="bg-red-900/20 border-red-500 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-400">Email</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1e1f22] border-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-400">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1e1f22] border-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            Need an account?{" "}
            <button
              onClick={() => router.push("/sign-up")}
              className="text-indigo-400 hover:underline"
            >
              Register
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
