import { ReactNode } from "react";
import PlayerBar from "@/components/layout/PlayerBar";

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div style={{ paddingBottom: 110 }}>{children}<PlayerBar /></div>;
}
