import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClubAtlas - Super Admin Dashboard",
  description: "System administration and platform management",
};

export default function SuperAdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="superadmin-layout">
      {children}
    </div>
  );
}

