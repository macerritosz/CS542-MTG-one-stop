import express, {type Express } from "express";
import cors from "cors";

/*
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
*/

import playerRoutes from "./src/routes/player.routes.ts";
import scrapeEventsRoute from "./src/routes/scrapeEvents.routes.ts";

const app: Express = express();
app.use(express.json());
const PORT = process.env.PORT || 5715;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }));

app.listen(PORT, (error? :Error) => {
    if (!error) {
        console.log("Server started on port: " + PORT);
    } else {
        console.error("Error occurred, could not start server:", error);
    }
});

/*
app.use("/api", cardRoutes); 
app.use("/api", cardsInComboRoutes);
app.use("/api", cardsInDeckRoutes);
app.use("/api", cardsInTransaction);
app.use("/api", comboRoutes);
app.use("/api", deckRoutes);
app.use("/api", transactionRoutes);

app.use("/api", userBuildsDeckRoutes);
app.use("/api", userSavesDeckRoutes);
*/

app.use("/api", playerRoutes);

app.use("/api", scrapeEventsRoute);
