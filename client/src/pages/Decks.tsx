import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/search_background.jpg'
import { useAuth } from '../contexts/AuthContext';
import CreateDeckModal from '../components/CreateDeckModal';
import { Heart } from 'lucide-react';

interface Deck {
    deckID: number;
    title: string;
    format: string;
    cards: Card[];
    display_name: string;
    created_at: string;
}

interface Card {
    cardID: string;
    image_uris: string;
}

export default function Decks() {
    const location = useLocation();
    const navigate = useNavigate();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState('All Decks')
    const { isAuthenticated, display_name } = useAuth();
    const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
    const [savedDecks, setSavedDecks] = useState<number[]>([]);

    const params = new URLSearchParams(location.search);

    useEffect(() => {
        const url_query = params.get("query")
        const url_page = parseInt(params.get("page") || "1", 10);
        
        setQuery(url_query || '')
        setPage(url_page);

        async function fetchDecks() {
          try {
            let url = `http://localhost:5715/api/decks?query=${encodeURIComponent(url_query!)}&page=${url_page}`;
            if (selected === "My Decks") url += `&name=${encodeURIComponent(display_name!)}`;
            const res = await fetch(url);
            const data = await res.json();
            
            const filteredDecks = selected === "Saved Decks" 
                ? data.decks.filter((deck: any) => savedDecks.includes(deck.deckID))
                : data.decks;

            setDecks(filteredDecks);
            setTotalPages(data.totalPages || 1);

          } catch (err) {
            console.error("Failed to fetch decks:", err);
          }
        };
        fetchDecks();
    }, [location.search, selected]);

    useEffect(() => {
        if (isCreateDeckOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
    
        return () => {
          document.body.style.overflow = 'auto';
        };
    }, [isCreateDeckOpen]);

    useEffect(() => {
        async function fetchSavedDecks() {
          if (!isAuthenticated) return;
          try {
            const res = await fetch(`http://localhost:5715/api/saveddecks?name=${encodeURIComponent(display_name!)}`);
            const data = await res.json();
            if (res.ok && Array.isArray(data.savedDecks)) {
                console.log(data.savedDecks.map((d: any) => d.deckID))
                setSavedDecks(data.savedDecks.map((d: any) => d.deckID));
            }
          } catch (err) {
            console.error("Failed to fetch saved decks:", err);
          }
        }
        fetchSavedDecks();
    }, [isAuthenticated, display_name]);
    
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
                navigate(`./${data.deckID}`)
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    }

    async function handleSaveDeck(deckID: string) {
        try {
            const res = await fetch("http://localhost:5715/api/savedeck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({deckID, name: display_name}),
            });
            const data = await res.json();
    
            if (res.ok) {
                console.log("Deck saved!");
            }

        } catch (error) {
            console.error("Something went wrong", error);
        }
    }
    async function handleRemoveSaveDeck(deckID: string) {
        try {
            const res = await fetch("http://localhost:5715/api/removesavedeck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({deckID, name: display_name}),
            });
    
            if (res.ok) {
                console.log("Deck unsaved!");
            }

        } catch (error) {
            console.error("Something went wrong", error);
        }
    }

    function timeAgo(dateString: string) {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
        const intervals = [
          { label: "year", seconds: 31536000 },
          { label: "month", seconds: 2592000 },
          { label: "week", seconds: 604800 },
          { label: "day", seconds: 86400 },
          { label: "hour", seconds: 3600 },
          { label: "minute", seconds: 60 },
          { label: "second", seconds: 1 },
        ];
      
        for (const interval of intervals) {
          const count = Math.floor(seconds / interval.seconds);
          if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
          }
        }
      
        return "just now";
      }

      
    function toggleSave(deckID: number) {
        if (savedDecks.includes(deckID)) {
            handleRemoveSaveDeck(deckID.toString());
            setSavedDecks(savedDecks.filter(id => id !== deckID));
        } else {
            handleSaveDeck(deckID.toString());
            setSavedDecks([...savedDecks, deckID]);
        }
    }
    
    function changePage(newPage: number) {
        navigate(`/decks?query=${encodeURIComponent(query)}&page=${newPage}`);
    }
    
    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { value } = e.target;
        setQuery(value);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        navigate(`/decks?query=${encodeURIComponent(query)}`);
    }
    
    return (
        <div className="h-screen bg-gray-100/10">
            <div className="w-full h-[50vh] bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}> 
                <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-300 via-blue-600 to-white bg-clip-text text-transparent leading-tight">Gathering Magic</h1>
                <p className="text-3xl font-semibold text-white">Find your next greatest team</p>
            </div>
            <div className="mt-15 mx-35">
                <div className="flex flex-col items-center">
                    <h1 className="text-6xl font-semibold text-gray-800">Deck Search</h1>
                    <form onSubmit={handleSubmit} className="mt-14 flex flex-col relative w-max">
                        <div className="relative flex items-center justify-center">
                            <input
                                className="z-20 border border-gray-400 rounded-lg px-4 py-2 w-140 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                type="text"
                                id="query"
                                name="query"
                                placeholder="Search for decks"
                                value={query}
                                onChange={handleChange}
                            />
                            <div className="absolute right-full flex gap-4 mr-[8%]">
                                {isAuthenticated && (
                                    <>
                                        <button
                                            type="button"
                                            className={`px-5 py-2 text-gray-800 rounded-3xl whitespace-nowrap ${
                                                selected == 'All Decks' 
                                                ? 'bg-gray-400 text-white' 
                                                : 'bg-none hover:cursor-pointer'
                                            }`}
                                            onClick={() => setSelected('All Decks')}
                                            >
                                            All Decks
                                        </button>
                                        
                                        <button
                                            type="button"
                                            className={`px-5 py-2 text-gray-800 rounded-3xl whitespace-nowrap ${
                                                selected == 'My Decks' 
                                                ? 'bg-gray-400 text-white' 
                                                : 'bg-none hover:cursor-pointer'
                                            }`}
                                            onClick={() => setSelected('My Decks')}
                                            >
                                            My Decks
                                        </button>
                                        
                                        
                                    </>
                                )}
                            </div>
                            <div className="absolute left-full flex gap-4 ml-[9%]">
                                {isAuthenticated && (
                                    <>
                                        <button
                                            type="button"
                                            className={`px-5 py-2 text-gray-800 rounded-3xl whitespace-nowrap ${
                                                selected == 'Saved Decks' 
                                                ? 'bg-gray-400 text-white' 
                                                : 'bg-none hover:cursor-pointer'
                                            }`}
                                            onClick={() => setSelected('Saved Decks')}
                                            >
                                            Saved
                                        </button>
                                        <button type="button" onClick={() => setIsCreateDeckOpen(true)} className='px-3 py-2 rounded-lg outline-none ring-1 ring-blue-500 text-blue-500 hover:scale-105 transition-all duration-200 whitespace-nowrap'>
                                            Create Deck
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                <div className="mt-20 px-[12%] grid grid-cols-1md:grid-cols-2 lg:grid-cols-3 justify--items-center gap-6 ">
                    {decks.length > 0 ? (
                        decks.map((deck) => {
                            return (
                                <a
                                    key={deck.deckID}
                                    href={`/decks/${deck.deckID}`}
                                    className="relative group block rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
                                    >
                                    {display_name?.toLowerCase() !== deck.display_name.toLowerCase() && isAuthenticated && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                            e.preventDefault();
                                            toggleSave(deck.deckID);
                                            }}
                                            className="absolute top-3 right-3 z-20"
                                        >
                                            <Heart
                                            className={`w-10 h-10 transition-all duration-200 ${
                                                savedDecks.includes(deck.deckID)
                                                ? "fill-red-500 text-red-500"
                                                : "text-red-500 hover:fill-red/40"
                                            }`}
                                            />
                                        </button>
                                    )}
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
                                    <div className="absolute top-0 left-0 right-0 z-20
                                        bg-gradient-to-b from-black/70 to-transparent 
                                        px-3 py-2 flex justify-start">
                                        <span className="text-white font-medium drop-shadow-md">
                                            {timeAgo(deck.created_at)}
                                        </span>
                                    </div>
                                    
                                    <div className="absolute bottom-0 left-0 right-0 z-20 
                                        bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                                        px-3 py-3 flex flex-col gap-1">
                                        <span className="text-white text-lg font-semibold truncate max-w-[65%]">
                                            {deck.title}
                                        </span>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-200 text-base opacity-80 truncate">
                                                {deck.display_name}
                                            </span>
                                            <span className="text-gray-200 text-lg font-medium">
                                                {deck.format}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                              );
                        })
                    ) : (
                        <p className="text-gray-600 mt-10 col-span-full text-center">No decks found.</p>
                    )}
                </div>
                {totalPages >= 0 && (
                    <div className="flex justify-center items-center mt-10 gap-4 pb-10">
                        <button
                            onClick={() => changePage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                        >
                            ←
                        </button>
                        <span className="text-gray-800 font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => changePage(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
            <CreateDeckModal
                isOpen={isCreateDeckOpen}
                onClose={() => setIsCreateDeckOpen(false)}
                onApply={handleCreateDeck}
            />
        </div>
    );
}

/*

TODO- 
- i dont think we need colors to card

- trigger idea- amount of decks this card is in - derived value for card 
- trigger idea- inserting random color design for player when created
- trigger idea- incrementing popularity count of both cards when used in a deck or when deck is saved by user
    - popular decks and cards on profile

- card combos implemented
- when hover over card pans out to left or right some info about the card
- when hover over deck pans out to left or right a list of first 30 cards or so, name
- add saving decks in profile page

- price of decks
*/
