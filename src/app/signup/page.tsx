import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free VYNEX AI account and sync your history securely.",
};

export default function SignupPage() {
  return <AuthCard mode="signup" />;
}
