import { useState, useEffect } from "react";
import background from '../assets/home_background.jpg';
import { buildUrl } from  'build-url-ts';
import tagIcon from '../assets/tags.svg';
import clockIcon from '../assets/clock.svg';
import shopIcon from '../assets/shop.svg';
import calendarIcon from '../assets/calendar.svg';

interface Event {
    eventName: string;
    orgName: string;
    eventDistance: string;
    eventDate: string;
    eventTime: string;
    eventTags: string;
    dayOfWeek: string;
    month: string;
    dayOfMonth: string;
}

export default function Home() {
    const [targetUrl, setTargetUrl] = useState<string>("");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect (() => { 
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationString = await getAddressFromCoords(latitude, longitude);

                    const urlBuilder = buildUrl('https://locator.wizards.com', {
                        path: 'search',
                        queryParams: {
                            searchType: 'magic-events',
                            query: locationString,
                            distance: 10,
                            page: 1,
                            sort: 'date',
                            sortDirection: 'Asc'
                        },
                    });

                    setTargetUrl(urlBuilder);
                    console.log(urlBuilder);
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.error("Geolocation didn't work");
        }
    }, []);
    
    async function getAddressFromCoords(lat: Number, lng: number) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const { city, town, village, state, country } = data.address;
            const finalCity = city || town || village || "";
            return `${finalCity}, ${state}, ${country}`;
        } catch (error) {
            console.error("Error fetching address", error);
        }
    }

    async function getEventData(targetUrl: string) {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5715/api/scrapeevents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();
            setEvents(data.events);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events: ", error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="w-full min-h-[50vh] bg-cover bg-center flex flex-col items-center justify-center px-4 sm:px-6" style={{ backgroundImage: `url(${background})` }}> 
                <h1 className="mt-10 text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white text-center">HOME PAGE</h1>
                <p className="mt-3 text-base sm:text-lg md:text-xl lg:text-2xl text-white text-center">Events, Top Decks, Popular Combos, Search Bar</p>
                <button className="mt-5 px-4 sm:px-5 py-2 text-base sm:text-xl text-white rounded-full border hover:bg-gray-500 active:bg-gray-700 
                transform active:scale-95 transition-all duration-150 shadow-lg disabled:opacity-50 disabled:hover:bg-gray-700 disabled:active:scale-100 disabled:transform-none" 
                    disabled={loading || !targetUrl}
                    onClick={() => getEventData(targetUrl)} 
                >
                    {loading ? "Loading..." : (events.length > 0 ? "Refresh Data" : "Get Event Data")}
                </button>
            </div>
            <div className="flex flex-col items-center px-4 sm:px-6">
                {events.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue text-center mb-6 md:mb-8">
                            Upcoming Events ({events.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {events.map((event, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 sm:p-5 md:p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
                                            <img src={calendarIcon} alt="Tags Icon" className="w-full h-full" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div className="text-xs sm:text-sm font-semibold mb-1 text-white">{event.month}</div>
                                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{event.dayOfMonth}</div>
                                                <div className="text-[10px] sm:text-sm text-gray-800">{event.dayOfWeek}</div>
                                            </div>
                                        </div>
                                        <span className="text-gray-600 text-sm sm:text-base md:text-lg font-bold px-2 py-1">
                                            {event.eventDistance}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                        {event.eventName}
                                    </h3>
                                    
                                    <div className="flex items-center text-gray-600 mb-2 font-semibold text-sm sm:text-base">
                                        <img src={shopIcon} alt="Tags Icon" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                        <span> {event.orgName} </span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-700 mb-2 text-sm sm:text-base">
                                        <img src={clockIcon} alt="Tags Icon" className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                        <span className="truncate">{event.eventTime}</span>
                                    </div>
                                    
                                    {event.eventTags && (
                                        <div className="flex items-center flex-wrap gap-2 text-sm">
                                            <img src={tagIcon} alt="Tags Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
                                            <span className="text-gray-700">
                                                {event.eventTags.split(',').map(tag => tag.trim()).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    ); 
}
