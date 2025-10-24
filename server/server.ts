import dotenv from "dotenv";
dotenv.config();

import express, {type Express, type Request, type Response } from "express";
// import { db } from "./src/data/db.ts";
import cors from "cors";
import puppeteer from "puppeteer";

import cardRoutes from "./src/routes/card.routes.ts";
import cardsInComboRoutes from "./src/routes/cardsInCombo.routes.ts";
import cardsInDeckRoutes from "./src/routes/cardsInDeck.routes.ts";
import cardsInTransaction from "./src/routes/cardsInTransaction.routes.ts";
import comboRoutes from "./src/routes/combo.routes.ts";
import deckRoutes from "./src/routes/deck.routes.ts";
import transactionRoutes from "./src/routes/transaction.routes.ts";
import userRoutes from "./src/routes/user.routes.ts";
import userBuildsDeckRoutes from "./src/routes/userBuildsDeck.routes.ts";
import userSavesDeckRoutes from "./src/routes/userSavesDeck.routes.ts";



const app: Express = express();
const PORT = process.env.PORT || 5715;

/*
db.sequelize.authenticate()
.then(() => console.log("✅ Database connected successfully!"))
.catch((err: unknown) => console.error("❌ Database connection failed:", err));

db.sequelize.sync()
  .then(() => console.log("🗄️ All models synchronized with the database."))
  .catch((err: unknown) => console.error("Error syncing database:", err));

*/

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",  // allow only your frontend
    methods: ["GET", "POST"],         // allowed HTTP methods
    credentials: true                  // if you need cookies/auth
  }));


app.listen(PORT, (error? :Error) => {
    if (!error) {
        console.log("Server started on port: " + PORT);
    } else {
        console.error("Error occurred, could not start server:", error);
    }
});


app.use("/api", cardRoutes); 
app.use("/api", cardsInComboRoutes);
app.use("/api", cardsInDeckRoutes);
app.use("/api", cardsInTransaction);
app.use("/api", comboRoutes);
app.use("/api", deckRoutes);
app.use("/api", transactionRoutes);
app.use("/api", userRoutes);
app.use("/api", userBuildsDeckRoutes);
app.use("/api", userSavesDeckRoutes);

app.post("/scrape", async (req: Request, res: Response) => {
    const url = req.body.url as string;
    console.log(url);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const events = await page.evaluate(() => {
        const eventCards = document.querySelectorAll('.event-card');
        
        return Array.from(eventCards).map(card => {
            const eventName = card.querySelector('.event-name')?.textContent?.trim() || '';
            const orgName = card.querySelector('.org-name')?.textContent?.trim() || '';
            const eventDistance = card.querySelector('.event-distance')?.textContent?.trim() || '';
            const eventDate = card.querySelector('.event-date')?.textContent?.trim() || '';
            
            return {
                eventName,
                orgName,
                eventDistance,
                eventDate,
                allText: card.textContent?.trim()
            };
        });
    });

    console.log('Scraped events:', JSON.stringify(events, null, 2));

    res.json({ events, count: events.length });
    await browser.close();
});