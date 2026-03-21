"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateApplicantMutation } from "@/store/api/applicantApi";
import { Loader2, User, Shield, Plane, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

// ── Types ──
const APPLICANT_TYPES = [
  { value: "WORKER", label: "Worker" },
  { value: "STUDENT", label: "Student" },
  { value: "VISITOR", label: "Visitor" },
  { value: "BUSINESS", label: "Business" },
  { value: "OTHER", label: "Other" },
] as const;

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

// ── Validation Schema ──
const createApplicantSchema = z.object({
  // Step 1: Basic Info
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  type: z.enum(["STUDENT", "WORKER", "VISITOR", "BUSINESS", "OTHER"]),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  
  // Step 2: Contact & Identity
  passportNumber: z.string().min(5, "Valid passport number is required"),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  mobile: z.string().min(1, "Mobile number is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  
  // Step 3: Application Detail
  destinationCountry: z.string().min(1, "Destination is required"),
  jobPosition: z.string().optional(),
  visaType: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof createApplicantSchema>;

export default function AddApplicantForm({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState(1);
  const [createApplicant, { isLoading: isSubmitting }] = useCreateApplicantMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createApplicantSchema),
    mode: "onBlur",
    defaultValues: {
      type: "WORKER",
      fullName: "",
      gender: "MALE",
      nationality: "Nepali",
      destinationCountry: "",
    },
  });

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ["fullName", "type", "gender", "dateOfBirth", "nationality"];
    if (step === 2) fieldsToValidate = ["passportNumber", "mobile", "city"];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: FormData) => {
    setFormError(null);
    setSuccessMsg(null);

    try {
      const response = await createApplicant(data).unwrap();

      if (!response.success) {
        setFormError(response.error || "Something went wrong.");
      } else {
        setSuccessMsg("Applicant registered successfully!");
        reset();
        setStep(1);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      setFormError(error.data?.error || "Failed to communicate with the server.");
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg overflow-hidden w-full max-w-2xl mx-auto">
      {/* ── Stepper Header ── */}
      <div className="bg-muted/50 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10" />
          
          {[
            { s: 1, icon: User, label: "Basic" },
            { s: 2, icon: Shield, label: "Identity" },
            { s: 3, icon: Plane, label: "Route" },
          ].map((item) => (
            <div key={item.s} className="flex flex-col items-center gap-1.5 bg-muted/50 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= item.s ? "bg-primary border-primary text-primary-foreground shadow-md" : "bg-card border-border text-muted-foreground"
                }`}
              >
                {step > item.s ? <CheckCircle2 className="w-6 h-6" /> : <item.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= item.s ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        {formError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {formError}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ────── STEP 1: BASIC INFO ────── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Full Legal Name</label>
                  <input {...register("fullName")} className="form-input-premium w-full" placeholder="As per passport" disabled={isSubmitting} />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Gender</label>
                  <select {...register("gender")} className="form-select-premium w-full">
                    {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Date of Birth</label>
                  <input type="date" {...register("dateOfBirth")} className="form-input-premium w-full" />
                  {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Nationality</label>
                  <input {...register("nationality")} className="form-input-premium w-full" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Applicant Type</label>
                  <select {...register("type")} className="form-select-premium w-full">
                    {APPLICANT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ────── STEP 2: IDENTITY & CONTACT ────── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Passport Number</label>
                  <input {...register("passportNumber")} className="form-input-premium w-full uppercase" placeholder="e.g. 12345678" />
                  {errors.passportNumber && <p className="text-xs text-destructive">{errors.passportNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted-foreground">Passport Issue Date</label>
                  <input type="date" {...register("passportIssueDate")} className="form-input-premium w-full" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted-foreground">Passport Expiry Date</label>
                  <input type="date" {...register("passportExpiryDate")} className="form-input-premium w-full" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Mobile Number</label>
                  <input {...register("mobile")} className="form-input-premium w-full" placeholder="+977" />
                  {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Email Address <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input type="email" {...register("email")} className="form-input-premium w-full" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Current City</label>
                  <input {...register("city")} className="form-input-premium w-full" placeholder="e.g. Kathmandu" />
                </div>
              </div>
            </div>
          )}

          {/* ────── STEP 3: APPLICATION DETAIL ────── */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Destination Country</label>
                  <select {...register("destinationCountry")} className="form-select-premium w-full">
                    <option value="">Select Target...</option>
                    <option value="JAPAN">Japan</option>
                    <option value="UAE">UAE</option>
                    <option value="QATAR">Qatar</option>
                    <option value="AUSTRALIA">Australia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Job Position</label>
                  <input {...register("jobPosition")} className="form-input-premium w-full" placeholder="e.g. Electrician" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Visa Type</label>
                  <input {...register("visaType")} className="form-input-premium w-full" placeholder="e.g. Working Visa" />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Internal Notes</label>
                  <textarea {...register("notes")} rows={3} className="form-textarea-premium w-full" placeholder="Any additional background info..." />
                </div>
              </div>
            </div>
          )}

          {/* ── Footer Actions ── */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-primary text-primary-foreground font-bold px-8 py-2.5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-bold px-10 py-2.5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Add Applicant
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
