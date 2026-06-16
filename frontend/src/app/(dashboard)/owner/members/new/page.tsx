"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { MemberForm } from "@/components/members/MemberForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function NewMemberPageContent() {
  const searchParams = useSearchParams();
  const formRole = searchParams.get("role") || "member";

  return (
    <div>
      <PageHeader
        title={formRole === "staff" ? "Add New Staff" : "Add New Member"}
        subtitle={formRole === "staff" ? "Create a new staff profile" : "Create a new member profile"}
      />
      <MemberForm forcedRole={formRole as "member" | "staff"} />
    </div>
  );
}

export default function NewMemberPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewMemberPageContent />
    </Suspense>
  );
}
