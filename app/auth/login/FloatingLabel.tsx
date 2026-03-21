"use client";

import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/useToast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";

export default function FloatingLabelLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { update } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;

    if (err === "OAuthAccountNotLinked") {
      showToast(
        "This email already exists with another sign-in method. Use your original login method.",
        "error",
      );
      return;
    }

    showToast("Login failed. Please try again.", "error");
  }, [showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/shop",
      });
      if (!result?.error) {
        await fetch("/api/cart/claim", { method: "POST" });
      }

      if (result?.error) {
        showToast("Invalid email or password", "error");
        return;
      }

      await update();

      router.refresh();

      showToast("Welcome back!", "success");

      router.push(result?.url || "/shop");
    } catch (err: any) {
      showToast(err?.message || "Login failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: "/shop" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-foreground/60 mt-2">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full hover:bg-slate-100 items-center justify-center gap-3 px-4 py-3 border border-foreground/30 rounded-xl text-slate-700 font-medium transition-all duration-200 active:scale-[0.98]"
          >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-foreground/30"></div>
            <span className="shrink mx-4 text-foreground/70 text-xs uppercase tracking-widest">
              or
            </span>
            <div className="grow border-t border-foreground/30"></div>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="peer block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-foreground/30 rounded-xl outline-0 focus:border-foreground/70 transition-all"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-xs font-semibold text-foreground/70 transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:text-foreground/50 peer-placeholder-shown:font-normal peer-placeholder-shown:top-4
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground/70 peer-focus:font-semibold pointer-events-none"
              >
                Email Address
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="peer block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-foreground/30 rounded-xl outline-0 focus:border-foreground/70 transition-all"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-xs font-semibold text-foreground/50 transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:text-foreground/50 peer-placeholder-shown:font-normal peer-placeholder-shown:top-4
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground/70 peer-focus:font-semibold pointer-events-none"
              >
                Password
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-foreground/70">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 accent-foreground focus:ring-foreground"
              />
              Remember me
            </label>
            <a href="#" className="font-medium text-foreground hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full py-3.5 px-4 disabled:opacity-60 disabled:cursor-not-allowed bg-foreground/90 text-background font-semibold rounded-xl hover:bg-foreground transition-all duration-200 shadow-lg shadow-slate-200 active:scale-[0.99]"
          >
            {submitting ? <Spinner h="5" w="5" /> : <p>Sign In</p>}
          </button>

          <p className="text-center text-foreground/70 text-sm mt-6">
            New here?{" "}
            <a
              href="/auth/register"
              className="font-semibold text-foreground hover:underline underline-offset-4"
            >
              Create an account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
