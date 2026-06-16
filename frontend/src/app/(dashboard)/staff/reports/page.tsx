"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Download, Mail, FileText, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { Pagination as PaginationType } from "@/types";
import { FitnessLoader } from "@/components/ui/FitnessLoader";

interface Report {
  _id: string;
  memberId: {
    _id: string;
    fullName: string;
    membershipNumber: string;
  };
  fileName: string;
  pdfPath: string;
  emailedAt?: string;
  emailedTo?: string;
  createdAt: string;
}

export default function StaffReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [emailingReportId, setEmailingReportId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType | null>(null);

  const fetchReports = () => {
    setLoading(true);
    const paramsList = [];
    paramsList.push(`page=${page}`);
    paramsList.push(`limit=10`);
    if (search) paramsList.push(`search=${encodeURIComponent(search)}`);
    const params = paramsList.length > 0 ? `?${paramsList.join("&")}` : "";

    api
      .get<Report[]>(`/reports${params}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setReports(res.data);
          setPagination(res.pagination || null);
        } else {
          setReports([]);
          setPagination(null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load reports");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchReports();
  }, [page, search]);

  const handleDownload = async (reportId: string, fileName: string) => {
    setDownloadingReportId(reportId);
    try {
      const token = api.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/reports/${reportId}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("File downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF report");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleEmail = async (reportId: string) => {
    setEmailingReportId(reportId);
    try {
      await api.post(`/reports/${reportId}/email`);
      toast.success("Report emailed to member successfully");
      fetchReports(); // Refresh to update emailed status
    } catch (err) {
      console.error(err);
      toast.error("Failed to email report");
    } finally {
      setEmailingReportId(null);
    }
  };



  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/staff")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
      </div>

      <PageHeader
        title="Analysis Reports"
        subtitle={`${reports.length} reports generated`}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by member name or ID..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 min-h-[40vh]">
          <FitnessLoader label="Loading reports..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {reports.map((r) => (
            <Card key={r._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {r.memberId?.fullName || "Deleted Member"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {r.memberId?.membershipNumber || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Generated: {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  {r.emailedAt ? (
                    <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200 self-start sm:self-auto">
                      Emailed on {formatDate(r.emailedAt)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-muted-foreground/10 self-start sm:self-auto">
                      Not emailed yet
                    </span>
                  )}
                  
                  <div className="flex gap-2 mt-2 sm:mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(r._id, r.fileName)}
                      disabled={downloadingReportId === r._id}
                      className="h-8 text-xs flex items-center gap-1.5"
                    >
                      {downloadingReportId === r._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmail(r._id)}
                      disabled={emailingReportId === r._id}
                      className="h-8 text-xs flex items-center gap-1.5"
                    >
                      {emailingReportId === r._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {reports.length === 0 && (
            <div className="text-center text-muted-foreground py-12 bg-card rounded-lg border">
              <p>No reports found matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
          totalItems={pagination.total}
          limit={pagination.limit}
          label="reports"
        />
      )}
    </div>
  );
}
