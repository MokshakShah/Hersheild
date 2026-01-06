"use client";

import { Button } from "../components/ui/button";
import { Siren } from "lucide-react";

export function SOSButton({ onSos }: { onSos: () => void }) {
  return (
    <Button
      onClick={onSos}
      variant="destructive"
      aria-label="Send SOS Alert"
      className="w-full sm:w-32 h-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse flex items-center justify-center border-4 border-white text-xl"
      style={{ boxShadow: '0 4px 16px rgba(255,0,0,0.25)' }}
    >
      <Siren className="w-8 h-8 mr-2" />
      <span className="block sm:hidden font-bold tracking-wide">SOS</span>
    </Button>
  );
}
