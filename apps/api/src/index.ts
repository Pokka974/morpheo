import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createStream } from 'rotating-file-stream';
import swaggerUi from 'swagger-ui-express';
import { logInfo } from './services/logger.service';
import swaggerDocument from './swaggerOptions';
import chatGptRouter from './routes/chatgpt.route';
import dallERouter from './routes/dallE.router';
// import webhookRouter from './routes/webhook.route';
import dreamRouter from './routes/dream.route';
import userRouter from './routes/user.route';
import { clerkMiddleware } from '@clerk/express';

const app = express();
const port = process.env.PORT ?? 3000;

const accessLogStream = createStream('access.log', {
    size: '10M', // rotate every 10 MegaBytes written
    interval: '1d', // rotate daily
    path: path.join(__dirname, '../logs'),
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(
    morgan(
        ':remote-user [:date[web]] -- :method :url :status :response-time ms :user-agent',
        { stream: accessLogStream },
    ),
);
app.use(clerkMiddleware());

// Swagger UI setup with type assertion to bypass conflicts
app.use('/api-docs', swaggerUi.serve as any);
app.get('/api-docs', swaggerUi.setup(swaggerDocument) as any);
// app.use('/webhook', webhookRouter);

app.use('/chatgpt', chatGptRouter);
app.use('/dalle', dallERouter);
app.use('/dreams', dreamRouter);
app.use('/user', userRouter);

app.listen(port, () => {
    logInfo(`Server is running on http://localhost:${port}`);
});
