"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Pencil, Trash2, Phone, Mail, Clock, Calendar, UserX } from "lucide-react";
import { toast } from "sonner";
import { AvatarDisplay } from "@/components/ui/avatar-picker";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
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

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        fullName: student.fullName,
        phone: student.phone,
        email: student.email || "",
        dayOfWeek: student.dayOfWeek,
        startTime: student.startTime,
        tutorId: student.tutorId || "",
        isActive: student.isActive,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        dayOfWeek: "lundi",
        startTime: "",
        tutorId: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone || !formData.startTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);
    try {
      if (editingStudent) {
        // Update existing student
        const response = await fetch(`/api/students/${editingStudent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Étudiant modifié avec succès!");
          fetchStudents();
          handleCloseDialog();
        } else {
          toast.error("Erreur lors de la modification");
        }
      } else {
        // Create new student
        const response = await fetch("/api/students/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Étudiant ajouté avec succès!");
          fetchStudents();
          handleCloseDialog();
        } else {
          toast.error("Erreur lors de l'ajout");
        }
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
            <Button onClick={() => handleOpenDialog()} className="gap-2 px-6 h-10 text-sm shadow-card hover:shadow-card-hover transition-card">
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
            className="pl-10 h-11 text-sm border-2 shadow-card"
          />
        </div>

        {/* Students Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
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
              <Button onClick={() => handleOpenDialog()} className="gap-2 h-10 px-6 shadow-card">
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
                <Card key={student.id} className="border-2 shadow-card hover:shadow-card-hover hover:border-neutral-300 transition-card">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-neutral-900 truncate mb-1.5">
                          {student.fullName}
                        </h3>
                        <Badge 
                          variant={student.isActive ? "default" : "secondary"} 
                          className={student.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" : "text-xs"}
                        >
                          <span className={student.isActive ? "status-dot-active" : "status-dot-inactive"}></span>
                          {student.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5 text-neutral-600" />
                        </div>
                        <span className="truncate font-medium">{student.phone}</span>
                      </div>
                      {student.email && (
                        <div className="flex items-center gap-2 text-xs text-neutral-700">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                            <Mail className="w-3.5 h-3.5 text-neutral-600" />
                          </div>
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        </div>
                        <span className="font-medium">{DAY_LABELS[student.dayOfWeek]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5 text-neutral-600" />
                        </div>
                        <span className="font-medium">{student.startTime.substring(0, 5)}</span>
                      </div>
                      
                      {/* Tutor Info */}
                      {student.tutor ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                          <AvatarDisplay avatarId={student.tutor.avatarUrl} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-orange-600 font-semibold">Tuteur</p>
                            <p className="text-xs font-bold text-orange-900 truncate">{student.tutor.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-100 border border-neutral-200">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                            <UserX className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 font-semibold">Aucun tuteur</p>
                            <p className="text-xs text-neutral-600">Non assigné</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        onClick={() => handleOpenDialog(student)}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 h-9 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-smooth"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => {
                          setDeletingStudent(student);
                          setIsDeleteDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-smooth"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-3xl font-bold">
                {editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
              </DialogTitle>
              <DialogDescription className="text-base">
                Remplissez les informations de l&apos;étudiant
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-base font-semibold">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ahmed Ben Ali"
                  className="h-12"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33612345678"
                  className="h-12"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmed@example.com"
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="dayOfWeek" className="text-base font-semibold">Jour *</Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                  >
                    <SelectTrigger className="h-12">
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
                  <Label htmlFor="startTime" className="text-base font-semibold">Heure *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="tutor" className="text-base font-semibold">Tuteur</Label>
                <Select
                  value={formData.tutorId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, tutorId: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="h-12">
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
                <Label htmlFor="isActive" className="text-base font-semibold">Statut</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "active" })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving} className="h-12 px-8">
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="h-12 px-8">
                {isSaving ? "Enregistrement..." : editingStudent ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Confirmer la suppression</DialogTitle>
              <DialogDescription className="text-base">
                Êtes-vous sûr de vouloir supprimer l&apos;étudiant{" "}
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

