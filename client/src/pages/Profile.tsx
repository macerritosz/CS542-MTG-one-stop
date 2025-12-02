import { useState, useEffect, useRef } from "react";
import { buildUrl } from  'build-url-ts';
import tagIcon from '../assets/tags.svg';
import clockIcon from '../assets/clock.svg';
import shopIcon from '../assets/shop.svg';
import calendarIcon from '../assets/calendar.svg';
import { useAuth } from '../contexts/AuthContext';
import CreateDeckModal from '../components/CreateDeckModal';
import { useNavigate } from "react-router-dom";

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

interface Deck {
    deckID: number;
    title: string;
    format: string;
    cards: Card[];
}

interface Card {
    cardID: string;
    image_uris: string;
}

export default function Profile() {
    const [targetUrl, setTargetUrl] = useState<string>("");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { display_name } = useAuth();
    const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
    const navigate = useNavigate();
    const initial = display_name ? display_name[0]!.toUpperCase() : 'U';
    const [decksbuilt, setDecksBuilt] = useState<Deck[] | null>(null);
    const [deckssaved, setDecksSaved] = useState<Deck[] | null>(null);
    const [transactionHistory, setTransactionHistory] = useState<any | null>(null);
    const cardCache = useRef<Record<string, string>>({});

    const quotes = [
        "The spark of a Planeswalker ignites the multiverse.",
        "In the gathering, all paths converge.",
        "Power is nothing without the will to wield it.",
        "Every card tells a story, every deck a legend.",
        "The greatest magic is the friends we summon along the way."
    ];
      
    const colors = [
        'bg-red-500',
        'bg-blue-600',
        'bg-green-600',
        'bg-purple-600',
        'bg-orange-500',
        'bg-pink-600',
        'bg-indigo-600'
    ];

    const [currentQuote, setCurrentQuote] = useState(0);
    const [profileColor] = useState(colors[Math.floor(Math.random() * colors.length)]);

    useEffect(() => {
        if (!display_name) return;
      
        async function fetchEvents() {
          try {
            const res = await fetch(`http://localhost:5715/api/events?player_name=${encodeURIComponent(display_name!)}`);
            const data = await res.json();
            setEvents(data.events.slice(0,8));
          } catch (err) {
            console.error("Failed to fetch events:", err);
          }
        }
        fetchEvents();
      }, [display_name]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
    
        return () => clearInterval(interval);
    }, []);

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

    useEffect(() => {
        if (isCreateDeckOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
    
        return () => {
          document.body.style.overflow = 'auto';
        };
    }, [isCreateDeckOpen]);

    useEffect(() => {
        async function fetchDecks() {
            try {
                const res = await fetch(`http://localhost:5715/api/decks/me?name=${encodeURIComponent(display_name!)}`);
                const data = await res.json();
                setDecksBuilt(data.decksBuilt);
                setDecksSaved(data.decksSaved);
            } catch (error) {
                console.error("Failed to fetch decks:", error);
            }
        };
        fetchDecks();
    }, []);

    useEffect(() => {
        if (!display_name) return;

        const fetchTransactionHistory = async () => {
            try {
                const res = await fetch(`http://localhost:5715/api/transaction?name=${encodeURIComponent(display_name)}`);
                const data = await res.json();
                const transactions = data.transactions;
                let cardIDset = new Set<string>();
                transactions.forEach(t => {
                    cardIDset.add(t.cardID);
                })

                // Do Card Name work first and then match into the record
                let records: Record<string, string> = {};
                await Promise.all(
                    Array.from(cardIDset).map(async (id) => {
                        const cardRes = await fetch(`http://localhost:5715/api/card/cardName?cardID=${encodeURIComponent(id)}`);
                        const cardData = await cardRes.json();
                        records[id] = String(cardData[0].name);
                    })
                )
                const transactionComplete = transactions.map(t => ({
                        ...t,
                        cardName: records[t.cardID]
                }))

                console.log('Transaction complete', transactionComplete);

                setTransactionHistory(transactionComplete);
            } catch (err) {
                console.error("Failed to fetch transaction history:", err);
            }
        };

        fetchTransactionHistory();
    }, [display_name]);

    useEffect(() => {
        console.log(transactionHistory)
    }, []);

    async function handleCreateDeck(deckData: any) {
        try {
            const res = await fetch("http://localhost:5715/api/decks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deckData),
            });
            const data = await res.json();

            if (res.ok) {
                console.log("Deck created:", data);
                setIsCreateDeckOpen(false);
                navigate(`../decks/${data.deckID}`)
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    }

    async function getAddressFromCoords(lat: number, lng: number): Promise<string | null> {
        try {
            const res = await fetch("http://localhost:5715/api/reverse-geocode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng }),
            });
            
            const data = await res.json();
            const { city, town, village, state, country } = data.address;
            const finalCity = city || town || village || "";
            return `${finalCity}, ${state}, ${country}`;
        } catch (error) {
            console.error("Error fetching address", error);
            return null;
        }
    }

    async function getEventData(targetUrl: string) {
        setLoading(true);
        try {
            let res = await fetch("http://localhost:5715/api/scrapeevents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl, player_name: display_name }),
            });
            setLoading(false);
            
            res = await fetch(`http://localhost:5715/api/events?player_name=${encodeURIComponent(display_name!)}`);
            const data = await res.json();
            setEvents(data.events.slice(0,8));

        } catch (error) {
            console.error("Error fetching events: ", error);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-400"> 
                <div className="flex items-center gap-30">
                    <div className={`${profileColor} ml-20 rounded-full w-60 h-60 flex items-center justify-center text-white text-9xl font-bold shadow-lg`}>
                        {initial}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-7xl font-bold text-white">Welcome Back,</h1>
                        <div className="flex items-center mt-2">
                            <h1 className="text-7xl font-bold text-white">{display_name}</h1>
                        </div>
                    </div>
                </div>
                <p className="mt-8 text-3xl text-white italic max-w-5xl text-center transition-opacity duration-500">
                    "{quotes[currentQuote]}"
                </p>
            </div>
            <div>
                <div className="mt-16 flex flex-col items-center gap-y-4">
                    {events.length > 0 ? 
                        <>
                        <div className="flex items-start justify-center gap-10 mb-5">
                                <h2 className="text-4xl font-bold text-blue text-center -mr-5">
                                    Upcoming Events ({events.length})
                                </h2>
                                <p className="text-4xl">•</p>
                                <button
                                    className="px-5 py-2 text-2xl text-blue rounded-xl border hover:bg-gray-500 hover:text-white active:bg-gray-700 -ml-5 
                                        transform active:scale-95 transition-all duration-150 shadow-lg disabled:opacity-50 disabled:hover:bg-gray-700 disabled:active:scale-100 disabled:transform-none" 
                                    disabled={loading || !targetUrl}
                                    onClick={() => getEventData(targetUrl)} 
                                >
                                    {loading ? "Loading..." : (events.length > 0 ? "Refresh Data" : "Get Event Data")}
                                </button>
                            </div>
                            <div className="grid lg:grid-cols-4 gap-3 px-[6%]">
                                {events.map((event, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="relative w-30 h-30">
                                                <img src={calendarIcon} alt="Tags Icon" className="w-30 h-30" />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <div className="text-sm font-semibold mb-2 text-white">{event.month}</div>
                                                    <div className="text-3xl font-bold text-gray-800">{event.dayOfMonth}</div>
                                                    <div className="text-md text-gray-800">{event.dayOfWeek}</div>
                                                </div>
                                            </div>
                                            <span className="text-gray-600 text-lg font-bold px-2 py-1">
                                                {event.eventDistance}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {event.eventName}
                                        </h3>
                                        
                                        <div className="flex items-center text-gray-600 mb-2 font-semibold">
                                            <img src={shopIcon} alt="Tags Icon" className="w-6 h-6 mr-2" />
                                            <span> {event.orgName} </span>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <img src={clockIcon} alt="Tags Icon" className="w-6 h-6 mr-2" />
                                            <span>{event.eventTime}</span>
                                        </div>
                                        
                                        {event.eventTags && (
                                            <div className="flex items-center flex-wrap gap-2">
                                                <img src={tagIcon} alt="Tags Icon" className="w-6 h-6" />
                                                <span className="text-gray-700 text-sm">
                                                    {event.eventTags.split(',').map(tag => tag.trim()).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    : 
                        <button 
                            className="px-5 py-2 text-2xl text-blue rounded-xl border hover:bg-gray-500 hover:text-white active:bg-gray-700 -ml-5 
                                transform active:scale-95 transition-all duration-150 shadow-lg disabled:opacity-50 disabled:hover:bg-gray-700 disabled:active:scale-100 disabled:transform-none" 
                            disabled={loading || !targetUrl}
                            onClick={() => getEventData(targetUrl)} 
                        >
                            {loading ? "Loading..." : (events.length > 0 ? "Refresh Data" : "Get Event Data")}
                        </button> 
                    }
                    {decksbuilt && decksbuilt.length > 0 ? (
                        <>
                            <div className="flex items-start justify-center gap-10 mb-5 mt-16">
                                <h2 className="text-4xl font-bold text-blue text-center -mr-5">
                                    Your Decks ({decksbuilt.length})
                                </h2>
                                <p className="text-4xl">•</p>
                                <button type="button" onClick={() => setIsCreateDeckOpen(true)} className='px-5 py-2 text-2xl hover:text-white text-blue rounded-xl border hover:bg-gray-500 active:bg-gray-700 -ml-5 
                                        transform active:scale-95 transition-all duration-150 shadow-lg'>
                                    Create Deck
                                </button>
                            </div>
                            <div className="grid lg:grid-cols-4 gap-3 px-[6%]">
                                    {decksbuilt.map((deck) => {
                                        return (
                                            <a
                                            key={deck.deckID}
                                            href={`/decks/${deck.deckID}`}
                                            className="relative group block rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
                                            >
                                            <div className="grid grid-cols-2 grid-rows-2 w-full aspect-[4/3]">
                                                {deck.cards.map((card) => (
                                                <div key={card.cardID} className="overflow-hidden relative">
                                                    <img
                                                    src={card.image_uris}
                                                    alt={`Card ${card.cardID}`}
                                                    className="w-full h-full object-cover object-top"
                                                    />
                                                </div>
                                                ))}
                                            </div>
                                            <div className="absolute bottom-0 flex justify-between w-full bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <span className="ml-3 text-white text-xl font-semibold">{deck.title}</span>
                                                <span className="mr-3 text-gray-50 opacity-70 text-xl font-medium">{deck.format}</span>
                                            </div>
                                            </a>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        <div className="py-10"></div>
                    )}

                    {deckssaved && deckssaved.length > 0 ? (
                        <>
                            <div className="flex items-start justify-center gap-10 mb-5 mt-16">
                                <h2 className="text-4xl font-bold text-blue text-center -mr-5">
                                    Saved Decks ({deckssaved.length})
                                </h2>
                            </div>
                            <div className="grid lg:grid-cols-4 gap-3 px-[6%] mb-30">
                                    {deckssaved.map((deck) => {
                                        return (
                                            <a
                                            key={deck.deckID}
                                            href={`/decks/${deck.deckID}`}
                                            className="relative group block rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
                                            >
                                            <div className="grid grid-cols-2 grid-rows-2 w-full aspect-[4/3]">
                                                {deck.cards.map((card) => (
                                                <div key={card.cardID} className="overflow-hidden relative">
                                                    <img
                                                    src={card.image_uris}
                                                    alt={`Card ${card.cardID}`}
                                                    className="w-full h-full object-cover object-top"
                                                    />
                                                </div>
                                                ))}
                                            </div>
                                            <div className="absolute bottom-0 flex justify-between w-full bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <span className="ml-3 text-white text-xl font-semibold">{deck.title}</span>
                                                <span className="mr-3 text-gray-50 opacity-70 text-xl font-medium">{deck.format}</span>
                                            </div>
                                            </a>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        <div className="py-10"></div>
                    )}
                    {transactionHistory && transactionHistory.length > 0 ? (
                        <>
                            <div className="flex items-start justify-center gap-10 mb-5 mt-16">
                                <h2 className="text-4xl font-bold text-blue text-center -mr-5">
                                    Transaction History ({transactionHistory.length})
                                </h2>
                            </div>
                            <div className="mt-12 flex-1 max-w-full max-h-[80vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div className="grid lg:grid-cols-4 gap-3 px-[6%] mb-20">
                                {transactionHistory.map((tx) => {
                                    const price = Number(tx.item_price);
                                    const quantity = Number(tx.ct_quantity);
                                    const total = Number(tx.total_price) || price * quantity;
                                    const cardName = tx.cardName ? tx.cardName : "Wrong";

                                    const date = new Date(tx.transaction_time);
                                    const formattedDate = isNaN(date.getTime())
                                        ? 'Unknown date'
                                        : date.toLocaleString();

                                    return (
                                        <div
                                            key={`${tx.transaction_time}-${tx.cardID}`}
                                            className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition"
                                        >
                                            <div >
                                                <div className="flex justify-around items-center">
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {tx.sellerName === display_name ? "Sold" : "Bought"}
                                                    </h3>
                                                </div>
                                                <hr/>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-lg font-bold text-gray-800">{cardName}</h4>
                                                    <span className="text-gray-500 text-sm">{formattedDate}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-gray-700 font-medium">
                                                <p className="flex justify-between">
                                                    <span>Price:</span>
                                                    <span>${price.toFixed(2)}</span>
                                                </p>

                                                <p className="flex justify-between">
                                                    <span>Quantity:</span>
                                                    <span>{quantity}</span>
                                                </p>

                                                <div className="border-t border-gray-300 my-2"></div>

                                                <p className="flex justify-between text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span>${total.toFixed(2)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className="py-10 text-gray-600 text-xl">No transaction history.</div>
                    )}
                    <CreateDeckModal
                        isOpen={isCreateDeckOpen}
                        onClose={() => setIsCreateDeckOpen(false)}
                        onApply={handleCreateDeck}
                    />
                </div>
            </div>
        </>
    )
}