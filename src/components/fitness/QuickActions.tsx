"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Calendar, Camera } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Plus className="h-6 w-6" />
            <span className="text-sm">Log Workout</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Play className="h-6 w-6" />
            <span className="text-sm">Start Session</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Schedule</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4">
            <Camera className="h-6 w-6" />
            <span className="text-sm">Progress Photo</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}