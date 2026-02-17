"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export function WorkoutLogger() {
  const [workoutType, setWorkoutType] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    sets: 3,
    reps: 10,
    weight: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const addExercise = () => {
    if (currentExercise.name) {
      setExercises([
        ...exercises,
        { ...currentExercise, id: Date.now().toString() },
      ]);
      setCurrentExercise({ name: "", sets: 3, reps: 10, weight: 0 });
    }
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const saveWorkout = async () => {
    if (!workoutType || exercises.length === 0) {
      toast.error("Please select a workout type and add at least one exercise");
      return;
    }

    setIsSaving(true);
    try {
      // Use hardcoded userId = 1 for now
      const userId = 1;

      // Create workout
      const workoutResponse = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workoutType,
          durationMinutes,
          caloriesBurned,
          date: new Date().toISOString(),
          notes: `${exercises.length} exercises completed`,
        }),
      });

      if (!workoutResponse.ok) {
        throw new Error("Failed to save workout");
      }

      const workout = await workoutResponse.json();

      // Create exercises for the workout
      const exercisePromises = exercises.map((exercise) =>
        fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutId: workout.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weightLbs: exercise.weight,
          }),
        })
      );

      await Promise.all(exercisePromises);

      // Update stats
      await fetch(`/api/stats-overview/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalWorkouts: 1, // This will be incremented
          caloriesBurned,
          activeDays: 1,
        }),
      });

      toast.success("Workout logged successfully! 💪");
      
      // Reset form
      setExercises([]);
      setWorkoutType("");
      setDurationMinutes(30);
      setCaloriesBurned(0);

      // Trigger page refresh to update stats
      window.dispatchEvent(new Event("workoutSaved"));
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log New Workout</CardTitle>
        <CardDescription>Track your exercises and progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="workout-type">Workout Type</Label>
            <Select value={workoutType} onValueChange={setWorkoutType}>
              <SelectTrigger id="workout-type">
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="calories">Calories Burned (estimate)</Label>
            <Input
              id="calories"
              type="number"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <h4 className="font-semibold">Add Exercise</h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                placeholder="e.g., Bench Press"
                value={currentExercise.name}
                onChange={(e) =>
                  setCurrentExercise({ ...currentExercise, name: e.target.value })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={currentExercise.sets}
                onChange={(e) =>
                  setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                value={currentExercise.reps}
                onChange={(e) =>
                  setCurrentExercise({ ...currentExercise, reps: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                value={currentExercise.weight}
                onChange={(e) =>
                  setCurrentExercise({ ...currentExercise, weight: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          
          <Button onClick={addExercise} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        {exercises.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Exercises ({exercises.length})</h4>
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} lbs
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={saveWorkout} 
          disabled={exercises.length === 0 || isSaving} 
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Workout"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}