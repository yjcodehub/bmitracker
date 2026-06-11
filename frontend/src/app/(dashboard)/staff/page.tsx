'use client';

import Link from 'next/link';
import { Activity, Users, Clock, Plus, UserPlus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaffDashboard() {
  return (
    <div>
      <PageHeader title="Staff Portal" subtitle="Today's overview" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard title="Today" value={0} icon={Activity} />
        <StatCard title="Members" value={0} icon={Users} />
        <StatCard title="Pending" value={0} icon={Clock} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Button asChild variant="outline" className="flex-col h-auto py-4 gap-2">
            <Link href="/staff/bmi/new">
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add BMI</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-col h-auto py-4 gap-2">
            <Link href="/staff/members/new">
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Add Member</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-col h-auto py-4 gap-2">
            <Link href="/staff/reports">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Reports</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No analyses recorded today. Tap &quot;Add BMI&quot; to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
