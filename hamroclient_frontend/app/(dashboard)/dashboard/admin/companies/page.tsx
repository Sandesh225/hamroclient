"use client";

import { useState } from "react";
import { useGetCompaniesQuery } from "@/store/api/companyApi";
import { 
  Building2, 
  Users, 
  Network, 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink,
  Mail,
  Phone,
  ArrowUpRight,
  Loader2,
  X,
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import RegisterCompanyForm from "@/components/forms/RegisterCompanyForm";
import CreateBranchForm from "@/components/forms/CreateBranchForm";

export default function CompaniesPage() {
  const { data: companiesData, isLoading, isFetching, refetch } = useGetCompaniesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState<"none" | "register" | "branch">("none");
  const [selectedCompany, setSelectedCompany] = useState<{ id: string, name: string } | null>(null);

  const companies = companiesData?.data || [];
  
  const filteredCompanies = companies.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Agencies", value: companies.length, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Branches", value: companies.reduce((acc, c) => acc + (c._count?.branches || 0), 0), icon: Network, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Staff", value: companies.reduce((acc, c) => acc + (c._count?.users || 0), 0), icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const handleAddBranch = (company: any) => {
    setSelectedCompany({ id: company.id, name: company.businessName });
    setActiveModal("branch");
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm">Loading agency ecosystem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Agency Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and coordinate all manpower agencies registered on the HamroClient platform.
          </p>
        </div>
        <button 
          onClick={() => setActiveModal("register")}
          className="premium-button flex items-center gap-2 group whitespace-nowrap"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Provision New Agency
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-4 relative">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{isFetching ? "..." : stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by agency name or reg number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-4">
            {isFetching && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            Showing {filteredCompanies.length} agencies
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Agency Details</th>
                <th className="px-6 py-4">Registration</th>
                <th className="px-6 py-4 text-center">Structure</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {company.businessName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{company.businessName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                          ID: {company.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground/80">
                      {company.registrationNumber || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-primary">{company._count?.branches || 0}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Branches</span>
                      </div>
                      <div className="w-px h-6 bg-border mx-1" />
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-emerald-600">{company._count?.users || 0}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Staff</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {company.contactEmail && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {company.contactEmail}
                        </div>
                      )}
                      {company.contactPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {company.contactPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAddBranch(company)}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                        title="Add Branch"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                    No agencies found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveModal("none")}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {activeModal === "register" && (
              <RegisterCompanyForm 
                onCancel={() => setActiveModal("none")} 
                onSuccess={() => {
                  refetch();
                  // For "register", we might stay on the success view of the form to show the link
                }} 
              />
            )}


            {activeModal === "branch" && selectedCompany && (
             <div className="max-w-xl mx-auto">
                <CreateBranchForm 
                  companyId={selectedCompany.id}
                  companyName={selectedCompany.name}
                  onCancel={() => setActiveModal("none")}
                  onSuccess={() => {
                    refetch();
                    setActiveModal("none");
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
