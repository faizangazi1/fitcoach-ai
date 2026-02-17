import { db } from '@/db';
import { leaderboard } from '@/db/schema';

async function main() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - Math.floor(Math.random() * 7));

    const sampleLeaderboard = [
        {
            userId: 1,
            userName: 'Sarah Johnson',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            points: 3450,
            rank: 1,
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 2,
            userName: 'Mike Chen',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            points: 2890,
            rank: 2,
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            userName: 'Emily Rodriguez',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
            points: 2650,
            rank: 3,
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 4,
            userName: 'Lisa Thompson',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
            points: 2120,
            rank: 4,
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 5,
            userName: 'James Wilson',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
            points: 1875,
            rank: 5,
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(leaderboard).values(sampleLeaderboard);
    
    console.log('✅ Leaderboard seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});