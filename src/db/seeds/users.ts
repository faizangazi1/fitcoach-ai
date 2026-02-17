import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            name: 'Sarah Johnson',
            email: 'sarah.j@fitness.com',
            age: 28,
            heightInches: 65,
            weightLbs: 145,
            primaryGoal: 'Weight Loss',
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2024-10-15').toISOString(),
        },
        {
            name: 'Mike Chen',
            email: 'mike.chen@gym.com',
            age: 35,
            heightInches: 72,
            weightLbs: 190,
            primaryGoal: 'Muscle Gain',
            createdAt: new Date('2024-10-22').toISOString(),
            updatedAt: new Date('2024-10-22').toISOString(),
        },
        {
            name: 'Emily Rodriguez',
            email: 'emily.r@health.net',
            age: 42,
            heightInches: 62,
            weightLbs: 130,
            primaryGoal: 'Cardio Endurance',
            createdAt: new Date('2024-11-05').toISOString(),
            updatedAt: new Date('2024-11-05').toISOString(),
        },
        {
            name: 'James Wilson',
            email: 'james.w@fit.io',
            age: 25,
            heightInches: 70,
            weightLbs: 175,
            primaryGoal: 'General Fitness',
            createdAt: new Date('2024-11-18').toISOString(),
            updatedAt: new Date('2024-11-18').toISOString(),
        },
        {
            name: 'Lisa Thompson',
            email: 'lisa.t@wellness.com',
            age: 31,
            heightInches: 68,
            weightLbs: 155,
            primaryGoal: 'Strength Training',
            createdAt: new Date('2024-12-02').toISOString(),
            updatedAt: new Date('2024-12-02').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});