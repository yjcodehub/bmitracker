"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Member } from "@/types";
import { api } from "@/lib/api";

interface MemberFormProps {
  member?: Member;
  onSubmit?: (member: Member) => void;
}

export function MemberForm({ member, onSubmit }: MemberFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: member?.fullName || "",
    email: member?.email || "",
    contactNumber: member?.contactNumber || "",
    age: member?.age || "",
    gender: member?.gender || "male",
    height: member?.height || "",
    currentWeight: member?.currentWeight || "",
    idealWeight: member?.idealWeight || "",
    weightLossGoal: member?.weightLossGoal || "",
    membershipNumber: member?.membershipNumber || "",
    trainerName: member?.trainerName || "",
    status: member?.status || "pending_approval",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        age: parseInt(String(formData.age)),
        gender: formData.gender as "male" | "female" | "other",
        height: parseFloat(String(formData.height)),
        currentWeight: parseFloat(String(formData.currentWeight)),
        membershipNumber: formData.membershipNumber,
        trainerName: formData.trainerName,
        status: formData.status as "active" | "inactive" | "pending_approval" | "archived",
        ...(formData.idealWeight && {
          idealWeight: parseFloat(String(formData.idealWeight)),
        }),
        ...(formData.weightLossGoal && {
          weightLossGoal: parseFloat(String(formData.weightLossGoal)),
        }),
      };

      let response;
      if (member?._id) {
        response = await api.put<Member>(`/members/${member._id}`, payload);
      } else {
        response = await api.post<Member>("/members", payload);
      }

      if (onSubmit) {
        onSubmit(response.data);
      } else {
        router.push("/owner/members");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{member ? "Edit Member" : "Add New Member"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="membershipNumber">Membership Number</Label>
              <Input
                id="membershipNumber"
                name="membershipNumber"
                value={formData.membershipNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="trainerName">Trainer Name</Label>
              <Input
                id="trainerName"
                name="trainerName"
                value={formData.trainerName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {member && (
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                name="height"
                type="number"
                min="50"
                max="300"
                value={formData.height}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="currentWeight">Current Weight (kg) *</Label>
              <Input
                id="currentWeight"
                name="currentWeight"
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={formData.currentWeight}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idealWeight">Ideal Weight (kg)</Label>
              <Input
                id="idealWeight"
                name="idealWeight"
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={formData.idealWeight}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="weightLossGoal">Weight Loss Goal (kg)</Label>
              <Input
                id="weightLossGoal"
                name="weightLossGoal"
                type="number"
                min="0"
                step="0.1"
                value={formData.weightLossGoal}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Member"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
