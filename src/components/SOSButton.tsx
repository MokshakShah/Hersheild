"use client";

import { Button } from "../components/ui/button";
import { Siren } from "lucide-react";

export function SOSButton({ onSos }: { onSos: () => void }) {
  return (
    <Button
      className="w-full h-48 text-2xl font-bold rounded-2xl shadow-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-shadow duration-300 animate-pulse"
      onClick={onSos}
    >
      <Siren className="w-12 h-12 mr-4" />
      SEND SOS ALERT
    </Button>
  );
}
