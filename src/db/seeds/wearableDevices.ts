import { db } from '@/db';
import { wearableDevices } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleDevices = [
        {
            userId: 1,
            deviceName: 'Apple Watch Series 9',
            deviceType: 'smartwatch',
            status: 'connected',
            lastSync: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 2,
            deviceName: 'Fitbit Charge 6',
            deviceType: 'fitness tracker',
            status: 'connected',
            lastSync: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 3,
            deviceName: 'Garmin Forerunner 265',
            deviceType: 'running watch',
            status: 'connected',
            lastSync: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 4,
            deviceName: 'Whoop 4.0',
            deviceType: 'recovery band',
            status: 'connected',
            lastSync: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 5,
            deviceName: 'Oura Ring Gen 3',
            deviceType: 'sleep tracker',
            status: 'disconnected',
            lastSync: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 1,
            deviceName: 'Strava',
            deviceType: 'app',
            status: 'connected',
            lastSync: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(wearableDevices).values(sampleDevices);
    
    console.log('✅ Wearable devices seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});