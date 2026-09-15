"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="premium-page">
      <EmptyState
        icon={AlertTriangle}
        title="โหลดหน้านี้ไม่สำเร็จ"
        detail={error.message || "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง"}
      >
        <Button onClick={reset} icon={RefreshCw} variant="danger">
          Retry
        </Button>
      </EmptyState>
    </div>
  );
}
