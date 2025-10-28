import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

router.post("/scrapeevents", async (req, res) => {
    const url = req.body.url as string;
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

        res.json({ events, count: events.length });
    } catch (error) {
        res.status(500).json({ message: 'Failed getting events', error });
    }
});

export default router;
