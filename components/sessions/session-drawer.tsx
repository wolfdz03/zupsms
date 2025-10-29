"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, User, Clock, Calendar, Phone, Mail, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AvatarDisplay } from "@/components/ui/avatar-picker";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type Tutor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

type Student = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  dayOfWeek: string;
  startTime: string;
  tutorId: string | null;
  isActive: boolean;
  tutor: Tutor | null;
};

interface SessionDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  tutors: Tutor[];
  onUpdate: (updatedStudent: Student) => void;
}

const DAYS_ORDER = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_LABELS: Record<string, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

export function SessionDrawer({ isOpen, onOpenChange, student, tutors, onUpdate }: SessionDrawerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dayOfWeek: "lundi",
    startTime: "",
    tutorId: "",
    isActive: true,
  });

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName,
        phone: student.phone,
        email: student.email || "",
        dayOfWeek: student.dayOfWeek,
        startTime: student.startTime,
        tutorId: student.tutorId || "",
        isActive: student.isActive,
      });
    }
  }, [student]);

  const handleSave = async () => {
    if (!student) return;

    if (!formData.fullName || !formData.phone || !formData.startTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        onUpdate(updatedStudent);
        toast.success("Session mise à jour avec succès!");
        onOpenChange(false);
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  if (!student) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="pb-4 border-b">
            <DrawerTitle className="text-2xl font-bold">Modifier la session</DrawerTitle>
            <DrawerDescription>Éditer les détails de l'étudiant</DrawerDescription>
          </DrawerHeader>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Student Info Card */}
            <Card className="border-2 shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations de l'étudiant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ahmed Ben Ali"
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33612345678"
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ahmed@example.com"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Session Info Card */}
            <Card className="border-2 shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Détails de la session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek" className="text-sm font-semibold">Jour *</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_ORDER.map((day) => (
                          <SelectItem key={day} value={day}>
                            {DAY_LABELS[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm font-semibold">Heure *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tutor" className="text-sm font-semibold">Tuteur</Label>
                  <Select
                    value={formData.tutorId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, tutorId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner un tuteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun tuteur</SelectItem>
                      {tutors.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-2 shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                  Statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-neutral-900">Statut de la session</p>
                    <p className="text-sm text-neutral-600">
                      {formData.isActive ? "L'étudiant recevra des rappels SMS" : "Aucun rappel SMS"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DrawerFooter className="border-t pt-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="flex-1 h-12"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-12 gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

