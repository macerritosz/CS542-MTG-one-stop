import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/search_background.jpg'
import { Plus } from 'lucide-react';

interface Card {
    image_uris: string;
}

interface SelectedCard {
    card: Card;
    idx: number;
}

interface Deck {
    id: number,
    title: string
}

export default function Cards() {
    const location = useLocation();
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [decks, setDecks] = useState<Deck[]>([]);
    const params = new URLSearchParams(location.search);
    
    const [tempDecks] = useState<Deck[]>([ // delete once we have sample decks
        { id: 1, title: "Main Deck" },
        { id: 2, title: "Sideboard" },
        { id: 3, title: "Commander Deck" },
        { id: 4, title: "Amazing Deck"},
        { id: 5, title: "Dis Deck Wil Win"}
    ]);

    const [draggedCard, setDraggedCard] = useState<SelectedCard | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [plusButtonPosition, setPlusButtonPosition] = useState<{ x: number; y: number } | null>(null);
    const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);

    useEffect(() => {
        const url_query = params.get("query")
        const url_page = parseInt(params.get("page") || "1", 10);

        if (!url_query) return;
        
        setQuery(url_query);
        setPage(url_page);

        async function fetchCards() {
          try {
            const res = await fetch(`http://localhost:5715/api/cards?query=${encodeURIComponent(url_query!)}&page=${url_page}`);
            const data = await res.json();
            setCards(data.cards);
            setTotalPages(data.totalPages);

            setDecks(tempDecks) // temporary decks
          } catch (err) {
            console.error("Failed to fetch cards:", err);
          }
        };
        fetchCards();
    }, [location.search]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggedCard && isDragging) setMousePosition({ x: e.clientX, y: e.clientY });
        };
        const handleMouseUp = () => {
            setDraggedCard(null);
            setIsDragging(false);
            setPlusButtonPosition(null);
            setHoveredCardIdx(null);
        };
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, draggedCard]);

    function handlePlusMouseDown(card: Card, idx: number, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setPlusButtonPosition({ x: rect.right, y: rect.top });
        setDraggedCard({ card, idx });
        setIsDragging(true);
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    function handleDeckMouseUp(deckId: number, e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
        if (draggedCard && isDragging) {
            console.log(`Added card ${draggedCard.idx} to deck ${deckId}`);
            /* TODO

            Add logic here to add the card to deck
            
            */
            setDraggedCard(null);
            setIsDragging(false);
        }
    };

    function changePage(newPage: number) {
        navigate(`/cards?query=${encodeURIComponent(query)}&page=${newPage}`);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { value } = e.target;
        setQuery(value);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/cards?query=${encodeURIComponent(query)}&page=1`);
    }
    
    return (
        <div className="h-screen bg-gray-100/10">
            <div className="w-full h-[50vh] bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}> 
                <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-300 via-blue-600 to-white bg-clip-text text-transparent leading-tight">Gathering Magic</h1>
                <p className="text-3xl font-semibold text-white">Discover Your Next Card</p>
            </div>
            <div className="mt-15 mx-35">
                <div className="flex flex-col items-center">
                    <h1 className="text-6xl font-semibold text-gray-800">Card Search</h1>
                    <form onSubmit={handleSubmit} className="mt-14 flex flex-col relative w-max">
                        <div className="relative">
                            <input
                                className="relative z-20 border border-gray-400 rounded-lg px-4 py-2 w-140 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                type="text"
                                id="query"
                                name="query"
                                placeholder="Search for cards"
                                value={query}
                                onChange={handleChange}
                            />
                            <a href="/" className="absolute left-1/2 -translate-x-1/2 -bottom-[1.5rem] bg-gray-100 text-gray-800 text-sm px-3 py-0.5 rounded-b-lg border-x border-b border-gray-400 hover:underline">Advanced Search </a>
                        </div>
                    </form>
                </div>
                <div 
                    className="mt-20 px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify--items-center gap-6 "
                >
                    {cards.length > 0 ? (
                        cards.map((card, idx) => (
                            <div key={idx} 
                                className={`relative group w-full transition-transform duration-200 ${
                                    draggedCard?.idx === idx || hoveredCardIdx === idx ? 'scale-105' : ''
                                }`}
                                onMouseEnter={() => !draggedCard && setHoveredCardIdx(idx)}
                                onMouseLeave={() => setHoveredCardIdx(null)}
                            >
                                <img
                                    src={card.image_uris}
                                    alt={`Card ${idx}`}
                                    className="w-full h-auto object-cover rounded-lg shadow-md"
                                />
                                <button
                                    onMouseDown={(e) => handlePlusMouseDown(card, idx, e)}
                                    className={`absolute top-6 right-6 bg-purple-500 text-white rounded-xl p-1 transition-opacity duration-200 shadow-lg 
                                    ${draggedCard?.idx === idx || hoveredCardIdx === idx ? 'opacity-90 cursor-grab active:cursor-grabbing' : 'opacity-0'} `}
                                >
                                    <Plus size={25} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 mt-10 col-span-full text-center">No cards found.</p>
                    )}
                </div>
                {draggedCard && (
                    <div
                        className="fixed pointer-events-none z-50"
                        style={{
                            left: mousePosition.x - 25,
                            top: mousePosition.y - 30,
                            width: '50px'
                        }}
                    >
                        <img
                            src={draggedCard.card.image_uris}
                            alt="Dragged card"
                            className="w-full h-auto rounded-lg shadow-2xl opacity-80"
                        />
                    </div>
                )}
                {draggedCard && plusButtonPosition && (
                    <div 
                        className="fixed z-40 flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-200"
                        style={{
                            left: plusButtonPosition.x + 20,
                            top: plusButtonPosition.y,
                            transformOrigin: 'left top'
                        }}
                    >
                        {decks.length > 0 ? (
                            decks.map((deck, index) => (
                                <div
                                    key={deck.id}
                                    onMouseUp={(e) => handleDeckMouseUp(deck.id, e)}
                                    className="bg-white/95 backdrop-blur-sm hover:bg-purple-500 text-gray-800 hover:text-white px-5 py-2.5 rounded-md shadow-md border border-gray-200 hover:border-purple-500 cursor-pointer transition-all duration-150 hover:translate-x-1 pointer-events-auto whitespace-nowrap text-sm font-medium"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animation: 'slideIn 200ms ease-out forwards',
                                        opacity: 0
                                    }}
                                >
                                    {deck.title}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white/95 backdrop-blur-sm text-gray-600 px-5 py-2.5 rounded-md shadow-md border border-gray-200 pointer-events-auto whitespace-nowrap text-sm font-medium">
                                No decks available
                            </div>
                        )}
                        <style>{`
                            @keyframes slideIn {
                                from {
                                    opacity: 0;
                                    transform: translateX(-20px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0);
                                }
                            }
                        `}</style>
                    </div>
                )}
                {totalPages >= 0 && (
                    <div className="flex justify-center items-center mt-10 gap-4">
                        <button
                            onClick={() => changePage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                            ←
                        </button>
                        <span className="text-gray-800 font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => changePage(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
