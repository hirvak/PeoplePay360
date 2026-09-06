import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatApiError } from "@/lib/utils";

// Zod Registration Validation Schema
const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().min(1, "Work Email is required").email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regError, setRegError] = useState("");

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setRegError("");
    try {
      await registerUser({
        email: data.email,
        password: data.password,
      });

      // Redirect to login page with success message
      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          message: "Account created successfully! Please sign in with your credentials.",
        },
      });
    } catch (err) {
      console.error("Registration failed:", err);
      setRegError(formatApiError(err, "Registration failed. Please check your details."));
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans transition-colors duration-200">
      {/* Background Decorator Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-300/40 dark:bg-purple-800/20 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Top Header Logo */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              PeoplePay<span className="text-purple-600 dark:text-purple-400">360</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-none">
              HR & PAYROLL SUITE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Secure Registration</span>
          </div>
        </div>
      </header>

      {/* Main Form Center Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md border-slate-200 dark:border-[#40383D] bg-white/95 dark:bg-[#211D20]/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1.5 text-center pb-3 pt-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-purple-50/40 dark:from-purple-950/20 to-transparent">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 shadow-xs mb-1">
              <User className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Create your PeoplePay360 account to get started.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {regError && (
              <Alert variant="destructive" title="Registration Error">
                {regError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Sarah Jenkins"
                    className="pl-9 bg-slate-50/40 dark:bg-slate-900/50"
                    {...register("fullName")}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.fullName.message}</p>
                )}
              </div>

              {/* Work Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="email"
                    placeholder="sarah.jenkins@company.com"
                    className="pl-9 bg-slate-50/40 dark:bg-slate-900/50"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    className="pl-9 pr-10 bg-slate-50/40 dark:bg-slate-900/50"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="pl-9 pr-10 bg-slate-50/40 dark:bg-slate-900/50"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50/70 dark:bg-slate-900/40 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Already have an account?</span>
            <Link to="/login" className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline transition">
              Login
            </Link>
          </CardFooter>
        </Card>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} PeoplePay360 HR & Payroll. All rights reserved.
      </footer>
    </div>
  );
}
