import type { Metadata } from "next";
import './login-layout.css';

export const metadata: Metadata = {
  title: "ClubAtlas - Student Login",
  description: "Sign in to explore clubs and events",
};

export default function StudentLoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}











