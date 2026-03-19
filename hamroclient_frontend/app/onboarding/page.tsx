"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Phone, MapPin, Building2, UserCircle2, PhoneCall, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const onboardingSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone must be at least 10 characters"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (values: OnboardingValues) => {
    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${baseUrl}/staff/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }

      addToast("success", "Profile Updated", "Your profile has been successfully completed.");
      
      // Update the session to reflect the change in isProfileComplete
      await update({ isProfileComplete: true });
      
      // Redirect to staff dashboard
      router.push("/dashboard/staff");
      router.refresh();

    } catch (error: any) {
      addToast("error", "Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-10 text-white text-center">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="mt-2 text-slate-300 text-sm">
            Welcome to the team! Before you access the dashboard, please provide your contact details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+977 98XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
            </div>

            {/* City Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> City
              </label>
              <input
                {...register("city")}
                type="text"
                placeholder="Kathmandu"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.city && <p className="text-xs text-red-500 font-medium">{errors.city.message}</p>}
            </div>

            {/* Address Field */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Full Address
              </label>
              <input
                {...register("address")}
                type="text"
                placeholder="123 Street Name, Area"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
            </div>

            {/* Emergency Contact Name */}
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <UserCircle2 className="w-4 h-4" /> Emergency Contact Name
              </label>
              <input
                {...register("emergencyContactName")}
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.emergencyContactName && <p className="text-xs text-red-500 font-medium">{errors.emergencyContactName.message}</p>}
            </div>

            {/* Emergency Contact Phone */}
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <PhoneCall className="w-4 h-4" /> Emergency Contact Phone
              </label>
              <input
                {...register("emergencyContactPhone")}
                type="tel"
                placeholder="+977 98XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {errors.emergencyContactPhone && <p className="text-xs text-red-500 font-medium">{errors.emergencyContactPhone.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Save & Continue to Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
