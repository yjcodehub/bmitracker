'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { EmailSettings } from '@/types';
import { toast } from 'sonner';
import { Loader2, Check, Send, AlertTriangle } from 'lucide-react';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [settings, setSettings] = useState<EmailSettings>({
    welcomeEmailEnabled: true,
    reportEmailEnabled: true,
    reminderEmailEnabled: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpFrom: '',
  });

  const [password, setPassword] = useState('');

  useEffect(() => {
    api.get<EmailSettings>('/settings/email')
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          if (res.data.hasPassword) {
            setPassword('********');
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load email settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof Pick<EmailSettings, 'welcomeEmailEnabled' | 'reportEmailEnabled' | 'reminderEmailEnabled'>) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    if (!settings.smtpHost || !settings.smtpUser || !password) {
      toast.error('Please fill in SMTP Host, User and Password before testing.');
      return;
    }

    setTesting(true);
    try {
      const res = await api.post('/settings/email/test', {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPassword: password,
      });

      if (res.success) {
        toast.success(res.message || 'SMTP Connection Test Successful!');
      } else {
        toast.error('Connection test failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'SMTP Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put<EmailSettings>('/settings/email', {
        ...settings,
        smtpPassword: password,
      });
      if (res.success) {
        toast.success('Email settings updated successfully');
        if (res.data.hasPassword) {
          setPassword('********');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Email Configuration" subtitle="Set up automated notifications and system SMTP credentials" />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Notification toggles */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Email Triggers</CardTitle>
                <CardDescription>Select which automated emails should be dispatched</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Welcome Email</Label>
                    <p className="text-[10px] text-muted-foreground">Sent to members upon registration</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.welcomeEmailEnabled}
                    onChange={() => handleToggle('welcomeEmailEnabled')}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Analysis Reports</Label>
                    <p className="text-[10px] text-muted-foreground">Emailed when body analysis is recorded</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reportEmailEnabled}
                    onChange={() => handleToggle('reportEmailEnabled')}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Reminders & Updates</Label>
                    <p className="text-[10px] text-muted-foreground">Follow-up gym alerts and weight updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reminderEmailEnabled}
                    onChange={() => handleToggle('reminderEmailEnabled')}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SMTP Config */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom SMTP Configuration</CardTitle>
                <CardDescription>Enable custom mail server delivery instead of system mock mail logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="smtpHost">SMTP Host Server</Label>
                    <Input
                      id="smtpHost"
                      name="smtpHost"
                      placeholder="smtp.mailgun.org"
                      value={settings.smtpHost}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input
                      type="number"
                      id="smtpPort"
                      name="smtpPort"
                      placeholder="587"
                      value={settings.smtpPort}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpUser">Username / Login ID</Label>
                    <Input
                      id="smtpUser"
                      name="smtpUser"
                      placeholder="postmaster@yourdomain.com"
                      value={settings.smtpUser}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input
                      type="password"
                      id="smtpPassword"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="smtpFrom">Sender Address (From Email)</Label>
                  <Input
                    type="email"
                    id="smtpFrom"
                    name="smtpFrom"
                    placeholder="FitZone Gym <no-reply@fitzone.com>"
                    value={settings.smtpFrom}
                    onChange={handleChange}
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 flex gap-3 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    <strong>Note:</strong> If SMTP settings are left blank, the system defaults to logging emails in the backend output stream (Mock Mode) rather than delivering them.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing server...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Test Mail Server Connection
              </>
            )}
          </Button>

          <Button type="submit" className="min-w-[150px]" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
