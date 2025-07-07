import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

