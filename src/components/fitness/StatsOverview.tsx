"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, Flame, Target, TrendingUp, Loader2 } from "lucide-react";

const statIcons = {
  totalWorkouts: Dumbbell,
  caloriesBurned: Flame,
  activeDays: Activity,
  goalsAchieved: Target,
};

const statColors = {
  totalWorkouts: "text-blue-500",
  caloriesBurned: "text-orange-500",
  activeDays: "text-green-500",
  goalsAchieved: "text-purple-500",
};

export function StatsOverview() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Listen for workout saves to refresh stats
    const handleWorkoutSaved = () => {
      loadStats();
    };

    window.addEventListener("workoutSaved", handleWorkoutSaved);
    return () => window.removeEventListener("workoutSaved", handleWorkoutSaved);
  }, []);

  const loadStats = async () => {
    try {
      const userId = 1; // Hardcoded user ID
      const response = await fetch(`/api/stats-overview/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      key: "totalWorkouts",
      title: "Total Workouts",
      value: stats?.totalWorkouts || 0,
      change: "+12%",
    },
    {
      key: "caloriesBurned",
      title: "Calories Burned",
      value: (stats?.caloriesBurned || 0).toLocaleString(),
      change: "+18%",
    },
    {
      key: "activeDays",
      title: "Active Days",
      value: stats?.activeDays || 0,
      change: "+5%",
    },
    {
      key: "goalsAchieved",
      title: "Goals Achieved",
      value: `${stats?.goalsAchieved || 0}/${stats?.goalsTotal || 0}`,
      change: stats?.goalsTotal ? `${Math.round(((stats.goalsAchieved || 0) / stats.goalsTotal) * 100)}%` : "0%",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = statIcons[stat.key as keyof typeof statIcons];
        const color = statColors[stat.key as keyof typeof statColors];
        
        return (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}