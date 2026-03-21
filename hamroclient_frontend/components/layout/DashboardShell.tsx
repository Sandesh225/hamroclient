"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import CommandPalette from "@/components/layout/CommandPalette";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { ToastProvider } from "@/components/ui/Toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface DashboardShellProps {
  children: React.ReactNode;
  role: string;
  userName: string;
}

export default function DashboardShell({
  children,
  role,
  userName,
}: DashboardShellProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useKeyboardShortcuts({
    onNewApplicant: () => router.push("/applicants/new"),
    onSearch: () => setSearchOpen(true),
    onEscape: () => {
      setSearchOpen(false);
      setSignOutConfirm(false);
      setMobileMenuOpen(false);
    },
  });

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSignOut = () => {
    setSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <Sidebar
        role={role}
        userName={userName}
        onSignOut={handleSignOut}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-sidebar border-r border-sidebar-border">
            <Sidebar
              role={role}
              userName={userName}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar
          onSearchOpen={() => setSearchOpen(true)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          userName={userName}
          onSignOut={handleSignOut}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Sign Out Confirmation */}
      <ConfirmModal
        isOpen={signOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to log in again to access the dashboard."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutConfirm(false)}
      />
    </div>
  );
}
