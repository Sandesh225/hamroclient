"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  CreditCard,
  Phone,
  GraduationCap,
  Briefcase,
  Languages,
  MapPin,
  ClipboardCheck,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCreateApplicantMutation } from "@/store/api/applicantApi";
import { useForm, FormProvider, useFormContext, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ── Validation Schema ──
const educationSchema = z.object({
  level: z.string(),
  degreeTitle: z.string(),
  institution: z.string(),
  graduationYear: z.string(),
  attestationStatus: z.string(),
});

const employmentSchema = z.object({
  employer: z.string(),
  jobTitle: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  isCurrent: z.boolean(),
});

const applicantSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  type: z.string().default("WORKER"),
  dateOfBirth: z.string().min(1, "DOB is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().optional(),
  placeOfBirth: z.string().optional(),
  maritalStatus: z.string().optional(),
  religion: z.string().optional(),
  nationalIdNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),

  passportNumber: z.string().min(1, "Passport Number is required"),
  passportIssueDate: z.string().min(1, "Issue Date is required"),
  passportExpiryDate: z.string().min(1, "Expiry Date is required"),
  passportIssuingCountry: z.string().optional(),

  mobile: z.string().min(1, "Mobile number is required"),
  email: z.string().optional(),
  homeAddress: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().min(1, "Emergency Contact Name required"),
  emergencyRelationship: z.string().optional(),
  emergencyPhone: z.string().min(1, "Emergency Phone required"),

  education: z.array(educationSchema),
  employment: z.array(employmentSchema),

  primaryLanguage: z.string().optional(),
  englishProficiency: z.string().optional(),
  languageTestType: z.string().optional(),
  testScore: z.string().optional(),
  testDate: z.string().optional(),
  technicalSkills: z.string().optional(),

  destinationCountry: z.string().min(1, "Destination is required"),
  visaType: z.string().min(1, "Visa Type is required"),
  positionApplied: z.string().optional(),
  employerAbroad: z.string().optional(),
  salaryOffered: z.string().optional(),
  currency: z.string().optional(),
  contractDuration: z.string().optional(),
  expectedDeploymentDate: z.string().optional(),
  agencyFee: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof applicantSchema>;

// ── Constants ──
const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Passport", icon: CreditCard },
  { id: 3, label: "Contact", icon: Phone },
  { id: 4, label: "Education", icon: GraduationCap },
  { id: 5, label: "Employment", icon: Briefcase },
  { id: 6, label: "Skills", icon: Languages },
  { id: 7, label: "Placement", icon: MapPin },
  { id: 8, label: "Review", icon: ClipboardCheck },
];

const COUNTRIES = ["Japan", "UAE", "Qatar", "Australia", "USA"];
const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const VISA_TYPES: Record<string, string[]> = {
  Japan: ["SSW1", "SSW2", "Technical Intern", "Specified Skills"],
  UAE: ["Work Visa", "Visit Visa", "Domestic Worker"],
  Qatar: ["Work Permit", "Family Visa"],
  Australia: ["TSS 482", "Student 500", "WHV 417", "PR 189"],
  USA: ["H-1B", "H-2A", "H-2B", "L-1", "EB-3"],
};
const EDUCATION_LEVELS = ["Secondary (SLC/SEE)", "Higher Secondary (+2)", "Diploma", "Bachelor's", "Master's", "PhD"];
const ENGLISH_LEVELS = ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced", "Native"];
const LANGUAGE_TESTS = ["None", "IELTS", "TOEFL", "PTE", "NAT", "JLPT", "Other"];

const INITIAL_FORM: FormData = {
  fullName: "", type: "WORKER", dateOfBirth: "", gender: "", nationality: "Nepali", placeOfBirth: "",
  maritalStatus: "", religion: "", nationalIdNumber: "", bloodGroup: "", height: "", weight: "",
  passportNumber: "", passportIssueDate: "", passportExpiryDate: "", passportIssuingCountry: "Nepal",
  mobile: "", email: "", homeAddress: "", city: "", province: "", country: "Nepal", postalCode: "",
  emergencyContactName: "", emergencyRelationship: "", emergencyPhone: "",
  education: [{ level: "", degreeTitle: "", institution: "", graduationYear: "", attestationStatus: "Pending" }],
  employment: [],
  primaryLanguage: "Nepali", englishProficiency: "", languageTestType: "None", testScore: "", testDate: "", technicalSkills: "",
  destinationCountry: "", visaType: "", positionApplied: "", employerAbroad: "", salaryOffered: "",
  currency: "USD", contractDuration: "", expectedDeploymentDate: "", agencyFee: "", notes: "",
};

const inputClass = "form-input-premium";
const selectClass = "form-select-premium";
const textareaClass = "form-textarea-premium";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  );
}

