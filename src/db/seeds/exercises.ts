import { db } from '@/db';
import { exercises } from '@/db/schema';

async function main() {
    const sampleExercises = [
        // Workout 1 - Strength Training
        {
            workoutId: 1,
            name: 'Bench Press',
            sets: 4,
            reps: 10,
            weightLbs: 185,
            createdAt: new Date('2024-01-15T08:30:00').toISOString(),
        },
        {
            workoutId: 1,
            name: 'Squats',
            sets: 4,
            reps: 8,
            weightLbs: 225,
            createdAt: new Date('2024-01-15T08:45:00').toISOString(),
        },
        {
            workoutId: 1,
            name: 'Bicep Curls',
            sets: 3,
            reps: 12,
            weightLbs: 35,
            createdAt: new Date('2024-01-15T09:00:00').toISOString(),
        },
        // Workout 2 - Cardio/HIIT
        {
            workoutId: 2,
            name: 'Burpees',
            sets: 4,
            reps: 15,
            weightLbs: null,
            createdAt: new Date('2024-01-16T07:00:00').toISOString(),
        },
        {
            workoutId: 2,
            name: 'Mountain Climbers',
            sets: 3,
            reps: 45,
            weightLbs: null,
            createdAt: new Date('2024-01-16T07:20:00').toISOString(),
        },
        // Workout 3 - Strength Training
        {
            workoutId: 3,
            name: 'Deadlifts',
            sets: 4,
            reps: 6,
            weightLbs: 315,
            createdAt: new Date('2024-01-17T08:00:00').toISOString(),
        },
        {
            workoutId: 3,
            name: 'Shoulder Press',
            sets: 3,
            reps: 10,
            weightLbs: 95,
            createdAt: new Date('2024-01-17T08:20:00').toISOString(),
        },
        {
            workoutId: 3,
            name: 'Bench Press',
            sets: 3,
            reps: 12,
            weightLbs: 165,
            createdAt: new Date('2024-01-17T08:40:00').toISOString(),
        },
        // Workout 4 - HIIT
        {
            workoutId: 4,
            name: 'Jump Squats',
            sets: 4,
            reps: 15,
            weightLbs: null,
            createdAt: new Date('2024-01-18T06:30:00').toISOString(),
        },
        {
            workoutId: 4,
            name: 'Burpees',
            sets: 5,
            reps: 20,
            weightLbs: null,
            createdAt: new Date('2024-01-18T06:50:00').toISOString(),
        },
        // Workout 5 - Strength Training
        {
            workoutId: 5,
            name: 'Squats',
            sets: 5,
            reps: 6,
            weightLbs: 275,
            createdAt: new Date('2024-01-19T08:15:00').toISOString(),
        },
        {
            workoutId: 5,
            name: 'Bicep Curls',
            sets: 3,
            reps: 15,
            weightLbs: 30,
            createdAt: new Date('2024-01-19T08:35:00').toISOString(),
        },
        {
            workoutId: 5,
            name: 'Shoulder Press',
            sets: 3,
            reps: 12,
            weightLbs: 85,
            createdAt: new Date('2024-01-19T08:50:00').toISOString(),
        },
        // Workout 7 - Strength Training
        {
            workoutId: 7,
            name: 'Deadlifts',
            sets: 3,
            reps: 8,
            weightLbs: 285,
            createdAt: new Date('2024-01-22T08:00:00').toISOString(),
        },
        {
            workoutId: 7,
            name: 'Bench Press',
            sets: 4,
            reps: 8,
            weightLbs: 205,
            createdAt: new Date('2024-01-22T08:25:00').toISOString(),
        },
        // Workout 8 - Cardio/HIIT
        {
            workoutId: 8,
            name: 'Mountain Climbers',
            sets: 3,
            reps: 60,
            weightLbs: null,
            createdAt: new Date('2024-01-23T07:00:00').toISOString(),
        },
        {
            workoutId: 8,
            name: 'Jump Squats',
            sets: 4,
            reps: 12,
            weightLbs: null,
            createdAt: new Date('2024-01-23T07:20:00').toISOString(),
        },
        // Workout 10 - Strength Training
        {
            workoutId: 10,
            name: 'Squats',
            sets: 4,
            reps: 10,
            weightLbs: 245,
            createdAt: new Date('2024-01-25T08:30:00').toISOString(),
        },
        {
            workoutId: 10,
            name: 'Shoulder Press',
            sets: 3,
            reps: 8,
            weightLbs: 115,
            createdAt: new Date('2024-01-25T08:50:00').toISOString(),
        },
        {
            workoutId: 10,
            name: 'Bicep Curls',
            sets: 3,
            reps: 10,
            weightLbs: 40,
            createdAt: new Date('2024-01-25T09:05:00').toISOString(),
        },
        // Workout 12 - Strength Training
        {
            workoutId: 12,
            name: 'Bench Press',
            sets: 3,
            reps: 12,
            weightLbs: 175,
            createdAt: new Date('2024-01-27T08:00:00').toISOString(),
        },
        {
            workoutId: 12,
            name: 'Deadlifts',
            sets: 4,
            reps: 5,
            weightLbs: 335,
            createdAt: new Date('2024-01-27T08:25:00').toISOString(),
        },
        // Workout 13 - HIIT
        {
            workoutId: 13,
            name: 'Burpees',
            sets: 3,
            reps: 18,
            weightLbs: null,
            createdAt: new Date('2024-01-28T06:45:00').toISOString(),
        },
        {
            workoutId: 13,
            name: 'Mountain Climbers',
            sets: 3,
            reps: 50,
            weightLbs: null,
            createdAt: new Date('2024-01-28T07:05:00').toISOString(),
        },
        // Workout 15 - Strength Training
        {
            workoutId: 15,
            name: 'Squats',
            sets: 3,
            reps: 10,
            weightLbs: 205,
            createdAt: new Date('2024-01-30T08:15:00').toISOString(),
        },
        {
            workoutId: 15,
            name: 'Bench Press',
            sets: 4,
            reps: 10,
            weightLbs: 195,
            createdAt: new Date('2024-01-30T08:35:00').toISOString(),
        },
        {
            workoutId: 15,
            name: 'Shoulder Press',
            sets: 3,
            reps: 12,
            weightLbs: 75,
            createdAt: new Date('2024-01-30T08:55:00').toISOString(),
        },
        // Workout 17 - Strength Training
        {
            workoutId: 17,
            name: 'Deadlifts',
            sets: 3,
            reps: 7,
            weightLbs: 295,
            createdAt: new Date('2024-02-01T08:00:00').toISOString(),
        },
        {
            workoutId: 17,
            name: 'Bicep Curls',
            sets: 3,
            reps: 15,
            weightLbs: 25,
            createdAt: new Date('2024-02-01T08:25:00').toISOString(),
        },
        // Workout 18 - Cardio/HIIT
        {
            workoutId: 18,
            name: 'Jump Squats',
            sets: 4,
            reps: 15,
            weightLbs: null,
            createdAt: new Date('2024-02-02T07:00:00').toISOString(),
        },
        {
            workoutId: 18,
            name: 'Burpees',
            sets: 4,
            reps: 15,
            weightLbs: null,
            createdAt: new Date('2024-02-02T07:20:00').toISOString(),
        },
        // Workout 20 - Strength Training
        {
            workoutId: 20,
            name: 'Bench Press',
            sets: 4,
            reps: 8,
            weightLbs: 215,
            createdAt: new Date('2024-02-04T08:30:00').toISOString(),
        },
        {
            workoutId: 20,
            name: 'Squats',
            sets: 5,
            reps: 6,
            weightLbs: 295,
            createdAt: new Date('2024-02-04T08:50:00').toISOString(),
        },
        {
            workoutId: 20,
            name: 'Shoulder Press',
            sets: 3,
            reps: 10,
            weightLbs: 105,
            createdAt: new Date('2024-02-04T09:15:00').toISOString(),
        },
        // Workout 22 - Strength Training
        {
            workoutId: 22,
            name: 'Deadlifts',
            sets: 4,
            reps: 6,
            weightLbs: 355,
            createdAt: new Date('2024-02-06T08:00:00').toISOString(),
        },
        {
            workoutId: 22,
            name: 'Bicep Curls',
            sets: 3,
            reps: 12,
            weightLbs: 45,
            createdAt: new Date('2024-02-06T08:25:00').toISOString(),
        },
        // Workout 23 - HIIT
        {
            workoutId: 23,
            name: 'Mountain Climbers',
            sets: 3,
            reps: 30,
            weightLbs: null,
            createdAt: new Date('2024-02-07T06:30:00').toISOString(),
        },
        {
            workoutId: 23,
            name: 'Jump Squats',
            sets: 4,
            reps: 12,
            weightLbs: null,
            createdAt: new Date('2024-02-07T06:50:00').toISOString(),
        },
        // Workout 25 - Strength Training
        {
            workoutId: 25,
            name: 'Squats',
            sets: 4,
            reps: 8,
            weightLbs: 265,
            createdAt: new Date('2024-02-09T08:15:00').toISOString(),
        },
        {
            workoutId: 25,
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            weightLbs: 185,
            createdAt: new Date('2024-02-09T08:35:00').toISOString(),
        },
        {
            workoutId: 25,
            name: 'Shoulder Press',
            sets: 3,
            reps: 8,
            weightLbs: 125,
            createdAt: new Date('2024-02-09T08:55:00').toISOString(),
        },
    ];

    await db.insert(exercises).values(sampleExercises);
    
    console.log('✅ Exercises seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});