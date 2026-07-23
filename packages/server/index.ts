import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

app.get('/', (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.post('/api/chat', async (req: Request, res: Response) => {
    const { prompt } = req.body;

    const response = await client.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 100,
    }) as any;

    res.json({ message: response.choices[0].message.content ?? 'No content' });
});

app.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello, World!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});