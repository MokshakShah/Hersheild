"use client";

import { Button } from "../components/ui/button";
import { Siren } from "lucide-react";

export function SOSButton({ onSos }: { onSos: () => void }) {
  return (
    <Button
      onClick={onSos}
      variant="destructive"
      size="icon"
      aria-label="Send SOS Alert"
      className="rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse w-16 h-16 flex items-center justify-center border-4 border-white"
      style={{ boxShadow: '0 4px 16px rgba(255,0,0,0.25)' }}
    >
      <Siren className="w-8 h-8" />
    </Button>
  );
}
