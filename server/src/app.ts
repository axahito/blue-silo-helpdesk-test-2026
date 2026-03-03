import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import ticketsRouter from './routes/tickets';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

// When running behind a proxy (e.g. in production with a load balancer),
// enable trust proxy so secure cookies are honored.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// simple request logger for debugging
app.use((req, res, next) => {
  console.log(`>> ${req.method} ${req.path}`);
  if (req.headers.authorization) {
    console.log('   authorization:', req.headers.authorization);
  } else {
    console.log('   no authorization header');
  }
  if (req.cookies && Object.keys(req.cookies).length) {
    console.log('   cookies:', req.cookies);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

app.use('/api/tickets', ticketsRouter);
app.use('/api/auth', authRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

export default app;
