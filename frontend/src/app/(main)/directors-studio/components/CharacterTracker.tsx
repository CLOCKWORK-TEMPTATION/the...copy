"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Eye } from "lucide-react";

interface Character {
  id: string;
  name: string;
  appearances: number;
  consistencyStatus: "good" | "warning" | "issue";
  lastSeen: string;
}

interface CharacterTrackerProps {
  characters: Character[];
}

export default function CharacterTracker({
  characters,
}: CharacterTrackerProps) {
  const getStatusIcon = (status: Character["consistencyStatus"]) => {
    switch (status) {
      case "good":
        return (
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "warning":
        return (
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        );
      case "issue":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: Character["consistencyStatus"]) => {
    switch (status) {
      case "good":
        return "متسق";
      case "warning":
        return "تحذير";
      case "issue":
        return "مشكلة";
    }
  };

  return (
    <Card data-testid="card-character-tracker">
      <CardHeader>
        <CardTitle className="text-right">متابعة الشخصيات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className="flex items-center gap-4 p-4 rounded-md border hover-elevate active-elevate-2"
              data-testid={`character-${character.id}`}
            >
              <Button
                size="icon"
                variant="ghost"
                data-testid={`button-view-${character.id}`}
              >
                <Eye className="w-4 h-4" />
              </Button>

              <div className="flex-1 text-right space-y-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(character.consistencyStatus)}
                    <Badge variant="secondary" className="text-xs">
                      {getStatusLabel(character.consistencyStatus)}
                    </Badge>
                  </div>
                  <h4 className="font-semibold">{character.name}</h4>
                </div>

                <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
                  <span>{character.lastSeen}</span>
                  <span>•</span>
                  <span>{character.appearances} ظهور</span>
                </div>
              </div>

              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg font-semibold">
                  {character.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
