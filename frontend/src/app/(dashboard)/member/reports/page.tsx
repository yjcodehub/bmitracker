"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, FileText, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FitnessLoader } from "@/components/ui/FitnessLoader";

interface Report {
  _id: string;
  fileName: string;
  pdfPath: string;
  createdAt: string;
}

export default function MemberReportsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const memberId = user?.memberId?._id;

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;

    setLoading(true);
    api
      .get<Report[]>(`/reports/member/${memberId}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setReports(res.data);
        } else {
          setReports([]);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load reports");
      })
      .finally(() => setLoading(false));
  }, [memberId]);

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

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/member")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
        </Button>
      </div>

      <PageHeader
        title="My Reports"
        subtitle="Download your body analysis history reports"
      />

      {loading ? (
        <div className="flex justify-center items-center py-12 min-h-[40vh]">
          <FitnessLoader label="Loading your reports..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {reports.map((r) => (
            <Card key={r._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      Body Analysis Report
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Generated on {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>

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
              </CardContent>
            </Card>
          ))}

          {reports.length === 0 && (
            <div className="text-center text-muted-foreground py-16 bg-card rounded-lg border border-dashed p-6">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-sm text-foreground">No reports generated yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your trainer will generate reports for you after your analysis sessions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
