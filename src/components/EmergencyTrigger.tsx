import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

interface EmergencyTriggerProps {
  onConfirm: () => void;
  onCancel: () => void;
  triggerType: "double-tap" | "fall";
  enabled: boolean;
}

export function EmergencyTrigger({ onConfirm, onCancel, triggerType, enabled }: EmergencyTriggerProps) {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10 seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (open && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (open && countdown === 0) {
      setOpen(false);
      onConfirm(); // Send SMS
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, countdown, onConfirm]);

  // Call this when double-tap or fall is detected
  const handleTrigger = () => {
    if (enabled) {
      setCountdown(10);
      setOpen(true);
    } else {
      onConfirm(); // Directly send SMS if not enabled
    }
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel(); // Do not send SMS
  };

  return (
    <>
      {/* Call handleTrigger() when double-tap or fall is detected */}
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {triggerType === "fall" ? "Fall Detected" : "Double Tap Detected"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center my-4">
            <p className="mb-2">Sending emergency SMS in <span className="font-bold text-red-600">{countdown}s</span></p>
            <Button variant="outline" onClick={handleCancel} className="bg-red-500 text-white hover:bg-red-600">Stop</Button>
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </>
  );
}
