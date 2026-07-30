"use client";

import { useState } from "react";
import type { Prisma } from "@arqudrix/db";

export function LogMetadata({ metadata }: { metadata: Prisma.JsonValue }) {
  const [expanded, setExpanded] = useState(false);

  if (!metadata || (typeof metadata === "object" && Object.keys(metadata).length === 0)) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const json = JSON.stringify(metadata, null, 2);

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="text-xs font-medium text-brand hover:underline"
      >
        {expanded ? "Hide details" : "View details"}
      </button>
      {expanded && (
        <pre className="mt-2 max-w-xs overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
          {json}
        </pre>
      )}
    </div>
  );
}
