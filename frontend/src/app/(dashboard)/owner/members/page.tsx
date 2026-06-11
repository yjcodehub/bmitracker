"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Member } from "@/types";
import { formatDate } from "@/lib/utils";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    setLoading(true);
    api
      .get<Member[]>(`/members${params}`)
      .then((res) => setMembers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} members`}
        actions={
          <Button asChild size="sm">
            <Link href="/owner/members/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Link>
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members by name, email, or membership number..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">
          Loading members...
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <Link key={m._id} href={`/owner/members/${m._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{m.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.membershipNumber} · {m.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.currentWeight} kg • {m.age} years • {m.gender}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(m.status)}`}
                      >
                        {m.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(m.registrationDate)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {members.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No members found</p>
              <Link href="/owner/members/new">
                <Button size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Member
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
