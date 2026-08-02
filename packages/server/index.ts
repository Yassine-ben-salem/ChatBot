import './config';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes';
import { sessionMiddleware } from './middleware/session';
import { CLIENT_ORIGIN } from './config';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(
   cors({
      origin: isProduction ? CLIENT_ORIGIN : true,
      credentials: true,
   })
);
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(router);

if (isProduction) {
   const clientDist = path.resolve(__dirname, '../client/dist');
   app.use(express.static(clientDist));
   app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
   });
}

app.use((req, res) => {
   res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
