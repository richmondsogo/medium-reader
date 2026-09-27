"use client";

import { useEffect } from "react";
import { markArticleRead } from "@/server/actions";

interface MarkReadOnViewProps {
  id: number;
  isRead: boolean;
}

export function MarkReadOnView({ id, isRead }: MarkReadOnViewProps) {
  useEffect(() => {
    if (!isRead) {
      void markArticleRead(id);
    }
  }, [id, isRead]);

  return null;
}
