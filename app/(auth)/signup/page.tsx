import { redirect } from "next/navigation";

/** Public signup is disabled — only admins can create accounts. */
export default function SignupPage() {
  redirect("/login");
}
