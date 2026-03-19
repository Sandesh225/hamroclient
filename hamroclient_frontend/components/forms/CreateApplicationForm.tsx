"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, ApplicationFormValues } from "@/lib/validations/application.schema";
import { Loader2, Plus, Globe } from "lucide-react";

export default function CreateApplicationForm({ applicantId }: { applicantId: string }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantId: applicantId,
      countrySpecificData: {},
    },
  });

  const selectedCountry = watch("destinationCountry");

  const onSubmit = async (data: ApplicationFormValues) => {
    // data.countrySpecificData automatically contains the nested extra fields!
    console.log("Submitting to API:", data);
    
    // Example: Call your RTK Query mutation or Server Action here
    // await createApplicationMutation(data);
    alert("Application structure built successfully. Check console for payload.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card border border-border p-6 sm:p-8 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Plus className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Create Visa Application</h2>
      </div>

      {/* --- UNIVERSAL FIELDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-1">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Destination Country
          </label>
          <select 
            {...register("destinationCountry")} 
            className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          >
            <option value="">Select Target Country...</option>
            <option value="JAPAN">Japan</option>
            <option value="UAE">UAE (Dubai, Abu Dhabi)</option>
            <option value="QATAR">Qatar</option>
            <option value="AUSTRALIA">Australia</option>
            <option value="USA">United States</option>
            <option value="OTHER">Other / Generic</option>
          </select>
          {errors.destinationCountry && <span className="text-destructive text-xs">{errors.destinationCountry.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Job Position</label>
          <input 
            {...register("jobPosition")} 
            className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="e.g. Scaffolder, IT Engineer" 
          />
          {errors.jobPosition && <span className="text-destructive text-xs">{errors.jobPosition.message}</span>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Visa Type / Category</label>
          <input 
            {...register("visaType")} 
            className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="e.g. SSW, General Work, H-1B" 
          />
          {errors.visaType && <span className="text-destructive text-xs">{errors.visaType.message}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Employer Abroad (Sponsor)</label>
          <input 
            {...register("employerAbroad")} 
            className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="Company Name / Sponsor Name" 
          />
          {errors.employerAbroad && <span className="text-destructive text-xs">{errors.employerAbroad.message}</span>}
        </div>
      </div>

      {/* --- DYNAMIC FIELDS (Powered by the JSON column) --- */}
      {selectedCountry && selectedCountry !== "OTHER" && (
        <div className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
          
          {selectedCountry === "JAPAN" && (
            <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/20">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <span className="text-xl">🇯🇵</span> Japan Specific Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">JLPT / NAT Level</label>
                  <select 
                    {...register("countrySpecificData.jlptLevel")} 
                    className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  >
                    <option value="">Select Level...</option>
                    <option value="N4">N4 (Required for SSW)</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="NONE">Not Required</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">COE Application Date</label>
                  <input 
                    type="date" 
                    {...register("countrySpecificData.coeApplicationDate")} 
                    className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all scheme-light dark:scheme-dark" 
                  />
                </div>
              </div>
            </div>
          )}

          {selectedCountry === "UAE" && (
            <div className="bg-emerald-500/5 p-6 rounded-xl border border-emerald-500/20">
              <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <span className="text-xl">🇦🇪</span> UAE Specific Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">MOHRE Skill Level</label>
                  <select 
                    {...register("countrySpecificData.mohreSkillLevel")} 
                    className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    <option value="">Select Skill Level...</option>
                    <option value="1">Level 1 (Degree)</option>
                    <option value="2">Level 2 (Diploma)</option>
                    <option value="3">Level 3 (Skilled)</option>
                    <option value="4">Level 4 (Unskilled)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">MOHRE Permit/Offer Number</label>
                  <input 
                    type="text" 
                    {...register("countrySpecificData.mohrePermitNumber")} 
                    className="w-full border border-input bg-background p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                    placeholder="e.g. 100239482"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add more countries here (QATAR ID, ImmiAccount for AUS, etc) as needed */}
        </div>
      )}

      {/* Form Action */}
      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-semibold hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            "Create Application"
          )}
        </button>
      </div>
    </form>
  );
}