// ── Step Components ──
// These connect to FormProvider context to avoid massive re-renders in the parent shell

const Step1Personal = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Personal Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Full Name" required error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputClass} placeholder="Enter full name" />
        </Field>
        <Field label="Date of Birth" required error={errors.dateOfBirth?.message}>
          <input type="date" {...register("dateOfBirth")} className={inputClass} />
        </Field>
        <Field label="Gender" required error={errors.gender?.message}>
          <select {...register("gender")} className={selectClass}>
            <option value="">Select</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Nationality">
          <input {...register("nationality")} className={inputClass} />
        </Field>
        <Field label="Place of Birth">
          <input {...register("placeOfBirth")} className={inputClass} placeholder="City / District" />
        </Field>
        <Field label="Marital Status">
          <select {...register("maritalStatus")} className={selectClass}>
            <option value="">Select</option>
            {MARITAL_STATUSES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Religion">
          <input {...register("religion")} className={inputClass} placeholder="e.g. Hindu, Buddhist" />
        </Field>
        <Field label="National ID">
          <input {...register("nationalIdNumber")} className={inputClass} placeholder="Citizenship number" />
        </Field>
        <Field label="Blood Group">
          <select {...register("bloodGroup")} className={selectClass}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Height (cm)">
          <input type="number" {...register("height")} className={inputClass} placeholder="165" />
        </Field>
        <Field label="Weight (kg)">
          <input type="number" {...register("weight")} className={inputClass} placeholder="65" />
        </Field>
      </div>
      <Field label="Passport Photo">
        <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload passport photo (JPG, PNG, max 10MB)</span>
        </div>
      </Field>
    </div>
  );
};

const Step2Passport = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Passport & Identity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Passport Number" required error={errors.passportNumber?.message}>
          <input {...register("passportNumber")} className={inputClass} placeholder="e.g. NP12345678" />
        </Field>
        <Field label="Issuing Country">
          <input {...register("passportIssuingCountry")} className={inputClass} />
        </Field>
        <Field label="Issue Date" required error={errors.passportIssueDate?.message}>
          <input type="date" {...register("passportIssueDate")} className={inputClass} />
        </Field>
        <Field label="Expiry Date" required error={errors.passportExpiryDate?.message}>
          <input type="date" {...register("passportExpiryDate")} className={inputClass} />
        </Field>
      </div>
    </div>
  );
};

const Step3Contact = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Contact Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Mobile Number" required error={errors.mobile?.message}>
          <input {...register("mobile")} className={inputClass} placeholder="+977-9841234567" />
        </Field>
        <Field label="Email">
          <input type="email" {...register("email")} className={inputClass} placeholder="email@example.com" />
        </Field>
      </div>
      <Field label="Home Address">
        <input {...register("homeAddress")} className={inputClass} placeholder="Street address" />
      </Field>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="City">
          <input {...register("city")} className={inputClass} />
        </Field>
        <Field label="Province">
          <input {...register("province")} className={inputClass} />
        </Field>
        <Field label="Country">
          <input {...register("country")} className={inputClass} />
        </Field>
        <Field label="Postal Code">
          <input {...register("postalCode")} className={inputClass} />
        </Field>
      </div>
      <h3 className="text-sm font-semibold text-foreground pt-2 border-t border-border">Emergency Contact</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Contact Name" required error={errors.emergencyContactName?.message}>
          <input {...register("emergencyContactName")} className={inputClass} />
        </Field>
        <Field label="Relationship">
          <input {...register("emergencyRelationship")} className={inputClass} placeholder="e.g. Father, Spouse" />
        </Field>
        <Field label="Phone" required error={errors.emergencyPhone?.message}>
          <input {...register("emergencyPhone")} className={inputClass} />
        </Field>
      </div>
    </div>
  );
};

