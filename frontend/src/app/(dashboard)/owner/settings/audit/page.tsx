'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { AuditLog, Pagination } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search, Calendar, User, ShieldAlert, Cpu, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Pagination as CustomPagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filter states
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expand details state
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    let query = `/audit?page=${page}&limit=20`;
    if (action) query += `&action=${action}`;
    if (resource) query += `&resource=${resource}`;
    if (startDate) query += `&startDate=${startDate}`;
    if (endDate) query += `&endDate=${endDate}`;

    api.get<AuditLog[]>(query)
      .then((res) => {
        if (res.success && res.data) {
          setLogs(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load audit logs');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setAction('');
    setResource('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    // Fetch directly after resetting state synchronously or let useEffect trigger
    setTimeout(fetchLogs, 50);
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'update': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'delete': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'approve': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div>
      <PageHeader title="System Audit Logs" subtitle="Track user actions, configuration modifications, and database operations" />

      {/* Filters Card */}
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="resource">Resource</Label>
              <select
                id="resource"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="w-full h-10 border rounded-lg bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Resources</option>
                <option value="member">Members</option>
                <option value="bmi">BMI Records</option>
                <option value="diet">Diet Plans</option>
                <option value="trainer">Trainers</option>
                <option value="staff">Staff Users</option>
                <option value="settings">Settings</option>
                <option value="role">Roles</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="action">Action Type</Label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full h-10 border rounded-lg bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDate">From Date</Label>
              <Input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate">To Date</Label>
              <Input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex gap-2 w-full">
              <Button type="submit" className="flex-1 h-10 bg-primary hover:bg-primary/95 text-white">
                <Search className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilters} className="h-10">Clear</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logs Timeline List */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log._id;
                const userDisplayName = log.userId?.memberId?.fullName || log.userId?.email || 'System Operation';

                return (
                  <div key={log._id} className="p-4 hover:bg-accent/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm">{userDisplayName}</span>
                            <span className={`text-[10px] px-2 py-0.25 border rounded-full font-bold uppercase ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="text-xs text-muted-foreground">on</span>
                            <span className="text-xs font-medium text-foreground bg-accent/40 px-1.5 py-0.5 rounded capitalize">{log.resource}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.createdAt)} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {log.ipAddress && (
                          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground bg-accent/50 px-2 py-0.5 rounded">
                            IP: {log.ipAddress}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpandLog(log._id)}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Collapsible Details */}
                    {isExpanded && (
                      <div className="mt-3 p-3 border rounded-lg bg-accent/10 space-y-2.5 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-muted-foreground block text-[10px] uppercase">Path Request</span>
                            <span className="font-mono text-foreground">{log.metadata?.method || '—'} {log.metadata?.path || '—'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground block text-[10px] uppercase">Browser User-Agent</span>
                            <span className="text-foreground truncate block max-w-md" title={log.userAgent}>{log.userAgent || '—'}</span>
                          </div>
                        </div>

                        {log.resourceId && (
                          <div className="text-xs">
                            <span className="font-semibold text-muted-foreground block text-[10px] uppercase font-mono">Resource Database ID</span>
                            <span className="font-mono text-foreground bg-background px-1.5 py-0.5 rounded border">{log.resourceId}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {logs.length === 0 && (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <ShieldAlert className="h-8 w-8 mb-2 text-muted-foreground/40" />
                  <p className="text-sm">No audit logs matching selection found.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-4">
          <CustomPagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
