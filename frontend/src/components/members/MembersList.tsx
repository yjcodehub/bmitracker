"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Plus, Search, ChevronRight, CheckCircle, Ban, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Member } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

export function MembersList() {
  const role = useAuthStore((s) => s.user?.roleId?.slug || "member");
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"member" | "staff">("member");
  const [loading, setLoading] = useState(true);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
  ];

  const fetchMembers = () => {
    setLoading(true);
    const paramsList: string[] = [];
    if (search) paramsList.push(`search=${encodeURIComponent(search)}`);
    if (status && status !== "all") paramsList.push(`status=${status}`);
    if (role === "owner") paramsList.push(`role=${activeTab}`);
    
    const params = paramsList.length > 0 ? `?${paramsList.join("&")}` : "";
    api
      .get<Member[]>(`/members${params}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMembers(res.data);
        } else {
          setMembers([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [search, status, activeTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to approve this member?")) return;
    try {
      await api.post(`/members/${id}/approve`);
      fetchMembers();
    } catch (err) {
      console.error("Failed to approve member:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "inactive":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "pending_approval":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "archived":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={role === "owner" ? (activeTab === "staff" ? "Staff" : "Members") : "Members"}
        subtitle={`${members.length} ${role === "owner" && activeTab === "staff" ? "staff" : "members"} found`}
        actions={
          <Button asChild size="sm">
            <Link href={`/${role}/members/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Link>
          </Button>
        }
      />

      {role === "owner" && (
        <div className="flex bg-muted/60 p-1 rounded-lg w-fit border border-border">
          <button
            onClick={() => setActiveTab("member")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "member"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "staff"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Staff
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or membership number..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-auto" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center justify-between h-10 w-full md:w-auto px-3 py-2 border rounded-md bg-background text-sm min-w-[160px] text-left hover:bg-accent/50 transition-colors shadow-sm select-none"
          >
            <span>{statuses.find((s) => s.value === status)?.label || "All Statuses"}</span>
            <span className="text-xs text-muted-foreground ml-2">▼</span>
          </button>
          {isStatusOpen && (
            <div className="absolute right-0 z-10 w-full min-w-[160px] mt-1 bg-background border border-border rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setStatus(s.value);
                    setIsStatusOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    status === s.value ? "font-semibold text-primary" : "text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <Link key={m._id} href={`/${role}/members/${m._id}`}>
              <Card className="hover:shadow-sm border hover:border-gray-300 transition-all cursor-pointer">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-accent/10 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-base">{m.fullName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {m.membershipNumber} · {m.email}
                    </p>
                    <div className="flex gap-2 flex-wrap text-xs text-muted-foreground pt-0.5">
                      <span>{m.currentWeight} kg</span>
                      <span>•</span>
                      <span>{m.height} cm</span>
                      <span>•</span>
                      <span>{m.age} yrs</span>
                      <span>•</span>
                      <span className="capitalize">{m.gender}</span>
                      {m.trainerName && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">Trainer: {m.trainerName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${getStatusColor(m.status)}`}
                      >
                        {m.status.replace("_", " ")}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Registered: {formatDate(m.registrationDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.status === "pending_approval" && role === "owner" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleApprove(e, m._id)}
                          className="h-8 text-xs text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {members.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No members found</p>
              <Link href={`/${role}/members/new`}>
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
