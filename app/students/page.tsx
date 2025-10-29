"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Phone, Mail, Clock, Calendar, UserX, Trash2, Heart } from "lucide-react";
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
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tutor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  studentCount?: number;
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form state
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
    fetchStudents();
    fetchTutors();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Erreur lors du chargement des étudiants");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutors");
      const data = await response.json();
      setTutors(data);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    }
  };

  const handleOpenDrawer = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      phone: student.phone,
      email: student.email || "",
      dayOfWeek: student.dayOfWeek,
      startTime: student.startTime,
      tutorId: student.tutorId || "",
      isActive: student.isActive,
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedStudent(null);
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    if (!formData.fullName || !formData.phone || !formData.startTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Étudiant modifié avec succès!");
        fetchStudents();
        handleCloseDrawer();
      } else {
        toast.error("Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/students/${deletingStudent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Étudiant supprimé avec succès!");
        fetchStudents();
        setIsDeleteDialogOpen(false);
        setDeletingStudent(null);
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = () => {
    setSelectedStudent(null);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      dayOfWeek: "lundi",
      startTime: "",
      tutorId: "",
      isActive: true,
    });
    setIsDrawerOpen(true);
  };

  const handleCreateNew = async () => {
    if (!formData.fullName || !formData.phone || !formData.startTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Étudiant ajouté avec succès!");
        fetchStudents();
        handleCloseDrawer();
      } else {
        toast.error("Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(query) ||
      student.phone.includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-900">Gestion des Étudiants</h1>
              <p className="text-base text-neutral-600">
                {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? "s" : ""} au total
              </p>
            </div>
            <Button onClick={handleAddNew} className="gap-2 px-6 h-10 text-sm shadow-lg hover:shadow-xl transition-shadow">
              <UserPlus className="w-4 h-4" />
              Ajouter un étudiant
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, téléphone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-sm border-2"
          />
        </div>

        {/* Students Grid - Minimalist Design */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-xl font-bold text-neutral-900 mb-2">
              {searchQuery ? "Aucun étudiant trouvé" : "Aucun étudiant"}
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              {searchQuery
                ? "Essayez une autre recherche"
                : "Commencez par ajouter votre premier étudiant"}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddNew} className="gap-2 h-10 px-6">
                <UserPlus className="w-4 h-4" />
                Ajouter un étudiant
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student, index) => {
              const colors = [
                'bg-gradient-to-br from-blue-400 to-blue-600',
                'bg-gradient-to-br from-green-400 to-green-600',
                'bg-gradient-to-br from-purple-400 to-purple-600',
                'bg-gradient-to-br from-orange-400 to-orange-600',
                'bg-gradient-to-br from-pink-400 to-pink-600'
              ];
              const initial = student.fullName.charAt(0).toUpperCase();
              const avatarColor = colors[index % colors.length];
              
              return (
                <Card 
                  key={student.id} 
                  className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => handleOpenDrawer(student)}
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-neutral-900 truncate mb-1">
                          {student.fullName}
                        </h3>
                        <p className="text-xs text-neutral-500">Posted {index + 1}h ago</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle favorite action
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Info with icons */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate">{student.phone}</span>
                      </div>
                      {student.email && (
                        <div className="flex items-center gap-2 text-xs text-neutral-700">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-medium">{DAY_LABELS[student.dayOfWeek]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-medium">{student.startTime.substring(0, 5)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="secondary" className="bg-neutral-100 text-neutral-700 text-xs px-2 py-0.5">
                        Étudiant
                      </Badge>
                      {student.tutor && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5">
                          Avec tuteur
                        </Badge>
                      )}
                    </div>

                    {/* Separator */}
                    <div className="border-b border-dashed border-neutral-200 my-3" />

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={student.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}
                      >
                        <span className={student.isActive ? "status-dot-active" : "status-dot-inactive"}></span>
                        {student.isActive ? "Actif" : "Inactif"}
                      </Badge>
                      {student.tutor && (
                        <div className="flex items-center gap-2">
                          <AvatarDisplay avatarId={student.tutor.avatarUrl} size="xs" />
                          <span className="text-xs font-medium text-neutral-600">{student.tutor.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit/Add Drawer */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-2xl">
              <DrawerHeader className="pb-4 border-b">
                <DrawerTitle className="text-2xl font-bold">
                  {selectedStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
                </DrawerTitle>
                <DrawerDescription>
                  {selectedStudent ? "Modifiez les informations de l'étudiant" : "Remplissez les informations de l'étudiant"}
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ahmed Ben Ali"
                    className="h-11"
                  />
                </div>

                <div className="space-y-3">
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

                <div className="space-y-3">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
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

                  <div className="space-y-3">
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

                <div className="space-y-3">
                  <Label htmlFor="tutor" className="text-sm font-semibold">Tuteur</Label>
                  <Select
                    value={formData.tutorId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, tutorId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner un tuteur (optionnel)" />
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

                <div className="space-y-3">
                  <Label htmlFor="isActive" className="text-sm font-semibold">Statut</Label>
                  <Select
                    value={formData.isActive ? "active" : "inactive"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isActive: value === "active" })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="border-t pt-4">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseDrawer}
                    disabled={isSaving}
                    className="flex-1 h-12"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={selectedStudent ? handleSave : handleCreateNew}
                    disabled={isSaving}
                    className="flex-1 h-12"
                  >
                    {isSaving ? "Enregistrement..." : selectedStudent ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
                {selectedStudent && (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingStudent(selectedStudent);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-11"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer l'étudiant
                  </Button>
                )}
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Confirmer la suppression</DialogTitle>
              <DialogDescription className="text-base">
                Êtes-vous sûr de vouloir supprimer l'étudiant{" "}
                <span className="font-semibold text-neutral-900">{deletingStudent?.fullName}</span> ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingStudent(null);
                }}
                disabled={isSaving}
                className="h-12 px-8"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
                className="h-12 px-8"
              >
                {isSaving ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
