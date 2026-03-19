"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateApplicantMutation } from "@/store/api/applicantApi";
import { Loader2 } from "lucide-react";

const createApplicantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  type: z.enum(["STUDENT", "WORKER"]),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
});

type FormData = z.infer<typeof createApplicantSchema>;

export default function AddApplicantForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createApplicant, { isLoading: isSubmiting }] = useCreateApplicantMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createApplicantSchema),
    defaultValues: {
      type: "WORKER",
      firstName: "",
      lastName: "",
      passportNumber: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);
    setSuccessMsg(null);

    try {
      const response = await createApplicant(data).unwrap();

      if (!response.success) {
        setFormError(response.error || "Something went wrong.");
      } else {
        setSuccessMsg("Applicant created successfully!");
        reset();
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      setFormError(error.data?.error || "Failed to communicate with the server.");
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6">Add New Applicant</h2>

      {formError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 text-sm">
          {formError}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-md mb-6 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              {...register("firstName")}
              className={`w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${errors.firstName ? 'border-destructive' : 'border-input'}`}
              disabled={isSubmiting}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              {...register("lastName")}
              className={`w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${errors.lastName ? 'border-destructive' : 'border-input'}`}
              disabled={isSubmiting}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Passport Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="passportNumber">Passport Number</label>
          <input
            id="passportNumber"
            {...register("passportNumber")}
            className={`w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${errors.passportNumber ? 'border-destructive' : 'border-input'}`}
            disabled={isSubmiting}
          />
          {errors.passportNumber && <p className="text-xs text-destructive">{errors.passportNumber.message}</p>}
        </div>

        {/* Type Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="type">Applicant Type</label>
          <select
            id="type"
            {...register("type")}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={isSubmiting}
          >
            <option value="WORKER">Worker</option>
            <option value="STUDENT">Student</option>
          </select>
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

         {/* Optional Specs */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="phone">Phone <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <input
              id="phone"
              {...register("phone")}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={isSubmiting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">Email <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${errors.email ? 'border-destructive' : 'border-input'}`}
              disabled={isSubmiting}
            />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmiting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmiting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Applicant"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