const Step4Education = () => {
  const { register, control } = useFormContext<FormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Education</h2>
        <button type="button" onClick={() => append({ level: "", degreeTitle: "", institution: "", graduationYear: "", attestationStatus: "Pending" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Degree
        </button>
      </div>
      {fields.map((edu, idx) => (
        <div key={edu.id} className="border border-border rounded-xl p-4 space-y-3 relative">
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(idx)} className="absolute top-3 right-3 p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <p className="text-xs font-semibold text-muted-foreground">Entry {idx + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Level">
              <select {...register(`education.${idx}.level`)} className={selectClass}>
                <option value="">Select</option>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Degree/Certificate Title">
              <input {...register(`education.${idx}.degreeTitle`)} className={inputClass} />
            </Field>
            <Field label="Institution">
              <input {...register(`education.${idx}.institution`)} className={inputClass} />
            </Field>
            <Field label="Graduation Year">
              <input {...register(`education.${idx}.graduationYear`)} className={inputClass} placeholder="2024" />
            </Field>
            <Field label="Attestation Status">
              <select {...register(`education.${idx}.attestationStatus`)} className={selectClass}>
                <option value="Pending">Pending</option>
                <option value="Attested">Attested</option>
                <option value="Not Required">Not Required</option>
              </select>
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
};

const Step5Employment = () => {
  const { register, control, watch } = useFormContext<FormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "employment",
  });
  
  const watchedEmployment = watch("employment");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employment History</h2>
        <button type="button" onClick={() => append({ employer: "", jobTitle: "", fromDate: "", toDate: "", isCurrent: false })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>
      </div>
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <Briefcase className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No employment entries yet.</p>
          <button type="button" onClick={() => append({ employer: "", jobTitle: "", fromDate: "", toDate: "", isCurrent: false })} className="mt-3 text-xs font-medium text-primary hover:underline">Add first entry</button>
        </div>
      ) : (
        fields.map((emp, idx) => (
          <div key={emp.id} className="border border-border rounded-xl p-4 space-y-3 relative">
            {fields.length > 0 && (
              <button type="button" onClick={() => remove(idx)} className="absolute top-3 right-3 p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <p className="text-xs font-semibold text-muted-foreground">Entry {idx + 1}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Employer Name">
                <input {...register(`employment.${idx}.employer`)} className={inputClass} />
              </Field>
              <Field label="Job Title">
                <input {...register(`employment.${idx}.jobTitle`)} className={inputClass} />
              </Field>
              <Field label="From Date">
                <input type="date" {...register(`employment.${idx}.fromDate`)} className={inputClass} />
              </Field>
              <Field label="To Date">
                <input type="date" {...register(`employment.${idx}.toDate`)} className={inputClass} disabled={watchedEmployment?.[idx]?.isCurrent} />
              </Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(`employment.${idx}.isCurrent`)} className="w-4 h-4 rounded border-input" />
                  <span className="text-sm text-muted-foreground">Currently working here</span>
                </label>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const Step6Skills = () => {
  const { register, watch } = useFormContext<FormData>();
  const testType = watch("languageTestType");
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Skills & Language</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Primary Language">
          <input {...register("primaryLanguage")} className={inputClass} />
        </Field>
        <Field label="English Proficiency">
          <select {...register("englishProficiency")} className={selectClass}>
            <option value="">Select</option>
            {ENGLISH_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Language Test">
          <select {...register("languageTestType")} className={selectClass}>
            {LANGUAGE_TESTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        {testType !== "None" && (
          <>
            <Field label="Test Score">
              <input {...register("testScore")} className={inputClass} placeholder="e.g. 6.5" />
            </Field>
            <Field label="Test Date">
              <input type="date" {...register("testDate")} className={inputClass} />
            </Field>
          </>
        )}
      </div>
      <Field label="Technical Skills">
        <input {...register("technicalSkills")} className={inputClass} placeholder="Comma-separated: e.g. Welding, Electrical, Forklift" />
      </Field>
    </div>
  );
};

const Step7Placement = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>();
  const destCountry = watch("destinationCountry");
  
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Job Placement</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Destination Country" required error={errors.destinationCountry?.message}>
          <select {...register("destinationCountry", {
            onChange: (e) => {
               setValue("visaType", "");
            }
          })} className={selectClass}>
            <option value="">Select</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Visa Type" required error={errors.visaType?.message}>
          <select {...register("visaType")} className={selectClass} disabled={!destCountry}>
            <option value="">Select</option>
            {(VISA_TYPES[destCountry] || []).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Position Applied For">
          <input {...register("positionApplied")} className={inputClass} placeholder="e.g. Care Worker" />
        </Field>
        <Field label="Employer Abroad">
          <input {...register("employerAbroad")} className={inputClass} />
        </Field>
        <Field label="Salary Offered">
          <input type="number" {...register("salaryOffered")} className={inputClass} placeholder="1500" />
        </Field>
        <Field label="Currency">
          <select {...register("currency")} className={selectClass}>
            <option value="USD">USD</option>
            <option value="JPY">JPY</option>
            <option value="AED">AED</option>
            <option value="QAR">QAR</option>
            <option value="AUD">AUD</option>
          </select>
        </Field>
        <Field label="Contract Duration">
          <input {...register("contractDuration")} className={inputClass} placeholder="e.g. 2 years" />
        </Field>
        <Field label="Expected Deployment Date">
          <input type="date" {...register("expectedDeploymentDate")} className={inputClass} />
        </Field>
        <Field label="Agency Fee (NPR)">
          <input type="number" {...register("agencyFee")} className={inputClass} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea {...register("notes")} rows={3} className={inputClass} placeholder="Additional notes..." />
      </Field>
    </div>
  );
};

const Step8Review = ({ setCurrentStep }: { setCurrentStep: (s: number) => void }) => {
  const { watch } = useFormContext<FormData>();
  const form = watch();
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Review & Submit</h2>
      <p className="text-sm text-muted-foreground">Review all information before creating the applicant profile.</p>

      {[
        { title: "Personal Information", step: 1, fields: [
          ["Full Name", form.fullName], ["Date of Birth", form.dateOfBirth], ["Gender", form.gender],
          ["Nationality", form.nationality], ["Marital Status", form.maritalStatus], ["Blood Group", form.bloodGroup],
        ]},
        { title: "Passport & Identity", step: 2, fields: [
          ["Passport #", form.passportNumber], ["Issue Date", form.passportIssueDate],
          ["Expiry Date", form.passportExpiryDate], ["Issuing Country", form.passportIssuingCountry],
        ]},
        { title: "Contact Details", step: 3, fields: [
          ["Mobile", form.mobile], ["Email", form.email], ["Address", `${form.homeAddress}, ${form.city}`],
          ["Emergency Contact", `${form.emergencyContactName} (${form.emergencyRelationship})`],
        ]},
        { title: "Job Placement", step: 7, fields: [
          ["Destination", form.destinationCountry], ["Visa Type", form.visaType],
          ["Position", form.positionApplied], ["Employer", form.employerAbroad],
          ["Salary", `${form.salaryOffered} ${form.currency}`],
        ]},
      ].map((section) => (
        <div key={section.title} className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
            <button type="button" onClick={() => setCurrentStep(section.step)} className="text-xs text-primary hover:underline font-medium">Edit</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {section.fields.map(([label, value]) => (
              <div key={label as string}>
                <p className="text-[11px] text-muted-foreground">{label as string}</p>
                <p className="text-sm font-medium text-foreground">{(value as string) || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Education Summary */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Education ({form.education?.length || 0} entries)</h3>
          <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-primary hover:underline font-medium">Edit</button>
        </div>
        {form.education?.map((edu: any, i: number) => (
          <p key={i} className="text-sm text-muted-foreground">
            {edu.level} — {edu.degreeTitle || "Untitled"} at {edu.institution || "—"} ({edu.graduationYear || "—"})
          </p>
        ))}
      </div>

      {/* Employment Summary */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Employment ({form.employment?.length || 0} entries)</h3>
          <button type="button" onClick={() => setCurrentStep(5)} className="text-xs text-primary hover:underline font-medium">Edit</button>
        </div>
        {form.employment?.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No employment history added</p>
        ) : (
          form.employment?.map((emp: any, i: number) => (
            <p key={i} className="text-sm text-muted-foreground">
              {emp.jobTitle || "—"} at {emp.employer || "—"} ({emp.fromDate} – {emp.isCurrent ? "Present" : emp.toDate})
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default function NewApplicantPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [createApplicant, { isLoading: isSubmitting }] = useCreateApplicantMutation();

  const methods = useForm<FormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: INITIAL_FORM,
    mode: "onBlur",
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createApplicant(data).unwrap();
      addToast("success", "Applicant Created", `${data.fullName} has been added successfully.`);
      router.push("/applicants");
    } catch (err: any) {
      addToast("error", "Error Creating Applicant", err?.data?.error || "Failed to submit application.");
    }
  };

  const goNext = async () => {
    // Validate current step before proceeding
    const fieldsToValidate: Record<number, (keyof FormData)[]> = {
      1: ["fullName", "dateOfBirth", "gender"],
      2: ["passportNumber", "passportIssueDate", "passportExpiryDate"],
      3: ["mobile", "emergencyContactName", "emergencyPhone"],
      7: ["destinationCountry", "visaType"],
    };
    
    const fields = fieldsToValidate[currentStep];
    if (fields) {
      const isValid = await methods.trigger(fields);
      if (!isValid) return;
    }
    
    setCurrentStep((s) => Math.min(s + 1, 8));
  };
  
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Applicant</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Step {currentStep} of {STEPS.length}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto px-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => isComplete && setCurrentStep(step.id)}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? "bg-primary border-primary text-primary-foreground shadow-lg scale-110" : 
                    isComplete ? "bg-emerald-500 border-emerald-500 text-white" : 
                    "bg-muted border-border text-muted-foreground"
                  }`}>
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 -mt-6 transition-colors duration-500 ${step.id < currentStep ? "bg-emerald-500" : "bg-border"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-xl p-6">
          {currentStep === 1 && <Step1Personal />}
          {currentStep === 2 && <Step2Passport />}
          {currentStep === 3 && <Step3Contact />}
          {currentStep === 4 && <Step4Education />}
          {currentStep === 5 && <Step5Employment />}
          {currentStep === 6 && <Step6Skills />}
          {currentStep === 7 && <Step7Placement />}
          {currentStep === 8 && <Step8Review setCurrentStep={setCurrentStep} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Create Applicant
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
