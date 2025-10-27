"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MessageSquare, Users, Activity, Clock, TrendingUp, History, UserPlus, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  smsSentToday: number;
  smsSentThisWeek: number;
  totalTutors: number;
  assignedStudents: number;
  utilizationRate: number;
  upcomingSessions: Array<{
    id: string;
    fullName: string;
    startTime: string;
    dayOfWeek: string;
  }>;
  recentActivity: Array<{
    id: string;
    phone: string;
    message: string;
    status: string;
    sentAt: Date;
  }>;
};

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-elevated">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-3">
              Bonjour Coordinateur 👋
            </h1>
            <p className="text-base text-blue-50 mb-4 max-w-2xl">
              Gérez vos sessions et rappels SMS depuis votre tableau de bord
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
                <p className="text-xs text-blue-100 mb-1">Total Étudiants</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
                <p className="text-xs text-blue-100 mb-1">SMS Aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.smsSentToday || 0}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
                <p className="text-xs text-blue-100 mb-1">Sessions Actives</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.upcomingSessions?.length || 0}
                </p>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full -mb-16"></div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Students */}
          <Card className="border-2 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">Total Étudiants</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats?.totalStudents || 0}
                  </p>
                  <div className="flex gap-2 text-xs flex-wrap">
                    <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                      <span className="status-dot-active"></span>
                      {stats?.activeStudents || 0} actifs
                    </Badge>
                    <Badge variant="secondary">
                      <span className="status-dot-inactive"></span>
                      {stats?.inactiveStudents || 0} inactifs
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Today */}
          <Card className="border-2 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">SMS Aujourd&apos;hui</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats?.smsSentToday || 0}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    {stats?.smsSentThisWeek || 0} cette semaine
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="border-2 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">Sessions Aujourd&apos;hui</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats?.upcomingSessions?.length || 0}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    à venir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="border-2 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">Taux d&apos;activité</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats?.totalStudents
                      ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    étudiants actifs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tutors */}
          <Card className="border-2 shadow-card hover:shadow-card-hover transition-card">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-neutral-600">Tuteurs</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats?.totalTutors || 0}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    {stats?.utilizationRate || 0}% utilisation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Sessions Card */}
          <Link href="/sessions" className="group">
            <Card className="h-full transition-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-300 shadow-card rounded-xl">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-smooth">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base group-hover:text-blue-600 transition-smooth">Sessions</CardTitle>
                  <CardDescription className="text-xs">
                    Gérer les cours
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Consultez et modifiez les sessions hebdomadaires
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Students Card */}
          <Link href="/students" className="group">
            <Card className="h-full transition-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer border-2 hover:border-purple-300 shadow-card rounded-xl">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-smooth">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base group-hover:text-purple-600 transition-smooth">Étudiants</CardTitle>
                  <CardDescription className="text-xs">
                    Gérer étudiants
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Ajouter, modifier ou supprimer
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Tutors Card */}
          <Link href="/tutors" className="group">
            <Card className="h-full transition-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-300 shadow-card rounded-xl">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-smooth">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base group-hover:text-orange-600 transition-smooth">Tuteurs</CardTitle>
                  <CardDescription className="text-xs">
                    Gérer tuteurs
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Assigner et gérer les tuteurs
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* SMS Settings Card */}
          <Link href="/sms-settings" className="group">
            <Card className="h-full transition-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer border-2 hover:border-green-300 shadow-card rounded-xl">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-smooth">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base group-hover:text-green-600 transition-smooth">SMS Settings</CardTitle>
                  <CardDescription className="text-xs">
                    Configurer rappels
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Personnalisez les messages et l&apos;envoi
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Activity Log Card */}
          <Link href="/activity" className="group">
            <Card className="h-full transition-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer border-2 hover:border-indigo-300 shadow-card rounded-xl">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-smooth">
                  <History className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base group-hover:text-indigo-600 transition-smooth">Historique</CardTitle>
                  <CardDescription className="text-xs">
                    Logs des SMS
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Consultez tous les SMS envoyés
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Bottom Section - Upcoming & Recent Activity */}
        <Separator className="my-2" />
        
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Upcoming Sessions */}
          <Card className="border-2 shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">Sessions à venir</CardTitle>
                  <CardDescription className="text-xs">Aujourd&apos;hui</CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.upcomingSessions && stats.upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingSessions.map((session, index) => {
                    const colors = ['bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-green-400 to-green-600', 'bg-gradient-to-br from-purple-400 to-purple-600'];
                    const initial = session.fullName.charAt(0).toUpperCase();
                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border-2 hover:border-neutral-300 transition-card hover:shadow-card"
                      >
                        <div className={`w-10 h-10 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-neutral-900">{session.fullName}</p>
                          <p className="text-xs text-neutral-600 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {session.startTime.substring(0, 5)}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shrink-0 text-xs">
                          À venir
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm font-medium">Aucune session prévue aujourd&apos;hui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-2 shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">Activité récente</CardTitle>
                  <CardDescription className="text-xs">Derniers SMS envoyés</CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border-2 hover:border-neutral-300 transition-card hover:shadow-card"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-neutral-900">{activity.phone}</p>
                          <Badge
                            variant={activity.status === "sent" ? "default" : "destructive"}
                            className={activity.status === "sent" ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" : "text-xs"}
                          >
                            {activity.status === "sent" ? "Envoyé" : "Échec"}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-1">{activity.message}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(activity.sentAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short"
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm font-medium">Aucune activité récente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
