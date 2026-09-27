import { ReactNode } from "react";
import { ReaderShell } from "./reader-shell";

export default function ReaderLayout({ children }: { children: ReactNode }) {
  return <ReaderShell>{children}</ReaderShell>;
}
