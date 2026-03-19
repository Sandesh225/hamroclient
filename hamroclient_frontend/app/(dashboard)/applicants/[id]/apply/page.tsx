import CreateApplicationForm from "@/components/forms/CreateApplicationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewApplicationPage({ params }: { params: { id: string } }) {
  // Try fetching applicant basic details if you want a personalized header
  // Note: this assumes we can hit the DB directly or fetch via internal API
  // For now, we'll just present the form robustly.
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4">
        <Link 
          href={`/applicants`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            New Visa Application
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill out the destination requirements for Applicant ID: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{params.id}</span>
          </p>
        </div>
      </div>

      <div className="bg-background/50 rounded-xl p-1 backdrop-blur-sm">
        <CreateApplicationForm applicantId={params.id} />
      </div>

    </div>
  );
}
