"use client";

import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  onNewApplicant?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  onNewApplicant,
  onSearch,
  onEscape,
}: ShortcutConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // But allow Esc even in inputs
        if (e.key === "Escape" && onEscape) {
          onEscape();
        }
        return;
      }

      // Cmd/Ctrl+K → search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onSearch?.();
        return;
      }

      switch (e.key) {
        case "n":
        case "N":
          if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            onNewApplicant?.();
          }
          break;
        case "s":
        case "S":
          if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            onSearch?.();
          }
          break;
        case "Escape":
          onEscape?.();
          break;
      }
    },
    [onNewApplicant, onSearch, onEscape]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
