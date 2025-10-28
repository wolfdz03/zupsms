"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, CheckSquare, Download, Clock, UserX, Calendar, List, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { AvatarDisplay } from "@/components/ui/avatar-picker";
import { CalendarView } from "@/components/sessions/calendar-view";

type Tutor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

type TutorFilter = {
  id: string;
  name: string;
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

export default function SessionsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<TutorFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{ id: string; currentState: boolean } | null>(
    null
  );
  
  // Filter states
  const [tutorFilter, setTutorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchStudents();
    fetchTutors();
  }, []);

  // Memoized callbacks to prevent infinite loops
  const handleCalendarNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleCalendarViewChange = useCallback((view: string) => {
    // Optional: handle view changes if needed
    console.log("Calendar view changed to:", view);
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Erreur lors du chargement des sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutors");
      const data = await response.json();
      setTutors(data.map((t: Tutor) => ({ id: t.id, name: t.name })));
    } catch (error) {
      console.error("Error fetching tutors:", error);
    }
  };

  const handleToggle = async (studentId: string, currentState: boolean) => {
    // Show confirmation dialog only when deactivating
    if (currentState) {
      setPendingToggle({ id: studentId, currentState });
      setIsConfirmDialogOpen(true);
      return;
    }

    // Directly activate without confirmation
    await performToggle(studentId, currentState);
  };

  const performToggle = async (studentId: string, currentState: boolean) => {
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isActive: !currentState } : s))
    );

    try {
      await fetch(`/api/students/${studentId}/toggle`, {
        method: "PATCH",
      });
      toast.success(
        !currentState ? "Étudiant activé avec succès" : "Étudiant désactivé avec succès"
      );
    } catch (error) {
      console.error("Error toggling student:", error);
      // Revert on error
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isActive: currentState } : s))
      );
      toast.error("Erreur lors de la modification");
    }
  };

  const handleConfirmToggle = async () => {
    if (pendingToggle) {
      await performToggle(pendingToggle.id, pendingToggle.currentState);
      setIsConfirmDialogOpen(false);
      setPendingToggle(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkActivate = async () => {
    const selectedStudents = Array.from(selectedIds);
    let successCount = 0;

    for (const id of selectedStudents) {
      const student = students.find((s) => s.id === id);
      if (student && !student.isActive) {
        try {
          await fetch(`/api/students/${id}/toggle`, { method: "PATCH" });
          successCount++;
        } catch (error) {
          console.error("Error activating student:", error);
        }
      }
    }

    fetchStudents();
    setSelectedIds(new Set());
    toast.success(`${successCount} étudiant(s) activé(s) avec succès`);
  };

  const handleBulkDeactivate = async () => {
    const selectedStudents = Array.from(selectedIds);
    let successCount = 0;

    for (const id of selectedStudents) {
      const student = students.find((s) => s.id === id);
      if (student && student.isActive) {
        try {
          await fetch(`/api/students/${id}/toggle`, { method: "PATCH" });
          successCount++;
        } catch (error) {
          console.error("Error deactivating student:", error);
        }
      }
    }

    fetchStudents();
    setSelectedIds(new Set());
    toast.success(`${successCount} étudiant(s) désactivé(s) avec succès`);
  };

  const handleExport = () => {
    const csv = [
      ["Nom", "Téléphone", "Email", "Jour", "Heure", "Statut"].join(","),
      ...filteredStudents.map((student) =>
        [
          student.fullName,
          student.phone,
          student.email || "",
          DAY_LABELS[student.dayOfWeek],
          student.startTime.substring(0, 5),
          student.isActive ? "Actif" : "Inactif",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sessions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export réussi!");
  };

  // Filter students based on search query and filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search query filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        student.fullName.toLowerCase().includes(query) ||
        student.phone.includes(query) ||
        student.email?.toLowerCase().includes(query);

      // Tutor filter
      const matchesTutor = 
        tutorFilter === "all" || 
        (tutorFilter === "none" && !student.tutorId) ||
        (tutorFilter !== "none" && student.tutorId === tutorFilter);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.isActive) ||
        (statusFilter === "inactive" && !student.isActive);

      // Day filter
      const matchesDay = dayFilter === "all" || student.dayOfWeek === dayFilter;

      return matchesSearch && matchesTutor && matchesStatus && matchesDay;
    });
  }, [students, searchQuery, tutorFilter, statusFilter, dayFilter]);

  // Group students by day
  const studentsByDay = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = filteredStudents.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {} as Record<string, Student[]>);

  // Count total active students
  const activeCount = filteredStudents.filter((s) => s.isActive).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-14 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setTutorFilter("all");
    setStatusFilter("all");
    setDayFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = tutorFilter !== "all" || statusFilter !== "all" || dayFilter !== "all" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto p-8 space-y-10">
        {/* Header */}
        <div className="space-y-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-neutral-900">Sessions</h1>
              <div className="flex items-center gap-4 text-lg">
                <p className="text-neutral-600">
                  {activeCount} étudiant{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""}
                </p>
                {selectedIds.size > 0 && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <p className="font-semibold text-blue-600">
                      {selectedIds.size} sélectionné{selectedIds.size !== 1 ? "s" : ""}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExport} variant="outline" className="gap-2 px-8 h-12 shadow-card hover:shadow-card-hover transition-card">
                <Download className="w-5 h-5" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar")}>
          <div className="flex items-center justify-between gap-4">
            <TabsList className="h-12 bg-white border-2 shadow-card">
              <TabsTrigger value="list" className="gap-2 px-6 h-10">
                <List className="w-4 h-4" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2 px-6 h-10">
                <Calendar className="w-4 h-4" />
                Calendrier
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 h-10 px-4 shadow-card"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 bg-blue-600">
                  {[tutorFilter !== "all" ? 1 : 0, statusFilter !== "all" ? 1 : 0, dayFilter !== "all" ? 1 : 0, searchQuery ? 1 : 0].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="border-2 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-neutral-900">Filtres</h3>
                  <div className="flex gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-2 text-neutral-600 hover:text-neutral-900"
                      >
                        <X className="w-4 h-4" />
                        Réinitialiser
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-900">Tuteur</label>
                    <Select value={tutorFilter} onValueChange={setTutorFilter}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les tuteurs</SelectItem>
                        <SelectItem value="none">Sans tuteur</SelectItem>
                        {tutors.map((tutor) => (
                          <SelectItem key={tutor.id} value={tutor.id}>
                            {tutor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-900">Statut</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="inactive">Inactifs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-900">Jour</label>
                    <Select value={dayFilter} onValueChange={setDayFilter}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les jours</SelectItem>
                        {DAYS_ORDER.map((day) => (
                          <SelectItem key={day} value={day}>
                            {DAY_LABELS[day]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-900">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        type="text"
                        placeholder="Nom, téléphone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="border-2 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-card">
            <CardContent className="p-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 text-lg">
                      {selectedIds.size} étudiant{selectedIds.size !== 1 ? "s" : ""} sélectionné{selectedIds.size !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-blue-700">Choisissez une action</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleBulkActivate} size="sm" className="h-10 px-6 shadow-card">
                    Activer
                  </Button>
                  <Button onClick={handleBulkDeactivate} size="sm" variant="outline" className="h-10 px-6 bg-white hover:bg-neutral-50">
                    Désactiver
                  </Button>
                  <Button
                    onClick={() => setSelectedIds(new Set())}
                    size="sm"
                    variant="ghost"
                    className="h-10 px-6 hover:bg-white/50"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

          <TabsContent value="list" className="mt-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom, téléphone ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-16 text-base border-2 shadow-card"
              />
            </div>

        {/* Select All */}
        {filteredStudents.length > 0 && (
          <div className="flex items-center gap-4 p-5 bg-white rounded-lg border-2 shadow-card">
            <Checkbox
              checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
              onCheckedChange={toggleSelectAll}
              id="select-all"
              className="w-5 h-5"
            />
            <label
              htmlFor="select-all"
              className="text-base font-semibold text-neutral-900 cursor-pointer"
            >
              Tout sélectionner ({filteredStudents.length})
            </label>
          </div>
        )}

        {/* Students Accordion */}
        <Accordion type="multiple" className="space-y-6">
          {DAYS_ORDER.map((day, dayIndex) => {
            const dayStudents = studentsByDay[day];
            if (dayStudents.length === 0) return null;
            
            const dayColors = [
              { border: 'border-l-blue-500', bg: 'bg-blue-50' },
              { border: 'border-l-green-500', bg: 'bg-green-50' },
              { border: 'border-l-purple-500', bg: 'bg-purple-50' },
              { border: 'border-l-orange-500', bg: 'bg-orange-50' },
              { border: 'border-l-pink-500', bg: 'bg-pink-50' },
              { border: 'border-l-indigo-500', bg: 'bg-indigo-50' },
              { border: 'border-l-red-500', bg: 'bg-red-50' }
            ];
            const dayColor = dayColors[dayIndex % dayColors.length];

            return (
              <AccordionItem key={day} value={day} className={`border-2 border-l-4 ${dayColor.border} rounded-lg bg-white shadow-card hover:shadow-card-hover transition-card`}>
                <AccordionTrigger className="px-8 py-6 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-neutral-900">{DAY_LABELS[day]}</span>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {dayStudents.length} étudiant{dayStudents.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-700 hover:bg-green-100 px-4 py-1"
                    >
                      <span className="status-dot-active"></span>
                      {dayStudents.filter((s) => s.isActive).length} actifs
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8">
                  <div className="space-y-4 pt-4">
                    {dayStudents.map((student, studentIndex) => {
                      const colors = [
                        'bg-gradient-to-br from-blue-400 to-blue-600',
                        'bg-gradient-to-br from-green-400 to-green-600',
                        'bg-gradient-to-br from-purple-400 to-purple-600',
                        'bg-gradient-to-br from-orange-400 to-orange-600',
                        'bg-gradient-to-br from-pink-400 to-pink-600'
                      ];
                      const initial = student.fullName.charAt(0).toUpperCase();
                      const avatarColor = colors[studentIndex % colors.length];
                      
                      return (
                        <Card key={student.id} className="border-2 shadow-card hover:shadow-card-hover transition-card rounded-xl">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-5">
                              <Checkbox
                                checked={selectedIds.has(student.id)}
                                onCheckedChange={() => toggleSelect(student.id)}
                                className="w-5 h-5 mt-1"
                              />
                              
                              {/* Main Content */}
                              <div className="flex-1 min-w-0 space-y-4">
                                {/* Student and Tutor Row */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  {/* Student Section */}
                                  <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                                      {initial}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                          Élève
                                        </Badge>
                                      </div>
                                      <h3 className="font-bold text-base text-neutral-900 truncate">
                                        {student.fullName}
                                      </h3>
                                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Clock className="w-3 h-3" />
                                        <span className="font-bold text-neutral-900">{student.startTime.substring(0, 5)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Tutor Section */}
                                  <div className="flex items-start gap-4">
                                    {student.tutor ? (
                                      <>
                                        <AvatarDisplay avatarId={student.tutor.avatarUrl} size="md" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                              Tuteur
                                            </Badge>
                                          </div>
                                          <h3 className="font-bold text-base text-neutral-900 truncate">
                                            {student.tutor.name}
                                          </h3>
                                          <p className="text-sm text-neutral-600 truncate">{student.tutor.email}</p>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                                          <UserX className="w-6 h-6 text-neutral-400" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                              Tuteur
                                            </Badge>
                                          </div>
                                          <h3 className="font-semibold text-base text-neutral-500">
                                            Non assigné
                                          </h3>
                                          <p className="text-sm text-neutral-400">Aucun tuteur</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Status and Contact Info */}
                                <div className="flex items-center gap-4 flex-wrap pt-2 border-t">
                                  <Badge
                                    variant={student.isActive ? "default" : "secondary"}
                                    className={
                                      student.isActive
                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                        : ""
                                    }
                                  >
                                    <span className={student.isActive ? "status-dot-active" : "status-dot-inactive"}></span>
                                    {student.isActive ? "Actif" : "Inactif"}
                                  </Badge>
                                  <span className="text-sm font-medium text-neutral-600">{student.phone}</span>
                                  {student.email && <span className="text-sm text-neutral-500">• {student.email}</span>}
                                </div>
                              </div>
                              
                              {/* Toggle Switch */}
                              <div className="flex items-center gap-3 shrink-0">
                                <Switch
                                  checked={student.isActive}
                                  onCheckedChange={() => handleToggle(student.id, student.isActive)}
                                  className="data-[state=checked]:bg-green-600"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

          {filteredStudents.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-neutral-300" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mb-3">Aucun étudiant trouvé</p>
              <p className="text-base text-neutral-500">
                Essayez de modifier votre recherche
              </p>
            </div>
          )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card className="border-2 shadow-card">
              <CardContent className="p-6">
                <CalendarView
                  students={filteredStudents}
                  currentDate={currentDate}
                  onNavigate={handleCalendarNavigate}
                  onViewChange={handleCalendarViewChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Confirmer la désactivation</DialogTitle>
              <DialogDescription className="text-base">
                Êtes-vous sûr de vouloir désactiver cet étudiant ? Il ne recevra plus de rappels SMS
                automatiques.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setPendingToggle(null);
                }}
                className="h-12 px-8"
              >
                Annuler
              </Button>
              <Button onClick={handleConfirmToggle} className="h-12 px-8">Confirmer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

