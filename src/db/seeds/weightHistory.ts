import { db } from '@/db';
import { weightHistory } from '@/db/schema';

async function main() {
    const today = new Date();
    const eightWeeksAgo = new Date(today);
    eightWeeksAgo.setDate(today.getDate() - (8 * 7));

    const generateWeeklyWeights = (userId: number, startWeight: number, endWeight: number, weeks: number) => {
        const entries = [];
        const weightChange = endWeight - startWeight;
        const weeklyChange = weightChange / weeks;

        for (let week = 0; week < weeks; week++) {
            const recordDate = new Date(eightWeeksAgo);
            recordDate.setDate(eightWeeksAgo.getDate() + (week * 7));
            
            // Add realistic fluctuations (±0.3 lbs)
            const fluctuation = (Math.random() - 0.5) * 0.6;
            const currentWeight = startWeight + (weeklyChange * week) + fluctuation;
            
            entries.push({
                userId: userId,
                weightLbs: Math.round(currentWeight * 10) / 10,
                recordedDate: recordDate.toISOString().split('T')[0],
                createdAt: recordDate.toISOString(),
            });
        }
        
        return entries;
    };

    const generateMaintainingWeights = (userId: number, baseWeight: number, weeks: number, maxFluctuation: number) => {
        const entries = [];

        for (let week = 0; week < weeks; week++) {
            const recordDate = new Date(eightWeeksAgo);
            recordDate.setDate(eightWeeksAgo.getDate() + (week * 7));
            
            // Random fluctuation within range
            const fluctuation = (Math.random() - 0.5) * (maxFluctuation * 2);
            const currentWeight = baseWeight + fluctuation;
            
            entries.push({
                userId: userId,
                weightLbs: Math.round(currentWeight * 10) / 10,
                recordedDate: recordDate.toISOString().split('T')[0],
                createdAt: recordDate.toISOString(),
            });
        }
        
        return entries;
    };

    const sampleWeightHistory = [
        // User 1: Sarah Johnson - Weight Loss (155 → 145 lbs)
        ...generateWeeklyWeights(1, 155, 145, 8),
        
        // User 2: Mike Chen - Muscle Gain (185 → 190 lbs)
        ...generateWeeklyWeights(2, 185, 190, 8),
        
        // User 3: Emily Rodriguez - Maintaining (130 lbs ±2 lbs)
        ...generateMaintainingWeights(3, 130, 8, 2),
        
        // User 4: James Wilson - Weight Loss (182 → 175 lbs)
        ...generateWeeklyWeights(4, 182, 175, 8),
        
        // User 5: Lisa Thompson - Maintaining (155 lbs ±2 lbs)
        ...generateMaintainingWeights(5, 155, 8, 2),
    ];

    await db.insert(weightHistory).values(sampleWeightHistory);
    
    console.log('✅ Weight history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});