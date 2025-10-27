"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type SmsLog = {
  id: string;
  phone: string;
  message: string;
  status: string;
  sentAt: Date;
  studentId: string | null;
  studentName: string | null;
};

type LogsResponse = {
  logs: SmsLog[];
  total: number;
  limit: number;
  offset: number;
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [daysFilter, setDaysFilter] = useState("7");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, daysFilter, offset]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        days: daysFilter,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/logs?${params}`);
      const data: LogsResponse = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erreur lors du chargement des logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setOffset(0);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        days: daysFilter,
        limit: "1000",
        offset: "0",
      });

      const response = await fetch(`/api/logs?${params}`);
      const data: LogsResponse = await response.json();

      // Convert to CSV
      const csv = [
        ["Date", "Téléphone", "Étudiant", "Message", "Statut"].join(","),
        ...data.logs.map((log) =>
          [
            new Date(log.sentAt).toLocaleString("fr-FR"),
            log.phone,
            log.studentName || "N/A",
            `"${log.message.replace(/"/g, '""')}"`,
            log.status,
          ].join(",")
        ),
      ].join("\n");

      // Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `sms-logs-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast.success("Export réussi!");
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Erreur lors de l'export");
    }
  };

  const loadMore = () => {
    setOffset(offset + limit);
  };

  const loadPrevious = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-900">Historique SMS</h1>
              <p className="text-base text-neutral-600">
                Consultez tous les SMS envoyés et leur statut
              </p>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2 px-6 h-10 text-sm shadow-card hover:shadow-card-hover transition-card">
              <Download className="w-4 h-4" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-neutral-600">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{total}</p>
                <p className="text-xs text-neutral-500 font-medium">SMS dans la période sélectionnée</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-green-700">Envoyés</p>
                <p className="text-2xl font-bold text-green-900">{sentCount}</p>
                <p className="text-xs text-green-700 font-medium">SMS livrés avec succès</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-red-700">Échoués</p>
                <p className="text-2xl font-bold text-red-900">{failedCount}</p>
                <p className="text-xs text-red-700 font-medium">SMS non livrés</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Filter className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-bold">Filtres</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-900">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Téléphone ou message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-900">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="sent">Envoyés</SelectItem>
                    <SelectItem value="failed">Échoués</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Days Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-900">Période</label>
                <Select value={daysFilter} onValueChange={setDaysFilter}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Aujourd&apos;hui</SelectItem>
                    <SelectItem value="7">7 derniers jours</SelectItem>
                    <SelectItem value="30">30 derniers jours</SelectItem>
                    <SelectItem value="90">90 derniers jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full md:w-auto px-8 h-10 text-sm shadow-card">
              Appliquer les filtres
            </Button>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card className="border-2 shadow-card">
          <CardHeader className="pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Messages ({total})</CardTitle>
              <CardDescription className="text-sm">
                Affichage de {Math.min(offset + 1, total)} à {Math.min(offset + limit, total)} sur {total}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-xl font-bold text-neutral-900 mb-2">Aucun SMS trouvé</p>
                <p className="text-sm text-neutral-500">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`relative pl-6 p-4 rounded-lg border-l-4 ${
                        log.status === "sent" ? "border-l-green-500 bg-green-50/50" : "border-l-red-500 bg-red-50/50"
                      } border-2 hover:shadow-card transition-card`}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-1.5 top-6 w-2.5 h-2.5 rounded-full ${
                        log.status === "sent" ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                      
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${
                          log.status === "sent" 
                            ? "bg-gradient-to-br from-green-400 to-green-600" 
                            : "bg-gradient-to-br from-red-400 to-red-600"
                        } flex items-center justify-center text-white font-bold shrink-0`}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="space-y-0.5">
                              <p className="font-bold text-base text-neutral-900">
                                {log.studentName || log.phone}
                              </p>
                              {log.studentName && (
                                <p className="text-xs text-neutral-600 font-medium">{log.phone}</p>
                              )}
                            </div>
                            <Badge
                              variant={log.status === "sent" ? "default" : "destructive"}
                              className={`px-3 py-0.5 text-xs ${
                                log.status === "sent"
                                  ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-300"
                                  : ""
                              }`}
                            >
                              {log.status === "sent" ? "✓ Envoyé" : "✗ Échec"}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-700 leading-relaxed bg-white/80 p-3 rounded-lg">
                            {log.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(log.sentAt).toLocaleString("fr-FR", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="flex items-center justify-between pt-4 border-t-2">
                    <Button
                      onClick={loadPrevious}
                      disabled={offset === 0}
                      variant="outline"
                      className="px-6 h-10 text-sm shadow-card disabled:opacity-50"
                    >
                      ← Précédent
                    </Button>
                    <p className="text-sm font-semibold text-neutral-900">
                      Page {Math.floor(offset / limit) + 1} sur {Math.ceil(total / limit)}
                    </p>
                    <Button
                      onClick={loadMore}
                      disabled={offset + limit >= total}
                      variant="outline"
                      className="px-6 h-10 text-sm shadow-card disabled:opacity-50"
                    >
                      Suivant →
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

