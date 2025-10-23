import dotenv from "dotenv";
dotenv.config();

import express, {type Express } from "express";
import { db } from "./src/data/db.ts";
import userRoutes from "./src/routes/user.routes.ts";


const app: Express = express();
const PORT = process.env.PORT || 5715;


db.sequelize.authenticate()
.then(() => console.log("✅ Database connected successfully!"))
.catch((err: unknown) => console.error("❌ Database connection failed:", err));

db.sequelize.sync()
  .then(() => console.log("🗄️ All models synchronized with the database."))
  .catch((err: unknown) => console.error("Error syncing database:", err));

app.listen(PORT, (error? :Error) => {
    if (!error) {
        console.log("Server started on port: " + PORT);
    } else {
        console.error("Error occurred, could not start server:", error);
    }
});

app.use(express.json());
app.use("/api", userRoutes); 
