"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MemberForm } from "@/components/members/MemberForm";
import { api } from "@/lib/api";
import { Member } from "@/types";
import { useParams } from "next/navigation";

export default function StaffEditMemberPage() {
  const params = useParams();
  const memberId = params.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Member>(`/members/${memberId}`)
      .then((res) => setMember(res.data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load member");
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading member details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Error" subtitle="Failed to load member" />
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <PageHeader title="Not Found" subtitle="Member not found" />
        <div className="p-4 text-muted-foreground">
          The member you're looking for doesn't exist.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${member.fullName}`}
        subtitle="Update member information"
      />
      <MemberForm member={member} />
    </div>
  );
}
