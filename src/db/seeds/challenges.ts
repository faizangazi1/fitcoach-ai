import { db } from '@/db';
import { challenges } from '@/db/schema';

async function main() {
    const sampleChallenges = [
        {
            title: '30-Day Plank Challenge',
            description: 'Build core strength by holding a plank for 5 minutes by the end of the month. Start with 30 seconds and progressively increase your hold time each day.',
            participantsCount: 156,
            daysLeft: 12,
            reward: 'Challenge Badge',
            createdAt: new Date('2024-11-01').toISOString(),
            updatedAt: new Date('2024-11-18').toISOString(),
        },
        {
            title: '10K Steps Daily',
            description: 'Walk 10,000 steps every single day for 2 weeks. Track your progress with your wearable device and stay consistent to win!',
            participantsCount: 423,
            daysLeft: 8,
            reward: '$25 Gift Card',
            createdAt: new Date('2024-11-05').toISOString(),
            updatedAt: new Date('2024-11-22').toISOString(),
        },
        {
            title: '100 Pushups Challenge',
            description: 'Build up to 100 consecutive pushups through a structured training program. Perfect your form and gradually increase reps each week.',
            participantsCount: 89,
            daysLeft: 25,
            reward: 'Strength Master Badge',
            createdAt: new Date('2024-10-28').toISOString(),
            updatedAt: new Date('2024-11-05').toISOString(),
        },
        {
            title: 'No Sugar November',
            description: 'Eliminate all added sugar from your diet for 30 days. Focus on whole foods and natural sweetness. Transform your nutrition habits!',
            participantsCount: 234,
            daysLeft: 18,
            reward: 'Nutrition Champion Badge',
            createdAt: new Date('2024-11-01').toISOString(),
            updatedAt: new Date('2024-11-12').toISOString(),
        },
        {
            title: '5K Training Program',
            description: 'Train for and complete a 5K race! Follow our progressive training plan designed for beginners to experienced runners. Race day is coming soon!',
            participantsCount: 312,
            daysLeft: 3,
            reward: 'Race Registration Reimbursement',
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2024-11-27').toISOString(),
        },
        {
            title: 'Yoga 21-Day Transform',
            description: 'Commit to daily yoga practice for 21 days and experience improved flexibility, strength, and mindfulness. All levels welcome!',
            participantsCount: 178,
            daysLeft: 15,
            reward: 'Free Premium Month',
            createdAt: new Date('2024-11-08').toISOString(),
            updatedAt: new Date('2024-11-15').toISOString(),
        },
    ];

    await db.insert(challenges).values(sampleChallenges);
    
    console.log('✅ Challenges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});