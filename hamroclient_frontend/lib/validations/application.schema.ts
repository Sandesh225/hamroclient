import { z } from "zod";

export const applicationSchema = z.object({
  // 1. Strict Universal Fields
  applicantId: z.string().min(1, "Applicant is required"),
  destinationCountry: z.enum(["JAPAN", "UAE", "QATAR", "AUSTRALIA", "USA", "OTHER"]),
  visaType: z.string().min(1, "Visa type is required"),
  jobPosition: z.string().min(1, "Job position is required"),
  employerAbroad: z.string().min(1, "Employer name is required"),
  
  // 2. The Flexible JSON Bucket
  // We use z.record to accept any key-value pairs of strings
  countrySpecificData: z.record(z.string(), z.any()).optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
