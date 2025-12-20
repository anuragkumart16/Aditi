import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});


// import todoRoutes from './routes/todoRoutes.js';
// app.use('/api/todos', todoRoutes);

// import geminiRoutes from './routes/geminiRoutes.js';
// app.use('/api/gemini', geminiRoutes);

export { app };
