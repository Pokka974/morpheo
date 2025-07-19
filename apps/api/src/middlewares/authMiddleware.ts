// middleware/auth.js
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const authenticate = ClerkExpressRequireAuth({
    // Optional configuration
    jwtKey: process.env.CLERK_SECRET_KEY,
    authorizedParties: [
        'localhost', // Local development
        'exp://192.168.*.*', // Expo Go IP addresses
    ],
});
