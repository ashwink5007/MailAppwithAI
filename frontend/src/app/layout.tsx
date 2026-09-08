import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CopilotKitProvider } from "../components/ai/CopilotKitProvider";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NebulaMail | AI-Powered Email Client with Copilot",
  description: "AI-powered email client featuring autonomous Copilot workflows, smart summarization, and interactive thread assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50 text-slate-900 overflow-hidden">
        <AuthProvider>
          <CopilotKitProvider>{children}</CopilotKitProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
