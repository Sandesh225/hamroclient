"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateBranchMutation } from "@/store/api/branchApi";
import { 
  Network, 
  MapPin, 
  Loader2, 
  PlusCircle, 
  X,
  ChevronDown
} from "lucide-react";
import { toast } from "react-hot-toast";

const NEPAL_CITIES = [
  "Kathmandu", "Lalitpur", "Bhaktapur", 
  "Pokhara", "Chitwan", "Biratnagar", 
  "Butwal", "Dharan", "Nepalgunj", 
  "Hetauda", "Janakpur", "Dhangadhi", 
  "Birtamod", "Ilam", "Bharatpur", "Damauli"
].sort();

const branchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  location: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface CreateBranchFormProps {
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateBranchForm({ companyId, companyName, onSuccess, onCancel }: CreateBranchFormProps) {
  const [createBranch, { isLoading }] = useCreateBranchMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
  });

  const onSubmit = async (data: BranchFormValues) => {
    try {
      const result = await createBranch({
        ...data,
        companyId // System Admin override
      }).unwrap();
      
      if (result.success) {
        toast.success(`Branch "${data.name}" created for ${companyName}`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(err.data?.error || "Failed to create branch");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Add New Branch</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              For: <span className="text-foreground">{companyName}</span>
            </p>
          </div>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="space-y-1">
          <label className="text-xs font-medium ml-1 text-muted-foreground">Branch Name</label>
          <div className="relative">
            <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              {...register("name")}
              className="form-input-premium pl-10"
              placeholder="e.g. Butwal Branch, Damak Center..."
              autoFocus
            />
          </div>
          {errors.name && <p className="text-[10px] text-destructive ml-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium ml-1 text-muted-foreground">Location (City)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <select 
              {...register("location")}
              className="form-input-premium pl-10 appearance-none bg-background cursor-pointer"
            >
              <option value="">Select a City (Optional)</option>
              {NEPAL_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="premium-button flex items-center gap-2 py-2 px-6 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Network className="w-4 h-4" />
                Create Branch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
