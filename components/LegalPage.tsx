import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, subtitle, updated, children }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-600 font-medium">{title}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {subtitle && <p className="text-gray-500 mb-2">{subtitle}</p>}
      {updated && <p className="text-xs text-gray-400 mb-8">Last updated: {updated}</p>}

      <div className="prose prose-gray max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-gray-600 [&_ul]:mb-4 [&_strong]:text-gray-900 [&_a]:text-blue-600 [&_a]:font-medium hover:[&_a]:underline">
        {children}
      </div>
    </div>
  );
}
