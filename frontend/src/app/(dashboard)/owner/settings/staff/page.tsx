'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { StaffUser, Role, Pagination } from '@/types';
import { toast } from 'sonner';
import { Loader2, Plus, Search, Trash2, Edit2, Check, X, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { Pagination as CustomPagination } from '@/components/ui/pagination';

export default function StaffPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data lists
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchStaff = () => {
    setLoading(true);
    const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
    api.get<StaffUser[]>(`/staff?page=${page}&limit=10${searchParam}`)
      .then((res) => {
        if (res.success && res.data) {
          setStaffList(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load staff list');
        setLoading(false);
      });
  };

  const fetchRoles = () => {
    api.get<Role[]>('/rbac/roles')
      .then((res) => {
        if (res.success && res.data) {
          // Only show non-owner, non-member roles
          const filtered = res.data.filter((r) => r.slug !== 'owner' && r.slug !== 'member');
          setRoles(filtered);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchStaff();
  }, [page]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStaff();
  };

  const handleOpenCreateModal = () => {
    setEditUser(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setSelectedRoleId(roles[0]?._id || '');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEditModal = (user: StaffUser) => {
    setEditUser(user);
    setFullName(user.memberId?.fullName || '');
    setEmail(user.email);
    setPhone(user.phone || '');
    setPassword(''); // leave blank unless changing
    setSelectedRoleId(user.roleId._id);
    setStatus(user.status === 'pending_verification' ? 'active' : user.status === 'active' ? 'active' : 'inactive');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      toast.error('Please assign a security role');
      return;
    }

    setSaving(true);
    try {
      if (editUser) {
        // Update staff user
        const res = await api.put(`/staff/${editUser._id}`, {
          fullName,
          phone,
          roleId: selectedRoleId,
          status,
          ...(password ? { password } : {})
        });
        if (res.success) {
          toast.success('Staff member updated successfully');
          fetchStaff();
          handleCloseModal();
        }
      } else {
        // Create new staff user
        const res = await api.post('/staff', {
          fullName,
          email,
          phone,
          password,
          roleId: selectedRoleId
        });
        if (res.success) {
          toast.success('Staff account created successfully');
          fetchStaff();
          handleCloseModal();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This deletes their account and details permanently.')) return;

    try {
      const res = await api.delete(`/staff/${id}`);
      if (res.success) {
        toast.success('Staff member deleted successfully');
        fetchStaff();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete staff member');
    }
  };

  return (
    <div>
      <PageHeader title="Staff Directory" subtitle="Add and manage gym employees, trainers, and access controls" />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-card"
            />
          </div>
          <Button type="submit" variant="secondary" className="h-10">Search</Button>
        </form>
        <Button onClick={handleOpenCreateModal} className="w-full md:w-auto h-10 bg-primary hover:bg-primary/95 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Table */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-medium">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Contact Information</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staffList.map((user) => (
                <tr key={user._id} className="hover:bg-accent/10 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {(user.memberId?.fullName || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-normal">{user.memberId?.fullName || 'Not Profiled'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {user._id.substring(18)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-foreground font-medium">{user.email}</p>
                    {user.phone && <p className="text-[10px] text-muted-foreground">{user.phone}</p>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      <Shield className="h-3 w-3" />
                      {user.roleId?.name || 'Staff'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      user.status === 'active'
                        ? 'bg-green-500/10 text-green-600'
                        : user.status === 'pending_verification'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {user.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(user)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteStaff(user._id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground">
                    No staff members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl relative">
            <Button
              variant="ghost"
              onClick={handleCloseModal}
              className="absolute right-4 top-4 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-lg">
                {editUser ? 'Edit Staff Profile' : 'Add New Staff Account'}
              </CardTitle>
              <CardDescription>
                {editUser ? 'Update role settings and profile details' : 'Provide login details and set credentials'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="john@fitzone.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!editUser}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="role">Security Role</Label>
                    <select
                      id="role"
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className="w-full h-10 border rounded-lg bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status">Account Status</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                      className="w-full h-10 border rounded-lg bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">
                    {editUser ? 'Change Password (leave blank to keep)' : 'Initial Password'}
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder={editUser ? '••••••••' : 'Password@123'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editUser}
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {editUser ? 'Save Profile' : 'Register Account'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
