import type { Metadata } from "next";
import './admin.css';

export const metadata: Metadata = {
  title: "ClubAtlas - Admin",
  description: "Club leadership and management",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}









