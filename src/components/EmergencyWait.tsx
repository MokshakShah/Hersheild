import React, { useEffect, useState } from "react";

interface EmergencyWaitProps {
  onTimeout: () => void;
  onCancel?: () => void;
  triggerType: "double-tap" | "fall";
}

export function EmergencyWait({ onTimeout, onCancel, triggerType }: EmergencyWaitProps) {
  const [countdown, setCountdown] = useState(10);
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onTimeout();
    }
  }, [countdown, onTimeout]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">
          {triggerType === "fall" ? "Fall Detected" : "Double Tap Detected"}
        </h2>
        <p className="mb-4">Sending emergency SMS in <span className="font-bold text-red-600">{countdown}s</span></p>
        {onCancel && (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
            onClick={onCancel}
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
