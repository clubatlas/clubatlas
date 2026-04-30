import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClubAtlas - Create Student Account",
  description: "Fill in your details to get started",
};

export default function StudentSignupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}











