"use client";

import { useState } from "react";
import {
  Users,
  PlusCircle,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Check,
  X,
  Loader2,
  Trash2,
  Edit2,
} from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface UserEntry {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

const MOCK_USERS: UserEntry[] = [
  { id: "u1", name: "Admin User", email: "admin@hamroclient.com", role: "ADMIN", isActive: true, createdAt: "2025-01-01T00:00:00Z", lastLogin: "2026-03-18T08:00:00Z" },
  { id: "u2", name: "Anita Shrestha", email: "anita@hamroclient.com", role: "STAFF", isActive: true, createdAt: "2025-06-15T00:00:00Z", lastLogin: "2026-03-18T04:00:00Z" },
  { id: "u3", name: "Rajesh Pokharel", email: "rajesh@hamroclient.com", role: "STAFF", isActive: true, createdAt: "2025-08-20T00:00:00Z", lastLogin: "2026-03-17T12:00:00Z" },
  { id: "u4", name: "Suman Karki", email: "suman@hamroclient.com", role: "STAFF", isActive: false, createdAt: "2025-03-10T00:00:00Z", lastLogin: "2026-01-05T00:00:00Z" },
];

export default function UserManagementPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState(MOCK_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "STAFF" as "ADMIN" | "STAFF" });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const user: UserEntry = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    setUsers((prev) => [...prev, user]);
    setNewUser({ name: "", email: "", password: "", role: "STAFF" });
    setShowAddModal(false);
    addToast("success", "User Created", `${user.name} has been added as ${user.role}.`);
  };

  const toggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const deleteUser = () => {
    if (!deleteUserId) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
    setDeleteUserId(null);
    addToast("success", "User Deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage staff and admin accounts.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Last Login</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.role === "ADMIN" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {user.role === "ADMIN" ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(user.id)} className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteUserId(user.id)} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                <input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="email@hamroclient.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Initial password" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "ADMIN" | "STAFF" })} className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAddUser} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Create User</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={deleteUser}
        onCancel={() => setDeleteUserId(null)}
      />
    </div>
  );
}
