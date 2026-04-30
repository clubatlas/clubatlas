import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClubAtlas - Admin Login",
  description: "Sign in to access your club dashboard",
};

export default function AdminLoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}










