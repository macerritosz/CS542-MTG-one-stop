import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/search_background.jpg'
import { Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdvancedSearchModal from '../components/AdvancedSearchModal';

interface Card {
    cardID: string;
    image_uris: string;
    name: string;
}

interface Deck {
    deckID: number,
    title: string
}

interface SortOption {
    value: string;
    label: string;
}

interface AdvancedFilters {
    rarity: string[];
    colors: string[];
    colorIdentity: string[];
    manaValueMin: string;
    manaValueMax: string;
    format: string;
    priceMin: string;
    priceMax: string;
    colorLogic: 'AND' | 'OR';
    colorIdentityLogic: 'AND' | 'OR';
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
    const { display_name, isAuthenticated } = useAuth();
    const [draggedCard, setDraggedCard] = useState<Card | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [plusButtonPosition, setPlusButtonPosition] = useState<{ x: number; y: number } | null>(null);
    const [hoveredCardID, setHoveredCardID] = useState<string | null>(null);
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        rarity: [],
        colors: [],
        colorIdentity: [],
        manaValueMin: '',
        manaValueMax: '',
        format: '',
        priceMin: '',
        priceMax: '',
        colorLogic: 'OR',
        colorIdentityLogic: 'OR',
    });

    const empty: AdvancedFilters = {
            rarity: [],
            colors: [],
            colorIdentity: [],
            manaValueMin: '',
            manaValueMax: '',
            format: '',
            priceMin: '',
            priceMax: '',
            colorLogic: 'OR',
            colorIdentityLogic: 'OR'
    };

    const sortOptions: SortOption[] = [
        { value: 'name', label: 'Name' },
        { value: 'price_usd', label: 'Price' },
        { value: 'mv', label: 'Mana Value' },
    ];

    useEffect(() => {
        if (isAdvancedSearchOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
    
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, [isAdvancedSearchOpen]);

    useEffect(() => {
        const url_query = params.get("query") || '';
        const url_page = parseInt(params.get("page") || "1", 10);
        
        const url_sortBy = params.get("sortBy") || 'name';
        const url_sortOrder = (params.get("sortOrder") as 'asc' | 'desc') || 'asc';

        const filters: AdvancedFilters = {
            rarity: params.getAll("rarity").filter(Boolean),
            colors: params.getAll("colors").filter(Boolean),
            colorIdentity: params.getAll("colorIdentity").filter(Boolean),
            manaValueMin: params.get("manaValueMin") || '',
            manaValueMax: params.get("manaValueMax") || '',
            format: params.get("format") || '',
            priceMin: params.get("priceMin") || '',
            priceMax: params.get("priceMax") || '',
            colorLogic: (params.get("colorLogic") as 'AND' | 'OR') || 'OR',
            colorIdentityLogic: (params.get("colorIdentityLogic") as 'AND' | 'OR') || 'OR',
        };
        
        setSortBy(url_sortBy);
        setSortOrder(url_sortOrder);
        setQuery(url_query);
        setPage(url_page);
        setAdvancedFilters(filters);

        async function fetchCards() {
            try {
                const searchParams = new URLSearchParams();
                if (url_query) searchParams.append('query', url_query);
                if (filters.rarity.length > 0) filters.rarity.forEach(r => searchParams.append('rarity', r));
                if (filters.colors.length > 0) filters.colors.forEach(c => searchParams.append('colors', c));
                if (filters.colorIdentity.length > 0) filters.colorIdentity.forEach(c => searchParams.append('colorIdentity', c));
                if (filters.manaValueMin) searchParams.append('manaValueMin', filters.manaValueMin);
                if (filters.manaValueMax) searchParams.append('manaValueMax', filters.manaValueMax);
                if (filters.format) searchParams.append('format', filters.format);
                if (filters.priceMin) searchParams.append('priceMin', filters.priceMin);
                if (filters.priceMax) searchParams.append('priceMax', filters.priceMax);
                
                if (filters.colorLogic) searchParams.append('colorLogic', filters.colorLogic);
                if (filters.colorIdentityLogic) searchParams.append('colorIdentityLogic', filters.colorIdentityLogic);

                searchParams.append('sortBy', url_sortBy);
                searchParams.append('sortOrder', url_sortOrder);
                searchParams.append('page', url_page.toString());

                const res = await fetch(`http://localhost:5715/api/cards?${searchParams.toString()}`);

                const data = await res.json();
                setCards(data.cards);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error("Failed to fetch cards:", err);
            }
        };

        const hasActiveFilters = filters.rarity.length > 0 || 
                                 filters.colors.length > 0 || 
                                 filters.colorIdentity.length > 0 ||
                                 filters.manaValueMin !== '' ||
                                 filters.manaValueMax !== '' ||
                                 filters.format !== '' ||
                                 filters.priceMin !== '' ||
                                 filters.priceMax !== ''
        
        if (url_query || hasActiveFilters) {
            fetchCards();
        }
    }, [location.search]);

    function buildSearchURL(filters: AdvancedFilters, searchQuery: string, pageNum: number = 1, sort: string = sortBy, order: 'asc' | 'desc' = sortOrder) {
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (filters.rarity.length > 0) filters.rarity.forEach(r => params.append('rarity', r));
        if (filters.colors.length > 0) filters.colors.forEach(c => params.append('colors', c));
        if (filters.colorIdentity.length > 0) filters.colorIdentity.forEach(c => params.append('colorIdentity', c));
        if (filters.manaValueMin) params.append('manaValueMin', filters.manaValueMin);
        if (filters.manaValueMax) params.append('manaValueMax', filters.manaValueMax);
        if (filters.format) params.append('format', filters.format);
        if (filters.priceMin) params.append('priceMin', filters.priceMin);
        if (filters.priceMax) params.append('priceMax', filters.priceMax);
        if (filters.colorLogic) params.append('colorLogic', filters.colorLogic);
        if (filters.colorIdentityLogic) params.append('colorIdentityLogic', filters.colorIdentityLogic);

        params.append('sortBy', sort);
        params.append('sortOrder', order);
        params.append('page', pageNum.toString());
        return `/cards?${params.toString()}`;
    }

    useEffect(() => {
        async function fetchDecks() {
            try {
                const res = await fetch(`http://localhost:5715/api/decks/me?name=${encodeURIComponent(display_name!)}`);
                const data = await res.json();
                setDecks(data.decks);
            } catch (error) {
                console.error("Failed to fetch decks:", error);
            }
        };
        fetchDecks();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isSortDropdownOpen) {
                const target = e.target as HTMLElement;
                if (!target.closest('.relative')) {
                    setIsSortDropdownOpen(false);
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSortDropdownOpen]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggedCard && isDragging) setMousePosition({ x: e.clientX, y: e.clientY });
        };
        const handleMouseUp = () => {
            setDraggedCard(null);
            setIsDragging(false);
            setPlusButtonPosition(null);
            setHoveredCardID(null);
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

    function handlePlusMouseDown(card: Card, e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setPlusButtonPosition({ x: rect.right, y: rect.top });
        setDraggedCard(card);
        setIsDragging(true);
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    async function addCardToDeck(cardID: string, deckID: number){
        try {
            const quantity = 1;
            const res = await fetch('http://localhost:5715/api/decks/card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({cardID, deckID, quantity}),
            });
        } catch (err) {
            console.error("Failed to fetch decks:", err);
        }
    }

    function handleDeckMouseUp(deckId: number, e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
        if (draggedCard && isDragging) {     
            addCardToDeck(draggedCard.cardID, deckId)
            setDraggedCard(null);
            setIsDragging(false);
        }
    };

    function changePage(newPage: number) {
        navigate(buildSearchURL(advancedFilters, query, newPage));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        setQuery(e.target.value);
    }

    function handleAdvancedFiltersApply(filters: AdvancedFilters) {
        setAdvancedFilters(filters);
        navigate(buildSearchURL(filters, query, 1));
    }

    function handleSortChange(newSortBy: string) {
        setSortBy(newSortBy);
        setIsSortDropdownOpen(false);
        navigate(buildSearchURL(advancedFilters, query, 1, newSortBy, sortOrder));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        navigate(buildSearchURL(advancedFilters, query, 1));
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
                        <div className="relative flex items-center justify-center">
                            <input
                                className="relative z-20 border border-gray-400 rounded-lg px-4 py-2 w-140 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                type="text"
                                id="query"
                                name="query"
                                placeholder="Search for cards"
                                value={query}
                                onChange={handleChange}
                            />
                            <div className="absolute right-full flex gap-4 mr-[8%]">
                                <button
                                    type="button"
                                    className="px-7 py-2 rounded-lg outline-none ring-1 ring-red-500 text-red-500 hover:scale-105 transition-all duration-200 whitespace-nowrap hover:cursor-pointer hover:text-white hover:bg-red-500"
                                    onClick={() => {
                                        setAdvancedFilters(empty);
                                        navigate(buildSearchURL(empty, query, 1));
                                    }}
                                    >
                                    Reset Filters
                                </button>
                                <button
                                    type="button"
                                    className="px-7 py-2 rounded-lg outline-none ring-1 ring-blue-500 text-blue-500 hover:scale-105 transition-all duration-200 whitespace-nowrap hover:cursor-pointer hover:text-white hover:bg-blue-500"
                                    onClick={() => setIsAdvancedSearchOpen(true)}
                                    >
                                    Filter
                                </button>
                            </div>
                            <div className="absolute left-full flex gap-4 ml-[9%]">
                                <div className="relative">
                                    <button 
                                        type="button"
                                        className="px-7 py-2 rounded-lg outline-none ring-1 ring-purple-500 text-purple-500 hover:scale-105 transition-all duration-200 whitespace-nowrap hover:cursor-pointer flex items-center gap-2"
                                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                    >
                                        {sortOptions.find(opt => opt.value === sortBy)?.label || 'Name'}
                                        <ChevronDown size={16} />
                                    </button>
                                    {isSortDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[175px]">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={`w-full text-left px-5 py-2 hover:bg-purple-100 transition-colors ${
                                                        sortBy === option.value ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                                                    }`}
                                                    onClick={() => handleSortChange(option.value)}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    className="px-4 py-2 rounded-lg outline-none ring-1 ring-purple-500 text-purple-500 hover:scale-105 transition-all duration-200 hover:cursor-pointer"
                                    onClick={() => {
                                        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                                        setSortOrder(newOrder);
                                        navigate(buildSearchURL(advancedFilters, query, 1, sortBy, newOrder));
                                    }}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div 
                    className="mt-20 px-[12%] grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] justify-center items-center gap-6"
                >   
                    {cards.length > 0 ? (
                        cards.map((card) => (
                            <div key={card.cardID} 
                                className={`relative group w-full transition-transform duration-200 ${
                                    draggedCard?.cardID === card.cardID || hoveredCardID === card.cardID ? 'scale-105' : ''
                                }`}
                                onMouseEnter={() => !draggedCard && setHoveredCardID(card.cardID)}
                                onMouseLeave={() => setHoveredCardID(null)}
                            >
                                <a href={`/cards/${card.cardID}`}>
                                    <img
                                        src={card.image_uris}
                                        alt={`Card ${card.cardID}`}
                                        className="w-full h-auto object-cover rounded-lg shadow-md"
                                    />
                                </a>
                                {isAuthenticated && (
                                    <button
                                        onMouseDown={(e) => handlePlusMouseDown(card, e)}
                                        className={`absolute top-6 right-6 bg-purple-500 text-white rounded-xl p-1 transition-opacity duration-200 shadow-lg 
                                        ${draggedCard?.cardID === card.cardID || hoveredCardID === card.cardID ? 'opacity-90 cursor-grab active:cursor-grabbing' : 'opacity-0'} `}
                                    >
                                        <Plus size={20} />
                                    </button>
                                )}
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
                            src={draggedCard.image_uris}
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
                                    key={deck.deckID}
                                    onMouseUp={(e) => handleDeckMouseUp(deck.deckID, e)}
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
            <AdvancedSearchModal
                isOpen={isAdvancedSearchOpen}
                onClose={() => setIsAdvancedSearchOpen(false)}
                onApply={handleAdvancedFiltersApply}
                currentFilters={advancedFilters}
            />
        </div>
    );
}
