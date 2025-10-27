"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatars, categories, type AvatarCategory } from "@/lib/avatars";

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarPicker({ selectedAvatarId, onSelect }: AvatarPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AvatarCategory | "all">("all");

  // Filter avatars
  const filteredAvatars = avatars.filter((avatar) => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         avatar.emoji.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || avatar.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-3">
        <Label htmlFor="avatar-search" className="text-base font-semibold">
          Rechercher un avatar
        </Label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            id="avatar-search"
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Catégories</Label>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "h-9",
              selectedCategory === "all" && "bg-orange-500 hover:bg-orange-600"
            )}
          >
            Tous
          </Button>
          {categories.map((category) => (
            <Button
              key={category.value}
              type="button"
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={cn(
                "h-9",
                selectedCategory === category.value && "bg-orange-500 hover:bg-orange-600"
              )}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Sélectionner un avatar
          </Label>
          <Badge variant="secondary" className="text-sm">
            {filteredAvatars.length} avatar{filteredAvatars.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        
        <div className="grid grid-cols-5 gap-3 max-h-80 overflow-y-auto p-2 border-2 rounded-xl bg-neutral-50">
          {filteredAvatars.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onSelect(avatar.id)}
                className={cn(
                  "relative aspect-square rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-card-hover",
                  "border-2 bg-white",
                  isSelected
                    ? "border-orange-500 shadow-card scale-105"
                    : "border-neutral-200 hover:border-orange-300"
                )}
                title={avatar.name}
              >
                <div
                  className={cn(
                    "w-full h-full rounded-lg bg-gradient-to-br",
                    avatar.gradient,
                    "flex items-center justify-center text-3xl"
                  )}
                >
                  {avatar.emoji}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-card">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {filteredAvatars.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-base font-medium">Aucun avatar trouvé</p>
            <p className="text-sm text-neutral-400 mt-1">
              Essayez une autre recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Display component for showing selected avatar
interface AvatarDisplayProps {
  avatarId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarDisplay({ avatarId, size = "md", className }: AvatarDisplayProps) {
  const avatar = avatars.find((a) => a.id === avatarId) || avatars[0];

  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
    xl: "w-32 h-32 text-6xl",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center shadow-card",
        avatar.gradient,
        sizeClasses[size],
        className
      )}
      title={avatar.name}
    >
      {avatar.emoji}
    </div>
  );
}

