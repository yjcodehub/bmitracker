"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { MemberForm } from "@/components/members/MemberForm";

export default function StaffNewMemberPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Add New Member"
        subtitle="Create a new member profile"
      />
      <MemberForm />
    </div>
  );
}
