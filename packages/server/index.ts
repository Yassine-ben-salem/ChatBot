import './config';
import express from 'express';
import router from './routes';

const app = express();

app.use(express.json());
app.use(router);

app.use((req, res) => {
   res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
