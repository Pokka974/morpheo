// import { Router } from 'express';
// import { Webhook } from 'svix';
// import { PrismaClient } from '@prisma/client';
// import express from 'express';
// const prisma = new PrismaClient();
// const router = Router();

// type WebhookEvent = {
//     data: {
//         id: string;
//         email_addresses: Array<{ email_address: string }>;
//     };
//     type: 'user.created' | 'user.updated' | 'user.deleted';
// };

// // Add this interface to match Svix's expected headers
// interface SvixHeaders {
//     'svix-id': string;
//     'svix-timestamp': string;
//     'svix-signature': string;
// }

// router.post(
//     '/',
//     express.raw({ type: 'application/json' }),
//     async (req, res) => {
//         console.log('Webhook received'); // Debug log
//         const SIGNING_SECRET = process.env.SIGNING_SECRET;

//         if (!SIGNING_SECRET) {
//             console.error('Missing SIGNING_SECRET'); // Debug log
//             return res.status(500).json({
//                 success: false,
//                 message: 'Server misconfigured',
//             });
//         }

//         try {
//             const rawBody = req.body;
//             console.log('Raw body:', JSON.stringify(rawBody)); // Debug log

//             const headers = req.headers as unknown as SvixHeaders;
//             console.log('Headers:', headers); // Debug log

//             const svixHeaders = {
//                 'svix-id': headers['svix-id'],
//                 'svix-timestamp': headers['svix-timestamp'],
//                 'svix-signature': headers['svix-signature'],
//             };
//             console.log('Svix headers:', svixHeaders); // Debug log

//             const wh = new Webhook(SIGNING_SECRET);
//             console.log('Verifying webhook...'); // Debug log
//             const evt = wh.verify(
//                 JSON.stringify(rawBody),
//                 svixHeaders,
//             ) as WebhookEvent;
//             console.log('Webhook verified:', evt); // Debug log

//             // Handle event
//             switch (evt.type) {
//                 case 'user.created':
//                     console.log('Creating user...'); // Debug log
//                     await prisma.user.create({
//                         data: {
//                             clerkUserId: evt.data.id,
//                             email: evt.data.email_addresses[0].email_address,
//                             subscription: {
//                                 create: {
//                                     plan: 'free',
//                                     status: 'active',
//                                 },
//                             },
//                             rateLimits: {
//                                 create: { count: 0 },
//                             },
//                         },
//                     });
//                     break;

//                 case 'user.updated':
//                     console.log('Updating user...'); // Debug log
//                     await prisma.user.update({
//                         where: { clerkUserId: evt.data.id },
//                         data: {
//                             email: evt.data.email_addresses[0].email_address,
//                         },
//                     });
//                     break;

//                 case 'user.deleted':
//                     console.log('Deleting user...'); // Debug log
//                     await prisma.user.delete({
//                         where: { clerkUserId: evt.data.id },
//                     });
//                     break;
//             }

//             console.log('Webhook processed successfully'); // Debug log
//             return res.status(200).json({
//                 success: true,
//                 message: 'Webhook processed successfully',
//             });
//         } catch (err: any) {
//             console.error('Webhook error:', err); // Debug log
//             return res.status(400).json({
//                 success: false,
//                 message: err.message,
//             });
//         }
//     },
// );

// export default router;
