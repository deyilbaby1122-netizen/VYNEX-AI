import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VYNEX AI — Think Beyond Limits",
    template: "%s · VYNEX AI",
  },
  description:
    "VYNEX AI is a futuristic AI workspace: streaming chat, real-time voice, image generation, coding assistance, multilingual replies and cloud history.",
  keywords: [
    "AI assistant",
    "chat",
    "voice AI",
    "image generation",
    "coding assistant",
    "VYNEX",
  ],
  openGraph: {
    title: "VYNEX AI — Think Beyond Limits",
    description:
      "Streaming AI chat, real-time voice, image generation and coding assistance in one premium workspace.",
    type: "website",
    siteName: "VYNEX AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "VYNEX AI — Think Beyond Limits",
    description:
      "Streaming AI chat, real-time voice, image generation and coding assistance in one premium workspace.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-fg">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
