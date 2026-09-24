import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js'; // Member 3 
import reportRoutes from './routes/reportRoutes.js'; // Member 4 
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chat.js';
import appointmentRoutes from './routes/appointmentRoutes.js';





dotenv.config();
connectDB();

const app = express();


const allowedOrigins = [
  "https://y3-s1-group-project.vercel.app",
  "https://y3-s1-group-project-dafhkj2ei-tharindusasa263s-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Member 1: User & Auth
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Member 3: Resource Library
app.use('/api/resources', resourceRoutes);


// ... member 4 imports
app.use('/api/safety', reportRoutes);
app.use('/api/news', reportRoutes)

//Community-forum

app.use('/api/posts', postRoutes);

app.use('/api/bot-service', chatRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
