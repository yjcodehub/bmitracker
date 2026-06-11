'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Activity } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getDashboardPath } = useAuthStore();
  const gymName = useThemeStore((s) => s.gymName);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getDashboardPath());
    }
  }, [isLoading, isAuthenticated, router, getDashboardPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">{gymName}</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Body Analysis
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          Track BMI, body composition, and progress for your gym members — all in one mobile-first platform.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/register">Register as Member</Link>
          </Button>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-muted-foreground">
        Powered by BMI Tracker Pro
      </footer>
    </div>
  );
}
