import express from "express";
import dotenv from 'dotenv';
import {connectDB} from './dbConnect/connectdb.js'
import dataRoutes from './routes/data.routes.js'
import cors from 'cors'

dotenv.config();

const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: '*',
    XMLHttpRequest: true
}))

app.use("/api/data",dataRoutes)

await connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});    