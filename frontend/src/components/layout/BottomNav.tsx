'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart3, Settings, User, Plus, FileText, TrendingUp, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ownerNav: NavItem[] = [
  { href: '/owner', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { href: '/owner/members', label: 'Members', icon: <Users className="h-5 w-5" /> },
  { href: '/owner/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/owner/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  { href: '/owner/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const staffNav: NavItem[] = [
  { href: '/staff', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { href: '/staff/members', label: 'Members', icon: <Users className="h-5 w-5" /> },
  { href: '/staff/bmi/new', label: 'Add BMI', icon: <Plus className="h-5 w-5" /> },
  { href: '/staff/reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> },
  { href: '/staff/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const memberNav: NavItem[] = [
  { href: '/member', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { href: '/member/progress', label: 'Progress', icon: <TrendingUp className="h-5 w-5" /> },
  { href: '/member/reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> },
  { href: '/member/diet', label: 'Diet', icon: <Utensils className="h-5 w-5" /> },
  { href: '/member/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const navByRole: Record<UserRole, NavItem[]> = {
  owner: ownerNav,
  staff: staffNav,
  member: memberNav,
};

export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          let isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          // Highlight Settings tab for any nested settings routes (including diet-plans)
          if (item.href === '/owner/settings') {
            isActive = pathname.startsWith('/owner/settings') || pathname.startsWith('/owner/diet-plans');
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors min-w-[56px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
