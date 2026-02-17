import { db } from '@/db';
import { statsOverview } from '@/db/schema';

async function main() {
    const now = new Date();
    const lastUpdated = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString();

    const sampleStatsOverview = [
        {
            userId: 1,
            totalWorkouts: 32,
            caloriesBurned: 12450,
            activeDays: 45,
            goalsAchieved: 3,
            goalsTotal: 5,
            lastUpdated: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            totalWorkouts: 28,
            caloriesBurned: 9800,
            activeDays: 38,
            goalsAchieved: 2,
            goalsTotal: 4,
            lastUpdated: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            totalWorkouts: 25,
            caloriesBurned: 11200,
            activeDays: 35,
            goalsAchieved: 2,
            goalsTotal: 3,
            lastUpdated: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 4,
            totalWorkouts: 18,
            caloriesBurned: 6500,
            activeDays: 24,
            goalsAchieved: 1,
            goalsTotal: 3,
            lastUpdated: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 5,
            totalWorkouts: 22,
            caloriesBurned: 8900,
            activeDays: 30,
            goalsAchieved: 2,
            goalsTotal: 4,
            lastUpdated: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(statsOverview).values(sampleStatsOverview);
    
    console.log('✅ Stats overview seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});