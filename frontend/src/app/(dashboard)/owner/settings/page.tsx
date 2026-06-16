'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Palette, Scale, Dumbbell, Mail, Shield, FileText, UserCog, Users } from 'lucide-react';

const settingsLinks = [
  { href: '/owner/settings/theme', label: 'Theme Management', icon: Palette, desc: 'Colors, logo, gym name' },
  { href: '/owner/settings/bmi-rules', label: 'BMI Rules', icon: Scale, desc: 'Classification thresholds' },
  { href: '/owner/settings/body-rules', label: 'Body Composition Rules', icon: Dumbbell, desc: 'Fat, muscle, BMR ranges' },
  { href: '/owner/settings/email', label: 'Email Settings', icon: Mail, desc: 'SMTP and notification toggles' },
  { href: '/owner/settings/roles', label: 'RBAC & Permissions', icon: Shield, desc: 'Role management' },
  { href: '/owner/settings/staff', label: 'Staff Management', icon: Users, desc: 'Manage gym employees & accounts' },
  { href: '/owner/settings/audit', label: 'Audit Logs', icon: FileText, desc: 'System activity & history' },
  { href: '/owner/diet-plans', label: 'Diet Templates', icon: FileText, desc: 'Create and manage diet plans' },
  { href: '/owner/settings/trainers', label: 'Trainer Management', icon: UserCog, desc: 'Manage gym trainers' },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Backoffice" subtitle="System configuration" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
