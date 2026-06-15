"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, ArrowLeft, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Trainer } from "@/types";
import { useRouter } from "next/navigation";

export default function TrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchTrainers = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    api
      .get<Trainer[]>(`/trainers${params}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTrainers(res.data);
        } else {
          setTrainers([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrainers();
  }, [search]);

  const openAddModal = () => {
    setSelectedTrainer(null);
    setName("");
    setEmail("");
    setPhone("");
    setSpecialization("");
    setIsActive(true);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setName(trainer.name);
    setEmail(trainer.email || "");
    setPhone(trainer.phone || "");
    setSpecialization(trainer.specialization || "");
    setIsActive(trainer.isActive);
    setError("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (trainer: Trainer) => {
    try {
      await api.put(`/trainers/${trainer._id}`, { isActive: !trainer.isActive });
      fetchTrainers();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    try {
      await api.delete(`/trainers/${id}`);
      fetchTrainers();
    } catch (err) {
      console.error("Failed to delete trainer:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    const payload = {
      name,
      email: email || null,
      phone: phone || null,
      specialization: specialization || null,
      isActive,
    };

    try {
      if (selectedTrainer) {
        await api.put(`/trainers/${selectedTrainer._id}`, payload);
      } else {
        await api.post("/trainers", payload);
      }
      setIsModalOpen(false);
      fetchTrainers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trainer");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/owner/settings")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Settings
        </Button>
      </div>

      <PageHeader
        title="Trainers"
        subtitle={`${trainers.length} trainers configured`}
        actions={
          <Button onClick={openAddModal} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Trainer
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trainers by name..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((t) => (
            <Card key={t._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{t.name}</h3>
                      <p className="text-xs text-primary font-medium">{t.specialization || "General Trainer"}</p>
                    </div>
                    <button onClick={() => handleToggleStatus(t)}>
                      {t.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <ToggleRight className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-full border border-gray-200">
                          <ToggleLeft className="h-4 w-4" /> Inactive
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    {t.email && <p><strong>Email:</strong> {t.email}</p>}
                    {t.phone && <p><strong>Phone:</strong> {t.phone}</p>}
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(t)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(t._id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {trainers.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              <p>No trainers found. Click &quot;Add Trainer&quot; to configure your first trainer.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold">{selectedTrainer ? "Edit Trainer" : "Add Trainer"}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="trainer-name">Full Name *</Label>
                  <Input
                    id="trainer-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trainer-specialization">Specialization</Label>
                  <Input
                    id="trainer-specialization"
                    placeholder="e.g. Strength, Cardio, Yoga"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trainer-email">Email</Label>
                  <Input
                    id="trainer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trainer-phone">Phone Number</Label>
                  <Input
                    id="trainer-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="trainer-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={submitLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="trainer-active" className="cursor-pointer">Active Trainer</Label>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={submitLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Trainer"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
