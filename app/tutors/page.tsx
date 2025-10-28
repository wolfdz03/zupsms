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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Pencil, Trash2, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import { AvatarPicker, AvatarDisplay } from "@/components/ui/avatar-picker";
import { getDefaultAvatar } from "@/lib/avatars";

type Tutor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: Date;
  studentCount: number;
};

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<Tutor | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: getDefaultAvatar().id,
  });

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutors");
      const data = await response.json();
      setTutors(data);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast.error("Erreur lors du chargement des tuteurs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (tutor?: Tutor) => {
    if (tutor) {
      setEditingTutor(tutor);
      setFormData({
        name: tutor.name,
        email: tutor.email,
        avatarUrl: tutor.avatarUrl,
      });
    } else {
      setEditingTutor(null);
      setFormData({
        name: "",
        email: "",
        avatarUrl: getDefaultAvatar().id,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTutor(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Veuillez entrer un email valide");
      return;
    }

    setIsSaving(true);
    try {
      if (editingTutor) {
        // Update existing tutor
        const response = await fetch(`/api/tutors/${editingTutor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Tuteur modifié avec succès!");
          fetchTutors();
          handleCloseDialog();
        } else {
          const error = await response.json();
          toast.error(error.error || "Erreur lors de la modification");
        }
      } else {
        // Create new tutor
        const response = await fetch("/api/tutors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Tuteur ajouté avec succès!");
          fetchTutors();
          handleCloseDialog();
        } else {
          const error = await response.json();
          toast.error(error.error || "Erreur lors de l'ajout");
        }
      }
    } catch (error) {
      console.error("Error saving tutor:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTutor) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/tutors/${deletingTutor.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tuteur supprimé avec succès!");
        fetchTutors();
        setIsDeleteDialogOpen(false);
        setDeletingTutor(null);
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting tutor:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTutors = tutors.filter((tutor) => {
    const query = searchQuery.toLowerCase();
    return (
      tutor.name.toLowerCase().includes(query) ||
      tutor.email.toLowerCase().includes(query)
    );
  });


  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-900">Gestion des Tuteurs</h1>
              <p className="text-base text-neutral-600">
                {filteredTutors.length} tuteur{filteredTutors.length !== 1 ? "s" : ""} au total
              </p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()} 
              className="gap-2 px-6 h-10 text-sm shadow-card hover:shadow-card-hover transition-card bg-orange-500 hover:bg-orange-600"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un tuteur
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-sm border-2 shadow-card rounded-lg"
          />
        </div>

        {/* Tutors Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-xl font-bold text-neutral-900 mb-2">
              {searchQuery ? "Aucun tuteur trouvé" : "Aucun tuteur"}
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              {searchQuery
                ? "Essayez une autre recherche"
                : "Commencez par ajouter votre premier tuteur"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => handleOpenDialog()} 
                className="gap-2 h-10 px-6 shadow-card bg-orange-500 hover:bg-orange-600"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter un tuteur
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutors.map((tutor) => {
              return (
                <Card 
                  key={tutor.id} 
                  className="border-2 shadow-card hover:shadow-card-hover hover:border-neutral-300 transition-card rounded-lg"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <AvatarDisplay avatarId={tutor.avatarUrl} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-neutral-900 truncate mb-2">
                          {tutor.name}
                        </h3>
                        <Badge 
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 border-blue-200 border text-xs"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {tutor.studentCount} étudiant{tutor.studentCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <Mail className="w-3.5 h-3.5 text-neutral-600" />
                        </div>
                        <span className="truncate font-medium">{tutor.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        onClick={() => handleOpenDialog(tutor)}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 h-9 text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-smooth rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => {
                          setDeletingTutor(tutor);
                          setIsDeleteDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-smooth rounded-lg"
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader className="space-y-3 pb-4">
              <DialogTitle className="text-3xl font-bold">
                {editingTutor ? "Modifier le tuteur" : "Ajouter un tuteur"}
              </DialogTitle>
              <DialogDescription className="text-base">
                Remplissez les informations du tuteur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-8 py-6">
              {/* Avatar Picker */}
              <AvatarPicker
                selectedAvatarId={formData.avatarUrl}
                onSelect={(avatarId) => setFormData({ ...formData, avatarUrl: avatarId })}
              />

              {/* Name */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Marie Dupont"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="marie@example.com"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCloseDialog} 
                disabled={isSaving} 
                className="h-12 px-8 rounded-xl"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="h-12 px-8 bg-orange-500 hover:bg-orange-600 rounded-xl"
              >
                {isSaving ? "Enregistrement..." : editingTutor ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Confirmer la suppression</DialogTitle>
              <DialogDescription className="text-base">
                Êtes-vous sûr de vouloir supprimer le tuteur{" "}
                <span className="font-semibold text-neutral-900">{deletingTutor?.name}</span> ?
                {deletingTutor && deletingTutor.studentCount > 0 && (
                  <span className="block mt-2 text-orange-600 font-medium">
                    ⚠️ Ce tuteur a {deletingTutor.studentCount} étudiant(s) assigné(s). Ils seront désassignés.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingTutor(null);
                }}
                disabled={isSaving}
                className="h-12 px-8 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
                className="h-12 px-8 rounded-xl"
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

