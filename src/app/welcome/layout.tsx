import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClubAtlas - Welcome",
  description: "Your centralized hub for campus club discovery, events, and personalized recommendations",
};

export default function WelcomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}











