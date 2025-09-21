
// components/poll/Bar.js
import React from "react";

export function Bar({ pct }) {
  return (
    <div className="relative h-8 overflow-hidden rounded-md bg-muted">
      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      <span className="absolute inset-y-0 right-2 flex items-center text-sm font-semibold">{pct}%</span>
    </div>
  );
}

export default Bar;