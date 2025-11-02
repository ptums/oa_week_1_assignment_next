import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";

export const metadata: Metadata = {
  title: "Vim Arcade",
  description: "Learn Vim keybindings through an arcade game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f1020] text-white">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
