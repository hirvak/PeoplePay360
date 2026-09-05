import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

// Zod Login Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, "Work Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Success message after registration
  const registrationSuccessMessage = location.state?.message;

  // If already authenticated, redirect to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Redirect if logged in
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const onSubmit = async (data) => {
    setAuthError("");
    try {
      await login({
        email: data.email,
        password: data.password,
      });

      // Redirect to intended route or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      const errorMsg =
        err?.response?.data?.detail ||
        err?.message ||
        "Authentication failed. Please check your credentials or network connection.";
      setAuthError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
      {/* Background Decorator Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Top Header Logo */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              PeoplePay<span className="text-purple-600">360</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-none">
              HR & PAYROLL SUITE
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-purple-600" />
          <span>Enterprise Secure Login</span>
        </div>
      </header>

      {/* Main Form Center Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-slate-200 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 text-center pb-4 pt-8 border-b border-slate-100 bg-gradient-to-b from-purple-50/40 to-transparent">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-xs mb-1">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Login
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 max-w-xs mx-auto">
              Welcome back! Please enter your credentials to access PeoplePay360.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-5">
            {registrationSuccessMessage && (
              <Alert variant="success" title="Success">
                {registrationSuccessMessage}
              </Alert>
            )}

            {authError && (
              <Alert variant="destructive" title="Authentication Error">
                {authError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Work Email *</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="alex.morgan@company.com"
                    className="pl-9 bg-slate-50/40"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Password *</label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:underline transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="pl-9 pr-10 bg-slate-50/40"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  {...register("rememberMe")}
                />
                <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                  Keep me signed in on this device
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50/70 p-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <span>Don't have an account?</span>
            <Link to="/register" className="font-bold text-purple-600 hover:text-purple-800 hover:underline transition">
              Create Account
            </Link>
          </CardFooter>
        </Card>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} PeoplePay360 HR & Payroll. All rights reserved.
      </footer>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Instructions for password reset</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-2 text-sm text-slate-600">
          <p>
            Password reset requests are processed through your organization's HR Administrator.
          </p>
          <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
            Please contact your HR manager or IT Administrator to reset your password or unlock your account.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setForgotPasswordOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
