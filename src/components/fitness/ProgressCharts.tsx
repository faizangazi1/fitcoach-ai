"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Loader2 } from "lucide-react";

export function ProgressCharts() {
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChartData();

    // Listen for workout saves to refresh charts
    const handleWorkoutSaved = () => {
      loadChartData();
    };

    window.addEventListener("workoutSaved", handleWorkoutSaved);
    return () => window.removeEventListener("workoutSaved", handleWorkoutSaved);
  }, []);

  const loadChartData = async () => {
    try {
      const userId = 1;

      // Load weight history
      const weightResponse = await fetch(`/api/weight-history/user/${userId}`);
      if (weightResponse.ok) {
        const weights = await weightResponse.json();
        const formattedWeights = weights.slice(-6).map((w: any, idx: number) => ({
          date: `Week ${idx + 1}`,
          weight: w.weightLbs,
        }));
        setWeightData(formattedWeights);
      }

      // Load workouts for frequency
      const workoutsResponse = await fetch(`/api/workouts/user/${userId}`);
      if (workoutsResponse.ok) {
        const workouts = await workoutsResponse.json();
        
        // Group by day of week
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const workoutsByDay = daysOfWeek.map((day, idx) => {
          const count = workouts.filter((w: any) => new Date(w.date).getDay() === idx).length;
          return { day, workouts: count };
        });
        setWorkoutData(workoutsByDay);

        // Last 7 days calories
        const last7Days = workouts.slice(-7).map((w: any, idx: number) => ({
          date: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }),
          calories: w.caloriesBurned || 0,
        }));
        setCalorieData(last7Days);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className={i === 3 ? "md:col-span-2" : ""}>
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Track your weight over time</CardDescription>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <ChartContainer
              config={{
                weight: {
                  label: "Weight (lbs)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px]"
            >
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-weight)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No weight data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Workout Frequency</CardTitle>
          <CardDescription>Your workout activity this week</CardDescription>
        </CardHeader>
        <CardContent>
          {workoutData.length > 0 ? (
            <ChartContainer
              config={{
                workouts: {
                  label: "Workouts",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px]"
            >
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="workouts" fill="var(--color-workouts)" />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No workout data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Calories Burned</CardTitle>
          <CardDescription>Daily calorie expenditure from workouts</CardDescription>
        </CardHeader>
        <CardContent>
          {calorieData.length > 0 ? (
            <ChartContainer
              config={{
                calories: {
                  label: "Calories",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[250px]"
            >
              <AreaChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="calories"
                  fill="var(--color-calories)"
                  stroke="var(--color-calories)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No calorie data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}