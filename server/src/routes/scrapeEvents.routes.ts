import express from "express";
import pool from "../data/db.ts";
import puppeteer from "puppeteer";

const router = express.Router();

router.get("/events", async (req, res) => {
    try {
        const { player_name } = req.query;
        console.log(player_name)
        const [ events ]: any = await pool.query(
            "SELECT * FROM Events WHERE player_name = ?",
            [player_name]
        );
        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ error: "Failed to get events" });
    }
});

router.post("/reverse-geocode", async (req, res) => {
    const { lat, lng } = req.body;
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    'User-Agent': 'MagicEventFinder/1.0'
                }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Reverse geocode error:", error);
        res.status(500).json({ error: "Failed to reverse geocode" });
    }
});

router.post("/scrapeevents", async (req, res) => {
    const url = req.body.url as string;
    const player_name = req.body.player_name as string;
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const events = await page.evaluate(() => {
            const eventCards = document.querySelectorAll('.event-card');
            
            const allEvents = Array.from(eventCards).map(card => {
                const eventName = card.querySelector('.event-name')?.textContent?.trim() || '';
                const orgName = card.querySelector('.org-name')?.textContent?.trim() || '';
                const eventDistance = card.querySelector('.event-distance')?.textContent?.trim() || '';
                const eventDate = card.querySelector('.event-date')?.textContent?.trim() || '';
                const eventTime = card.querySelector('.event-time')?.textContent?.trim() || '';
                const eventTags = card.querySelector('.event-tags')?.textContent?.trim() || '';
                const dayOfWeek = card.querySelector('.dayOfWeek')?.textContent?.trim() || '';
                const month = card.querySelector('.month')?.textContent?.trim() || '';
                const dayOfMonth = card.querySelector('.dayOfMonth')?.textContent?.trim() || '';
                
                return {
                    eventName,
                    orgName,
                    eventDistance,
                    eventDate,
                    eventTime,
                    eventTags,
                    dayOfWeek,
                    month,
                    dayOfMonth
                };
            });

            const seen = new Set();
            return allEvents.filter(event => {
                const key = `${event.eventName}|${event.orgName}|${event.eventDate}`;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
        });

        await browser.close();
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            await connection.query("DELETE FROM Events WHERE player_name = ?", [player_name]);

            for (const e of events) {
                await connection.query(
                    `INSERT INTO Events 
                        (player_name, eventName, orgName, eventDistance, eventDate, eventTime, eventTags, dayOfWeek, month, dayOfMonth)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        player_name,
                        e.eventName,
                        e.orgName,
                        e.eventDistance,
                        e.eventDate,
                        e.eventTime,
                        e.eventTags,
                        e.dayOfWeek,
                        e.month,
                        e.dayOfMonth,
                    ]
                );
            }

            await connection.commit();
            console.log("deleted and inserted successfully")
        } catch (dbErr) {
            await connection.rollback();
            throw dbErr;
        } finally {
            connection.release();
        }

        res.json({ events, count: events.length });
    } catch (error) {
        res.status(500).json({ message: 'Failed getting events', error });
    }
});

export default router;
