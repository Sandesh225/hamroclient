"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const acceptSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone is required"),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  emergencyContactName: z.string().min(2, "Emergency Contact Name is required"),
  emergencyContactPhone: z.string().min(5, "Emergency Contact Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AcceptFormData = z.infer<typeof acceptSchema>;

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
  });

  useEffect(() => {
    if (!token) {
      setApiError("Invalid or missing invite link.");
    }
  }, [token]);

  const onSubmit = async (data: AcceptFormData) => {
    if (!token) return;

    setApiError("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/backend/auth/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send token and data. discard confirmPassword automatically
        body: JSON.stringify({ token, ...data }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setApiError(resData.error || "Failed to setup account. Link may be expired.");
      } else {
        setSuccess("Profile setup successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-6">
            The link you followed is missing its unique token. Please ask your admin to send a new invite link.
          </p>
          <Link href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl inline-flex font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden py-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
        </div>

      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary mb-4">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome to HamroClient! Please provide your details to finish setting up your staff account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {apiError && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm">
              {apiError}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input {...register("name")} className={inputClass} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
              <input {...register("phone")} className={inputClass} placeholder="+977-9800000000" />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">City *</label>
              <input {...register("city")} className={inputClass} placeholder="Kathmandu" />
              {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Address *</label>
              <input {...register("address")} className={inputClass} placeholder="Baneshwor, Ward 10" />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Contact Name *</label>
                <input {...register("emergencyContactName")} className={inputClass} placeholder="Jane Doe" />
                {errors.emergencyContactName && <p className="text-xs text-destructive mt-1">{errors.emergencyContactName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Contact Phone *</label>
                <input {...register("emergencyContactPhone")} className={inputClass} placeholder="+977-9811111111" />
                {errors.emergencyContactPhone && <p className="text-xs text-destructive mt-1">{errors.emergencyContactPhone.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className={inputClass}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors mt-8"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Setup & Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
