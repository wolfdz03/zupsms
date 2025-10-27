"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Save, Send, Clock, MessageSquare, AlertCircle, CheckCircle2, Plus, Pencil, Trash2, Star, Copy } from "lucide-react";
import { toast } from "sonner";

type Settings = {
  id: string;
  smsOffsetMinutes: number;
  smsTemplate: string;
};

type MessageTemplate = {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// No presets needed - Sweego templates are managed in the Sweego dashboard

const SMS_CHAR_LIMIT = 160;
const SMS_EXTENDED_LIMIT = 306;

export default function SmsSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [offsetMinutes, setOffsetMinutes] = useState(15);
  const [template, setTemplate] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<MessageTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    content: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data) {
        setSettings(data);
        setOffsetMinutes(data.smsOffsetMinutes);
        setTemplate(data.smsTemplate);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleOpenTemplateDialog = (template?: MessageTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateFormData({
        name: template.name,
        content: template.content,
        isDefault: template.isDefault,
      });
    } else {
      setEditingTemplate(null);
      setTemplateFormData({
        name: "",
        content: "",
        isDefault: false,
      });
    }
    setIsTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async () => {
    if (!templateFormData.name.trim() || !templateFormData.content.trim()) {
      toast.error("Le nom et le contenu sont obligatoires");
      return;
    }

    setIsSaving(true);
    try {
      if (editingTemplate) {
        // Update existing template
        const response = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateFormData),
        });

        if (response.ok) {
          toast.success("Modèle modifié avec succès!");
          fetchTemplates();
          handleCloseTemplateDialog();
        } else {
          toast.error("Erreur lors de la modification");
        }
      } else {
        // Create new template
        const response = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(templateFormData),
        });

        if (response.ok) {
          toast.success("Modèle ajouté avec succès!");
          fetchTemplates();
          handleCloseTemplateDialog();
        } else {
          toast.error("Erreur lors de l'ajout");
        }
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/templates/${deletingTemplate.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Modèle supprimé avec succès!");
        fetchTemplates();
        setIsDeleteDialogOpen(false);
        setDeletingTemplate(null);
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseTemplate = (content: string) => {
    setTemplate(content);
    toast.success("Modèle appliqué!");
  };

  const handleSaveSettings = async () => {
    if (!template.trim()) {
      toast.error("L'ID du modèle ne peut pas être vide");
      return;
    }

    if (offsetMinutes < 5 || offsetMinutes > 120) {
      toast.error("Le délai doit être entre 5 et 120 minutes");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smsOffsetMinutes: offsetMinutes,
          smsTemplate: template,
        }),
      });

      if (response.ok) {
        toast.success("Paramètres enregistrés avec succès!");
        fetchSettings();
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      toast.error("Veuillez entrer un numéro de téléphone");
      return;
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(testPhone.replace(/\s/g, ""))) {
      toast.error("Format de téléphone invalide (utilisez le format international)");
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await fetch("/api/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          template: template,
        }),
      });

      if (response.ok) {
        toast.success("SMS test envoyé avec succès!");
        setTestPhone("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Error sending test SMS:", error);
      toast.error("Erreur lors de l'envoi du SMS");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Preview message (example with Sweego variables)
  const previewMessage = "Merci de vous connecter aux prochaines seances de tutorat chaque lundi a 14:00\nLien connexion: plateforme.zupdeco.org/login\nCode : 123123";

  const charCount = previewMessage.length;
  const smsCount = Math.ceil(charCount / SMS_CHAR_LIMIT);
  const isOverLimit = charCount > SMS_EXTENDED_LIMIT;

  // No validation needed for Sweego template ID
  // Variables are configured in the Sweego dashboard

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto p-8 space-y-10">
        {/* Header */}
        <div className="space-y-6 pt-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-3 flex-1">
              <h1 className="text-5xl font-bold text-neutral-900">SMS Settings</h1>
              <p className="text-xl text-neutral-600">
                Configurez les paramètres des rappels SMS automatiques
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="settings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1 shadow-card">
            <TabsTrigger value="settings" className="gap-2 text-base">
              <Clock className="w-5 h-5" />
              Paramètres
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2 text-base">
              <MessageSquare className="w-5 h-5" />
              Modèles
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2 text-base">
              <Send className="w-5 h-5" />
              Tester
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-8">
            {/* Settings Form */}
            <Card className="border-2 shadow-card">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Configuration des rappels</CardTitle>
                    <CardDescription className="text-base">
                      Définissez quand et comment les étudiants reçoivent leurs rappels
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-10">
                {/* Offset Minutes */}
                <div className="space-y-4">
                  <Label htmlFor="offset" className="text-base font-semibold">
                    Délai de rappel
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="offset"
                      type="number"
                      min="5"
                      max="120"
                      value={offsetMinutes}
                      onChange={(e) => setOffsetMinutes(parseInt(e.target.value))}
                      className="max-w-xs h-12 text-lg"
                    />
                    <span className="text-neutral-600 font-medium">minutes avant le cours</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-neutral-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p>
                      Les SMS seront envoyés automatiquement {offsetMinutes} minutes avant le début
                      de chaque session
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Sweego Template ID */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="template" className="text-base font-semibold">
                      Sweego Template ID
                    </Label>
                  </div>

                  <Input
                    id="template"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder="97775950-fe78-4b1b-98cd-13646067b704"
                    className="text-base p-4 shadow-card font-mono"
                  />
                  
                  <div className="flex items-start gap-2 text-sm text-neutral-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p>
                      L'ID du modèle est géré depuis votre dashboard Sweego. Copiez l'ID depuis{" "}
                      <a href="https://app.sweego.io/templates" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">
                        app.sweego.io/templates
                      </a>
                    </p>
                  </div>

                  {/* Sweego Variables Info */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-neutral-700">Variables utilisées par le système:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg border-2 bg-green-50 border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <code className="text-xs font-mono">{"{{ jour }}"}</code>
                          <p className="text-xs text-neutral-600">Jour de la semaine</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border-2 bg-green-50 border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <code className="text-xs font-mono">{"{{ heure }}"}</code>
                          <p className="text-xs text-neutral-600">Heure du cours</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-neutral-600 bg-neutral-50 p-4 rounded-lg border">
                      <AlertCircle className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                      <p>
                        Assurez-vous que votre modèle Sweego contient ces variables: <code className="font-mono">{"{{ jour }}"}</code> et <code className="font-mono">{"{{ heure }}"}</code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Aperçu du message</Label>
                  <Card className="bg-neutral-100 border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-neutral-500 mt-1 shrink-0" />
                        <p className="text-sm text-neutral-800 leading-relaxed">{previewMessage}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-xs text-neutral-500">
                    Exemple avec: Ahmed Ben Ali, lundi à 14:00
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full gap-2 h-12 text-base"
                  size="lg"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Templates Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Modèles personnalisés</h2>
                <p className="text-neutral-600 mt-1">Gérez vos modèles de messages (stockés localement)</p>
              </div>
              <Button
                onClick={() => handleOpenTemplateDialog()}
                className="gap-2 h-12 px-6 bg-orange-500 hover:bg-orange-600 shadow-card rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Nouveau modèle
              </Button>
            </div>

            {/* Sweego Info */}
            <div className="flex items-start gap-2 text-sm bg-neutral-50 border-2 border-neutral-200 p-4 rounded-lg">
              <AlertCircle className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" />
              <p className="text-neutral-700">
                Les modèles SMS actifs sont gérés depuis{" "}
                <a href="https://app.sweego.io/templates" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">
                  votre dashboard Sweego
                </a>
                . Les modèles ci-dessous sont stockés localement pour référence.
              </p>
            </div>

            {/* Templates Grid */}
            {templates.length === 0 ? (
              <Card className="border-2 shadow-card">
                <CardContent className="p-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-neutral-300" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Aucun modèle personnalisé</h3>
                  <p className="text-neutral-600 mb-6">
                    Créez votre premier modèle pour gagner du temps
                  </p>
                  <Button
                    onClick={() => handleOpenTemplateDialog()}
                    className="gap-2 h-12 px-6 bg-orange-500 hover:bg-orange-600 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Créer un modèle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {templates.map((tmpl) => {
                  const preview = tmpl.content
                    .replace("{{ jour }}", "lundi")
                    .replace("{{ heure }}", "14:00");
                  const charCount = preview.length;
                  const isOverLimit = charCount > SMS_EXTENDED_LIMIT;

                  return (
                    <Card
                      key={tmpl.id}
                      className={`border-2 shadow-card hover:shadow-card-hover transition-card rounded-2xl ${
                        tmpl.isDefault ? "border-orange-300 bg-orange-50" : ""
                      }`}
                    >
                      <CardContent className="p-8 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg text-neutral-900 truncate">
                                {tmpl.name}
                              </h3>
                              {tmpl.isDefault && (
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
                                  <Star className="w-3 h-3" />
                                  Par défaut
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={isOverLimit ? "destructive" : charCount > SMS_CHAR_LIMIT ? "default" : "secondary"}
                                className={!isOverLimit && charCount <= SMS_CHAR_LIMIT ? "bg-green-100 text-green-700" : ""}
                              >
                                {charCount} caractères
                              </Badge>
                              <Badge variant="outline">{Math.ceil(charCount / SMS_CHAR_LIMIT)} SMS</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="space-y-2">
                          <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed bg-neutral-100 p-4 rounded-lg">
                            {preview}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() => handleUseTemplate(tmpl.content)}
                            variant="default"
                            size="sm"
                            className="flex-1 gap-2 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl"
                          >
                            <Copy className="w-4 h-4" />
                            Utiliser
                          </Button>
                          <Button
                            onClick={() => handleOpenTemplateDialog(tmpl)}
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 rounded-xl"
                          >
                            <Pencil className="w-4 h-4" />
                            Modifier
                          </Button>
                          <Button
                            onClick={() => {
                              setDeletingTemplate(tmpl);
                              setIsDeleteDialogOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            {/* Test SMS Card */}
            <Card className="border-2">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Envoyer un SMS test</CardTitle>
                  <CardDescription>
                    Testez votre configuration Sweego en envoyant un SMS
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-start gap-2 text-sm text-neutral-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p>
                    Le message envoyé utilisera le modèle configuré dans Sweego avec les variables <code className="font-mono">{"{{ jour }}"}</code> et <code className="font-mono">{"{{ heure }}"}</code>
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label htmlFor="testPhone" className="text-base font-semibold">
                    Numéro de téléphone
                  </Label>
                  <Input
                    id="testPhone"
                    type="tel"
                    placeholder="+33612345678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-12 text-base"
                  />
                  <div className="flex items-start gap-2 text-sm text-neutral-600 bg-neutral-50 p-4 rounded-lg border">
                    <AlertCircle className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                    <p>Format international recommandé (ex: +33612345678 pour la France)</p>
                  </div>
                </div>

                <Button
                  onClick={handleSendTest}
                  disabled={isSendingTest || !testPhone}
                  className="w-full gap-2 h-12 text-base"
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                  {isSendingTest ? "Envoi en cours..." : "Envoyer le SMS test"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader className="space-y-3 pb-4">
              <DialogTitle className="text-3xl font-bold">
                {editingTemplate ? "Modifier le modèle" : "Nouveau modèle"}
              </DialogTitle>
              <DialogDescription className="text-base">
                Créez un modèle réutilisable pour vos messages SMS
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Name */}
              <div className="space-y-3">
                <Label htmlFor="template-name" className="text-base font-semibold">
                  Nom du modèle *
                </Label>
                <Input
                  id="template-name"
                  value={templateFormData.name}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, name: e.target.value })
                  }
                  placeholder="Ex: Rappel Cours du Matin"
                  className="h-12 rounded-xl"
                />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <Label htmlFor="template-content" className="text-base font-semibold">
                  Contenu du message *
                </Label>
                <Textarea
                  id="template-content"
                  value={templateFormData.content}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Merci de vous connecter aux prochaines seances de tutorat chaque {{ jour }} a {{ heure }}..."
                  className="resize-none text-base p-4 shadow-card"
                />
                
                {/* Variables Helper */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Variables disponibles:</p>
                  <div className="flex gap-2 flex-wrap">
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 font-mono">
                      {"{{ jour }}"}
                    </code>
                    <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 font-mono">
                      {"{{ heure }}"}
                    </code>
                  </div>
                </div>

                {/* Character Count */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      templateFormData.content.length > SMS_EXTENDED_LIMIT
                        ? "destructive"
                        : templateFormData.content.length > SMS_CHAR_LIMIT
                        ? "default"
                        : "secondary"
                    }
                    className={
                      templateFormData.content.length <= SMS_CHAR_LIMIT
                        ? "bg-green-100 text-green-700"
                        : ""
                    }
                  >
                    {templateFormData.content.length} / {SMS_CHAR_LIMIT} caractères
                  </Badge>
                  <Badge variant="outline">
                    {Math.ceil(templateFormData.content.length / SMS_CHAR_LIMIT)} SMS
                  </Badge>
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-orange-50 border-orange-200">
                <input
                  type="checkbox"
                  id="template-default"
                  checked={templateFormData.isDefault}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, isDefault: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-orange-300"
                />
                <div className="flex-1">
                  <Label htmlFor="template-default" className="text-base font-semibold cursor-pointer">
                    Définir comme modèle par défaut
                  </Label>
                  <p className="text-sm text-orange-700 mt-1">
                    Ce modèle sera marqué avec une étoile
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseTemplateDialog}
                disabled={isSaving}
                className="h-12 px-8 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={isSaving || templateFormData.content.length > SMS_EXTENDED_LIMIT}
                className="h-12 px-8 bg-orange-500 hover:bg-orange-600 rounded-xl"
              >
                {isSaving ? "Enregistrement..." : editingTemplate ? "Modifier" : "Créer"}
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
                Êtes-vous sûr de vouloir supprimer le modèle{" "}
                <span className="font-semibold text-neutral-900">{deletingTemplate?.name}</span> ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingTemplate(null);
                }}
                disabled={isSaving}
                className="h-12 px-8 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTemplate}
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
