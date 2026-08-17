import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { brand } from "@/lib/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-auth flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <span className="font-[family-name:var(--font-sora)] text-xl font-semibold tracking-tight">
            {brand.name}
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
