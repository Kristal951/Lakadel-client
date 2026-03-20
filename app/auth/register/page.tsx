"use client";

import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/useToast";
import useUserStore from "@/store/userStore";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { registerUser, loading } = useUserStore();
  const { showToast } = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

       if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast(`Welcome to Lakadel.`, "success");
      router.push("/shop");
    } catch (error: any) {
      showToast(
        error?.message || "Registration failed. Please try again.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md  p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-forground tracking-tight">
            Create account
          </h1>
          <p className="text-foreground/60 mt-2">
            Fill in your credentials to get started.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/shop" })}
            className="flex w-full items-center justify-center gap-3 px-4 py-3 border border-foreground/30  rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]"
          >
            <FcGoogle size={22} />
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-foreground/30"></div>
            <span className="shrink mx-4 text-foreground/70 text-xs uppercase tracking-widest">
              or
            </span>
            <div className="grow border-t border-foreground/30"></div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="relative group">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-foreground/30 rounded-xl outline-0 focus:border-foreground/70 transition-all"
              />
              <label
                htmlFor="name"
                className="absolute left-4 top-2 text-xs font-semibold text-foreground/70 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-foreground/50  peer-placeholder-shown:font-normal peer-placeholder-shown:top-4
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground/70 peer-focus:font-semibold pointer-events-none"
              >
                Full Name
              </label>
            </div>

            {/* Email */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-foreground/30 rounded-xl outline-0 focus:border-foreground/70 transition-all"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-xs font-semibold text-foreground/70 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-foreground/50  peer-placeholder-shown:font-normal peer-placeholder-shown:top-4
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground/70 peer-focus:font-semibold pointer-events-none"
              >
                Email Address
              </label>
            </div>

            {/* Password */}
            <div className="relative group">
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer block w-full px-4 pt-6 pb-2 text-slate-900 bg-transparent border border-foreground/30 rounded-xl outline-0 focus:border-foreground/70 transition-all"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-xs font-semibold text-foreground/70 transition-all 
                peer-placeholder-shown:text-base peer-placeholder-shown:text-foreground/50  peer-placeholder-shown:font-normal peer-placeholder-shown:top-4
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground/70 peer-focus:font-semibold pointer-events-none"
              >
                Password
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2 h-max">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 rounded border-slate-300 accent-foreground focus:ring-foreground"
            />
            <label
              htmlFor="terms"
              className="text-sm text-foreground/60 leading-tight"
            >
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={
              loading || !formData.name || !formData.email || !formData.password
            }
            className="w-full py-3.5 px-4 bg-foreground/90 text-background font-semibold rounded-xl 
hover:bg-foreground transition-all duration-200 shadow-lg shadow-slate-200 
active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner h="5" w="5" /> : <p>Create Account</p>}
          </button>

          <p className="text-center text-foreground/70 text-sm mt-6">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-foreground hover:underline underline-offset-4"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
