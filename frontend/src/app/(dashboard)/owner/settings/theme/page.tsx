'use client';

import { useEffect, useState, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useThemeStore } from '@/stores/themeStore';
import { toast } from 'sonner';
import { Upload, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  gymName: string;
  footerText: string;
  logo?: string;
}

export default function ThemeSettingsPage() {
  const setThemeStore = useThemeStore((s) => s.setTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [settings, setSettings] = useState<ThemeSettings>({
    primaryColor: '#F97316',
    secondaryColor: '#0A0A0A',
    gymName: 'FitZone Gym',
    footerText: 'Powered by BMI Tracker Pro',
    logo: '',
  });

  useEffect(() => {
    api.get<ThemeSettings>('/settings/theme')
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load theme settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      // Need a raw fetch or api upload support
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/settings/logo`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSettings((prev) => ({ ...prev, logo: data.data.logoUrl }));
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(data.message || 'Logo upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put<ThemeSettings>('/settings/theme', settings);
      if (res.success) {
        setThemeStore({
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          gymName: settings.gymName,
        });
        toast.success('Theme settings saved successfully');
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
      <PageHeader title="Theme Management" subtitle="Branding and appearance settings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form panel */}
        <div className="lg:col-span-7">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Branding Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gymName">Gym / Business Name</Label>
                  <Input
                    id="gymName"
                    name="gymName"
                    value={settings.gymName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="primaryColorPicker"
                        name="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleChange}
                        className="h-10 w-12 p-1 cursor-pointer shrink-0 border rounded-md"
                      />
                      <Input
                        type="text"
                        id="primaryColor"
                        name="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleChange}
                        placeholder="#F97316"
                        maxLength={7}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="secondaryColorPicker"
                        name="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={handleChange}
                        className="h-10 w-12 p-1 cursor-pointer shrink-0 border rounded-md"
                      />
                      <Input
                        type="text"
                        id="secondaryColor"
                        name="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={handleChange}
                        placeholder="#0A0A0A"
                        maxLength={7}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Gym Logo</Label>
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-accent/20">
                    <div className="h-16 w-16 relative rounded-md border bg-card flex items-center justify-center overflow-hidden shrink-0">
                      {settings.logo ? (
                        <Image
                          src={settings.logo.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${settings.logo}` : settings.logo}
                          alt="Gym Logo"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="text-2xl font-bold text-muted-foreground/40">
                          {settings.gymName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG, WebP up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input
                    id="footerText"
                    name="footerText"
                    value={settings.footerText}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Theme Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="sticky top-6 border-dashed border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="border rounded-xl bg-background overflow-hidden shadow-lg select-none">
                {/* Simulated Header */}
                <div
                  className="px-4 py-3 text-white flex justify-between items-center transition-all duration-300"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 relative bg-white/20 rounded flex items-center justify-center text-xs font-bold overflow-hidden">
                      {settings.logo ? (
                        <Image
                          src={settings.logo.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${settings.logo}` : settings.logo}
                          alt="Gym Logo Preview"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        settings.gymName.charAt(0)
                      )}
                    </div>
                    <span className="font-bold text-sm">{settings.gymName}</span>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">U</div>
                </div>

                {/* Simulated Dashboard Content */}
                <div className="p-4 bg-muted/30 space-y-3">
                  <div className="h-4 w-1/3 bg-muted rounded"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 border rounded-lg bg-card space-y-1">
                      <div className="h-2 w-1/2 bg-muted rounded"></div>
                      <div className="h-5 w-2/3 bg-muted rounded"></div>
                    </div>
                    <div className="p-3 border rounded-lg bg-card space-y-1">
                      <div className="h-2 w-1/2 bg-muted rounded"></div>
                      <div className="h-5 w-2/3 bg-muted rounded"></div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg bg-card space-y-2">
                    <div className="h-3 w-1/3 bg-muted rounded"></div>
                    <div className="flex items-end gap-2 h-16 pt-2">
                      <div className="w-full bg-muted rounded-t transition-all duration-300" style={{ height: '30%', backgroundColor: settings.primaryColor }}></div>
                      <div className="w-full bg-muted rounded-t transition-all duration-300 animate-pulse" style={{ height: '70%', backgroundColor: settings.primaryColor }}></div>
                      <div className="w-full bg-muted rounded-t transition-all duration-300" style={{ height: '50%', backgroundColor: settings.primaryColor }}></div>
                    </div>
                  </div>
                </div>

                {/* Simulated Footer */}
                <div
                  className="px-4 py-2.5 text-center text-[10px] text-white/70 transition-all duration-300"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  {settings.footerText}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
