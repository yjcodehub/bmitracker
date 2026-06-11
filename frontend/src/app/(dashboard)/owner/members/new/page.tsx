"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { MemberForm } from "@/components/members/MemberForm";

export default function NewMemberPage() {
  return (
    <div>
      <PageHeader
        title="Add New Member"
        subtitle="Create a new member profile"
      />
      <MemberForm />
    </div>
  );
}
