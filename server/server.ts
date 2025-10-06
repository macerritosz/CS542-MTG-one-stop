import express, {type Express } from "express";

const app: Express = express();
const PORT = process.env.PORT || 5715;

app.listen(PORT, (error? :Error) => {
    if (!error) {
        console.log("Server started on port: " + PORT);
    } else {
        console.error("Error occurred, could not start server:", error);
    }
});