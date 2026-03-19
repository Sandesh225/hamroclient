"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  Filter,
  GripVertical,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  Plane,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useGetApplicationsQuery } from "@/store/api/applicantApi";

// ── Types ──
interface BoardApp {
  id: string;
  applicantName: string;
  applicantId: string;
  destination: string;
  jobPosition: string;
  visaType: string;
  status: string;
  daysInStage: number;
  assignedAgent: string;
}

interface PipelineColumn {
  id: string;
  title: string;
  statuses: string[];
  color: string;
}

const COLUMNS: PipelineColumn[] = [
  { id: "new", title: "New", statuses: ["PENDING"], color: "bg-slate-400" },
  { id: "docs", title: "Docs Collecting", statuses: ["DOCUMENTATION_GATHERING"], color: "bg-amber-400" },
  { id: "verify", title: "Verifying", statuses: ["VERIFICATION"], color: "bg-blue-400" },
  { id: "medical", title: "Medical", statuses: ["MEDICAL_PENDING"], color: "bg-orange-400" },
  { id: "submitted", title: "Submitted", statuses: ["VISA_SUBMITTED"], color: "bg-indigo-400" },
  { id: "processing", title: "Processing", statuses: ["PROCESSING"], color: "bg-violet-400" },
  { id: "approved", title: "Approved", statuses: ["APPROVED"], color: "bg-emerald-400" },
  { id: "deployed", title: "Deployed", statuses: ["DEPLOYED"], color: "bg-teal-400" },
  { id: "rejected", title: "Rejected", statuses: ["REJECTED"], color: "bg-red-400" },
];

// ── DnD Card ──
function DraggableCard({ app }: { app: BoardApp }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
    data: app,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? "opacity-40 shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground truncate">
          {app.applicantName}
        </p>
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {app.destination}
        </span>
        <span>•</span>
        <span className="truncate">{app.jobPosition}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-muted-foreground truncate">{app.visaType}</span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            app.daysInStage >= 14
              ? "bg-red-100 text-red-700"
              : app.daysInStage >= 7
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {app.daysInStage}d
        </span>
      </div>
      {app.daysInStage >= 14 && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-red-600 font-semibold">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </div>
      )}
    </div>
  );
}

// ── Droppable Column ──
function DroppableColumn({
  column,
  apps,
}: {
  column: PipelineColumn;
  apps: BoardApp[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[200px] w-[200px] shrink-0 ${
        isOver ? "ring-2 ring-primary/30 rounded-xl" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${column.color}`} />
        <span className="text-xs font-semibold text-foreground">{column.title}</span>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto">
          {apps.length}
        </span>
      </div>
      <div className="space-y-2 flex-1 p-1">
        <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {apps.map((app) => (
            <DraggableCard key={app.id} app={app} />
          ))}
        </SortableContext>
        {apps.length === 0 && (
          <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
            <p className="text-[11px] text-muted-foreground">No applications</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelineBoardPage() {
  const { addToast } = useToast();
  const { data: applicantsResponse, isLoading } = useGetApplicationsQuery({ limit: 100 });
  const [apps, setApps] = useState<BoardApp[]>([]);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [activeItem, setActiveItem] = useState<BoardApp | null>(null);
  const [pendingDrop, setPendingDrop] = useState<{ appId: string; newStatus: string; columnTitle: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useMemo(() => {
    if (applicantsResponse?.data) {
      const mapped = applicantsResponse.data.map((a: any) => ({
        id: a.id,
        applicantName: a.fullName,
        applicantId: a.id,
        destination: a.destinationCountry || "N/A",
        jobPosition: a.jobPosition || "N/A",
        visaType: a.type || "N/A",
        status: a.latestStatus || "PENDING",
        daysInStage: Math.floor((Date.now() - new Date(a.updatedAt).getTime()) / 86400000),
        assignedAgent: "Unassigned",
      }));
      setApps(mapped);
    }
  }, [applicantsResponse?.data]);

  const filtered = useMemo(() => {
    let result = apps;
    if (filterCountry) result = result.filter((a) => a.destination === filterCountry);
    if (filterAgent) result = result.filter((a) => a.assignedAgent === filterAgent);
    return result;
  }, [apps, filterCountry, filterAgent]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as BoardApp);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeApp = apps.find((a) => a.id === active.id);
    const overApp = apps.find((a) => a.id === over.id);

    if (activeApp && overApp && activeApp.status === overApp.status && active.id !== over.id) {
       const oldIndex = apps.findIndex((a) => a.id === active.id);
       const newIndex = apps.findIndex((a) => a.id === over.id);
       setApps((prev) => arrayMove(prev, oldIndex, newIndex));
       return;
    }

    const targetColumn = COLUMNS.find((c) => c.id === over.id) || (overApp ? COLUMNS.find(c => c.statuses.includes(overApp.status)) : undefined);
    if (!targetColumn) return;

    if (!activeApp) return;

    // Check if already in this column
    if (targetColumn.statuses.includes(activeApp.status)) return;

    setPendingDrop({
      appId: activeApp.id,
      newStatus: targetColumn.statuses[0],
      columnTitle: targetColumn.title,
    });
  };

  const confirmDrop = () => {
    if (!pendingDrop) return;
    setApps((prev) =>
      prev.map((a) =>
        a.id === pendingDrop.appId
          ? { ...a, status: pendingDrop.newStatus, daysInStage: 0 }
          : a
      )
    );
    addToast("success", "Status Updated", `Moved to ${pendingDrop.columnTitle}`);
    setPendingDrop(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag and drop to move applications between stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-card border border-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Countries</option>
            {["Japan", "UAE", "Qatar", "Australia", "USA"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-card border border-input text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Agents</option>
            <option value="Anita Shrestha">Anita Shrestha</option>
            <option value="Rajesh Pokharel">Rajesh Pokharel</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold flex items-center justify-center">≤6</span> On track</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 text-amber-700 text-[9px] font-bold flex items-center justify-center">7+</span> Slow</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 text-red-700 text-[9px] font-bold flex items-center justify-center">14+</span> Overdue</span>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {COLUMNS.map((column) => {
              const columnApps = filtered.filter((a) =>
                column.statuses.includes(a.status)
              );
              return (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  apps={columnApps}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeItem && (
            <div className="bg-card border border-primary/30 rounded-lg p-3 shadow-2xl w-[200px] rotate-2">
              <p className="text-sm font-medium text-foreground">
                {activeItem.applicantName}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {activeItem.destination} · {activeItem.jobPosition}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingDrop}
        title="Move Application"
        message={`Are you sure you want to move this application to "${pendingDrop?.columnTitle}"?`}
        confirmLabel="Move"
        variant="default"
        onConfirm={confirmDrop}
        onCancel={() => setPendingDrop(null)}
      />
    </div>
  );
}
