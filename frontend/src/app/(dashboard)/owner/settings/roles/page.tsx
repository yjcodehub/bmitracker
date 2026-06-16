'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Role, Permission } from '@/types';
import { toast } from 'sonner';
import { Loader2, Plus, Shield, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Selected role to edit/create
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get<Role[]>('/rbac/roles'),
      api.get<Permission[]>('/rbac/permissions')
    ]).then(([rolesRes, permsRes]) => {
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (permsRes.success && permsRes.data) {
        setPermissions(permsRes.data);
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to load RBAC configurations');
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = (role: Role) => {
    setActiveRole(role);
    setIsNew(false);
    setRoleName(role.name);
    setRoleDesc(role.description);
    
    // Map populated permission ids or string ids
    const ids = role.permissionIds.map((p) => typeof p === 'object' ? p._id : p);
    setSelectedPermIds(ids);
  };

  const handleCreateNewClick = () => {
    setActiveRole(null);
    setIsNew(true);
    setRoleName('');
    setRoleDesc('');
    setSelectedPermIds([]);
  };

  const handlePermissionToggle = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post<Role>('/rbac/roles', {
          name: roleName,
          description: roleDesc,
          permissionIds: selectedPermIds
        });
        if (res.success) {
          toast.success('Custom role created successfully');
          loadData();
          setIsNew(false);
          setActiveRole(null);
        }
      } else if (activeRole) {
        const res = await api.put<Role>(`/rbac/roles/${activeRole._id}`, {
          name: roleName,
          description: roleDesc,
          permissionIds: selectedPermIds
        });
        if (res.success) {
          toast.success('Role permissions updated successfully');
          loadData();
          setActiveRole(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role? This action is permanent.')) return;

    try {
      const res = await api.delete(`/rbac/roles/${roleId}`);
      if (res.success) {
        toast.success('Role deleted successfully');
        loadData();
        if (activeRole?._id === roleId) {
          setActiveRole(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  // Group permissions by resource for clean rendering
  const permissionsByResource = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="RBAC & Role Configuration" subtitle="Define gym custom roles and adjust authorization permissions" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Roles List */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Configured Roles</CardTitle>
                <CardDescription>System standard and custom gym roles</CardDescription>
              </div>
              <Button size="sm" onClick={handleCreateNewClick} className="bg-primary hover:bg-primary/95 text-white">
                <Plus className="h-4 w-4 mr-1" />
                Add Role
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => {
                const isSystem = role.isSystem;
                const isActive = activeRole?._id === role._id;

                return (
                  <div
                    key={role._id}
                    className={`p-3.5 border rounded-xl flex justify-between items-center transition-all ${
                      isActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card hover:bg-accent/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{role.name}</span>
                        {isSystem ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary/15 text-secondary-foreground font-mono">System</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 font-mono">Custom</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-[200px] truncate">{role.description || 'No description'}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectRole(role)}
                        className={`h-8 px-2.5 text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {isSystem ? <Shield className="h-3.5 w-3.5 mr-1" /> : <Edit2 className="h-3 w-3 mr-1" />}
                        {isSystem ? 'View' : 'Edit'}
                      </Button>
                      {!isSystem && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRole(role._id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Form Editor */}
        <div className="lg:col-span-7">
          {activeRole || isNew ? (
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isNew ? 'Create New Custom Role' : `Role Editor: ${activeRole?.name}`}
                  </CardTitle>
                  <CardDescription>
                    {isNew ? 'Set role details and select permissions' : activeRole?.isSystem ? 'View authorized access privileges (System Roles cannot be edited)' : 'Modify descriptions and checkboxes'}
                  </CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setActiveRole(null); setIsNew(false); }} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="roleName">Role Display Name</Label>
                        <Input
                          id="roleName"
                          placeholder="e.g. Senior Instructor"
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                          disabled={activeRole?.isSystem}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="roleDesc">Short Description</Label>
                        <Input
                          id="roleDesc"
                          placeholder="What this role handles..."
                          value={roleDesc}
                          onChange={(e) => setRoleDesc(e.target.value)}
                          disabled={activeRole?.isSystem}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Configure Access Privileges</Label>
                        {!activeRole?.isSystem && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPermIds(permissions.map((p) => p._id))}
                              className="text-[10px] text-primary hover:underline font-medium"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedPermIds([])}
                              className="text-[10px] text-muted-foreground hover:underline font-medium"
                            >
                              Deselect All
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Permissions Grid */}
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 border rounded-lg p-3 bg-accent/5">
                        {Object.entries(permissionsByResource).map(([resource, perms]) => (
                          <div key={resource} className="space-y-1.5">
                            <span className="text-[11px] font-bold text-muted-foreground capitalize border-b pb-0.5 block">{resource} Management</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {perms.map((perm) => {
                                const isChecked = selectedPermIds.includes(perm._id);
                                return (
                                  <label
                                    key={perm._id}
                                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                                      isChecked ? 'border-primary/30 bg-primary/5' : 'bg-card hover:bg-accent/15'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={activeRole?.isSystem}
                                      onChange={() => handlePermissionToggle(perm._id)}
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5 shrink-0"
                                    />
                                    <div className="space-y-0.5">
                                      <span className="font-medium text-foreground capitalize">
                                        {perm.action.replace(':', ' ')}
                                      </span>
                                      <p className="text-[10px] text-muted-foreground leading-normal">{perm.description}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!activeRole?.isSystem && (
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving configurations...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {isNew ? 'Create New Role' : 'Save Configurations'}
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-full min-h-[300px]">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">Select a role from the left list or create a new custom role to configure permissions.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
