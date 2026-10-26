import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to VYNEX AI to sync your conversations and studio history.",
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
