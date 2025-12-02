import { useEffect, useState } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { Store, Search, Trash2, Delete } from 'lucide-react';
import TransactionDeckModal from "@/components/TransactionDeckModal.tsx";

interface Card {
    image_uris: string;
    cardID: string;
    name: string;
    purchase_uris: string;
    scryfall_uri: string;
    quantity: number;
    price_usd:number;
    price_foil_usd:number;
}
export interface TransactionData {
    sellerAuth: string;
    cardInfo: Card;
}

export default function DeckDetail() {
    const { deckID } = useParams();
    const [cards, setCards] = useState<Card[] | null>(null);
    const [title, setTitle] = useState('');
    const [format, setFormat] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [builderName, setBuilderName] = useState('');
    const [isPrivate, setIsPrivate] = useState<number>(1);
    const [isTransactionDeckOpen, setIsTransactionDeckOpen] = useState(false);
    const [colorDistribution, setColorDistribtion] = useState<{colorName: string, count: number, percentage: number}[]>([]);
    const { display_name } = useAuth();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ cardID: number; name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [hoveredCard, setHoveredCard] = useState<any | null>(null);
    const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
    const [selectedCard, setSelectedCard] = useState<any | null>(null);

    
    const navigate = useNavigate();
    
    const colors: Record<string, string> = {
        'White': 'https://svgs.scryfall.io/card-symbols/W.svg',
        'Blue': 'https://svgs.scryfall.io/card-symbols/U.svg',
        'Black': 'https://svgs.scryfall.io/card-symbols/B.svg',
        'Red': 'https://svgs.scryfall.io/card-symbols/R.svg',
        'Green': 'https://svgs.scryfall.io/card-symbols/G.svg',
        'Colorless': 'https://svgs.scryfall.io/card-symbols/C.svg',
    }

    const basicLandIds: Record<string, string> = {
        'White': '37edc4b5-75f5-4b43-a57e-a8192565a2a0',
        'Blue': '17e2b637-72b1-4457-aaba-66d51107be4c',
        'Black': '13505c15-14e0-4200-82bd-fb9bce949e68',
        'Red': '042b04b4-f7f4-4c1a-86ad-b50d788aa99e',
        'Green': '117ab60a-b888-4585-b0c6-769d387069f7'
    }

    async function fetchCards() {
        if (!deckID) return;
        try {
          const res = await fetch(`http://localhost:5715/api/decks/info?deckID=${encodeURIComponent(deckID!)}`);
          const data = await res.json();
          setCards(data.card_info);
          setColorDistribtion(data.color_distribution)
          setHoveredCard(data.card_info[0]);
          setCreatedAt(data.created_at)
          setTitle(data.title);
          setBuilderName(data.builder_name.display_name);
          setFormat(data.format);
          setIsPrivate(data.is_private)
        } catch (err) {
          console.error("Failed to fetch cards:", err);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    useEffect(() => {
        const fetchCards = async () => {
          if (!query.trim()) {
            setSuggestions([]);
            return;
          }
          try {
            const res = await fetch(`http://localhost:5715/api/cardnames?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSuggestions(data.cards);
            setShowSuggestions(true);
          } catch (err) {
            console.error("Error fetching card names:", err);
          }
        };
        const timeout = setTimeout(fetchCards, 250);
        return () => clearTimeout(timeout);
    }, [query]);

    async function publishDeck(){
        try {
            const res = await fetch("http://localhost:5715/api/publishdeck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({deckID}),
            });
            const data = await res.json();
            if (res.ok) {
                setIsPrivate(0)
                setMessage({ text: data.message, type: 'success' });
                setTimeout(() => setMessage(null), 1000);
            }
            if (!res.ok) {
                setMessage({ text: data.message, type: 'error' });
                setTimeout(() => setMessage(null), 1000);
            }
        } catch (err) {
            console.error("Failed to publish deck:", err);
            setMessage({ text: 'Failed to publish deck', type: 'error' });
            setTimeout(() => setMessage(null), 1000);
        }
    }

    async function unPublishDeck(){
        try {
            const res = await fetch("http://localhost:5715/api/unpublishdeck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({deckID}),
            });
            const data = await res.json();
            if (res.ok) {
                setIsPrivate(1)
                setMessage({ text: 'Deck unpublished successfully!', type: 'success' });
                setTimeout(() => setMessage(null), 1000);
            }
            if (!res.ok) {
                setMessage({ text: 'Deck had error while unpublishing', type: 'error' });
                setTimeout(() => setMessage(null), 1000);
            }
        } catch (err) {
            console.error("Failed to unpublish deck:", err);
            setMessage({ text: 'Failed to unpublish deck', type: 'error' });
            setTimeout(() => setMessage(null), 1000);
        }
    }

    async function removedCardOnce(cardID: string, cardName: string){
        try {
            const res = await fetch("http://localhost:5715/api/removecard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({deckID, cardID}),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchCards();
                setMessage({ text: `${cardName} removed from ${title} successfully!`, type: 'success' });
                setTimeout(() => setMessage(null), 1000);
            }
            if (!res.ok) {
                setMessage({ text: 'Failed to remove card from deck', type: 'error' });
                setTimeout(() => setMessage(null), 1000);
            }
        } catch (err) {
            console.error("Failed to remove card from deck:", err);
            setMessage({ text: 'Failed to remove card from deck', type: 'error' });
            setTimeout(() => setMessage(null), 1000);
        }
    }

    async function deleteDeck(){
        const confirmed = window.confirm("Are you sure you want to delete this deck? This action cannot be undone.");
        if (!confirmed) return;
        
        try {
            const res = await fetch("http://localhost:5715/api/deletedeck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({deckID}),
            });
            if (res.ok) {
                navigate('../')
            }
            if (!res.ok) {
                setMessage({ text: 'Failed to delete deck', type: 'error' });
                setTimeout(() => setMessage(null), 1000);
            }
        } catch (err) {
            console.error("Failed to delete deck: ", err);
            setMessage({ text: 'Failed to delete deck', type: 'error' });
            setTimeout(() => setMessage(null), 1000);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        setQuery(e.target.value);
    }

    async function handleSelectCard(name: string) {
        setQuery(name);
        setShowSuggestions(false);
      
        try {
          const selected = suggestions.find(
            (s) => s.name.toLowerCase() === name.toLowerCase()
          );
      
          if (!selected) {
            console.warn("Selected card not found in suggestions");
            return;
          }
      
          const res = await fetch("http://localhost:5715/api/decks/card", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cardID: selected.cardID, deckID, quantity: 1 }),
          });
      
          if (res.ok) {
            await fetchCards();
            console.log(`${name} added successfully`);
            setMessage({ text: `${name} added to deck`, type: 'success' });
            setTimeout(() => setMessage(null), 1000);
            setQuery("");
            setSuggestions([]);
        }
        } catch (err) {
            console.error("Error adding card:", err);
        }
    }

      async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
        await handleSelectCard(query);
      }

    //transaction logic
    async function handleTransaction(transactionDatum: {
            cardID: string
            quantity: number
            card_price: number
            total_price: number
            selectedDeckID: number
            is_foil: boolean
            buyerName: string
            sellerName: string
        }) {
       // ToDo: Add card to deck selected
        try {
            const res = await fetch("http://localhost:5715/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionDatum),
            });

            if (res.ok) {
            console.log("Transaction successful");
            const cardID = transactionDatum.cardID
            const deckID = transactionDatum.selectedDeckID
            const quantity = transactionDatum.quantity;
                try {
                    const res = await fetch('http://localhost:5715/api/decks/card', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({cardID, deckID, quantity}),
                    });
                } catch (err) {
                    console.error("Failed to fetch decks:", err);
                }
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    }

    // handle open Modal
    const handleOpenTransaction = (data: TransactionData) => {
        setTransactionData(data)
        setIsTransactionDeckOpen(true)
    }
    //handle close
    const handleCloseTransaction = () => {
        setIsTransactionDeckOpen(false)
        setTransactionData(null)
    }


    return(
        <div className="min-h-screen bg-gray-100/10 pb-20">
            <div className="mx-auto ml-37 mt-12 flex gap-15 justify-center">
                <div className="sticky top-20 h-fit self-start flex-shrink-0 flex flex-col items-center">
                    {display_name?.toLowerCase() === builderName?.toLowerCase() ? (
                        <>
                            <div className={`w-[380px] mb-3 px-4 py-1 rounded-lg text-center font-medium transition-opacity duration-200 ${
                                message 
                                    ? (message.type === 'success' ? 'bg-green-100 text-green-700 opacity-100' : 'bg-red-100 text-red-700 opacity-100')
                                    : 'bg-gray-100 text-transparent opacity-0'
                            }`}>
                                {message ? message.text : 'placeholder'}
                            </div>
                            <div className="w-[380px] flex justify-between items-center mb-4">
                                <form onSubmit={handleSubmit} className="relative w-[245px]">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                                    <input
                                        className="pl-10 border border-gray-400 rounded-lg px-4 py-2 w-full text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        type="text"
                                        id="query"
                                        name="query"
                                        placeholder="Add cards to deck"
                                        value={query}
                                        onChange={handleChange}
                                        onFocus={() => query && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                        autoComplete="off"
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <ul className="absolute z-20 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                                        {suggestions.map((card) => (
                                            <li
                                            key={card.cardID}
                                            onClick={() => handleSelectCard(card.name)}
                                            className="px-4 py-2 text-gray-700 hover:bg-purple-100 cursor-pointer transition-all"
                                            >
                                            {card.name}
                                            </li>
                                        ))}
                                        </ul>
                                    )}
                                </form>
                                <button
                                    type="button"
                                    onClick={isPrivate ? () => publishDeck() : () => unPublishDeck()}
                                    className="w-[115px] py-2 border border-purple-400 rounded-lg text-purple-500 hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                {isPrivate ? "Publish" : "Unpublish"}
                                </button>
                            </div>
                        </>
                    ): 
                        <h1 className='text-gray-500 text-3xl font-semibold mt-12 mb-4'>{`Deck Master: ${builderName}`}</h1>    
                    }
                    {hoveredCard ? (
                        <>
                            <a href={`../cards/${hoveredCard.cardID}`}>
                                <img
                                    src={hoveredCard.image_uris}
                                    alt={hoveredCard.name}
                                    className={`w-[380px] h-auto object-cover rounded-2xl shadow-lg`}
                                />
                            </a>
                            <div className="flex flex-col items-center gap-3 w-[275px] mt-5">
                                <a
                                    href={hoveredCard.purchase_uris}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex w-full items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-20 whitespace-nowrap"
                                >
                                    <Store className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-200" />
                                    <span>Buy Card On TCG Player</span>
                                </a>
                                <a
                                    href={hoveredCard.scryfall_uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex w-full items-center justify-center gap-2 border-2 border-purple-500 text-purple-500 font-semibold px-8 py-3 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                                >
                                    <Search className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors duration-200" />
                                    <span>Find Card On Scryfall</span>
                                </a>
                                {// only show link if not the same user
                                    }
                                {display_name?.toLowerCase() !== builderName?.toLowerCase() ? (<div
                                    onClick={() => handleOpenTransaction({sellerAuth: builderName, cardInfo:hoveredCard})}
                                    className="group inline-flex w-full items-center justify-center gap-2 border-2 border-red-500 text-red-500 font-semibold px-8 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                                >
                                    <Search className="w-5 h-5 text-red-500 group-hover:text-white transition-colors duration-200" />
                                    <span>Buy Card from {builderName}</span>
                                </div>) : null }
                            </div>
                        </>
                    ) : selectedCard ? (
                            <>
                                <a href={`../cards/${selectedCard.cardID}`}>
                                    <img
                                        src={selectedCard.image_uris}
                                        alt={selectedCard.name}
                                        className={`w-[380px] h-auto object-cover rounded-2xl shadow-lg`}
                                    />
                                </a>
                                <div className="flex flex-col items-center gap-3 w-[275px] mt-5">
                                    <a
                                        href={selectedCard.purchase_uris}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex w-full items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-20 whitespace-nowrap"
                                    >
                                        <Store
                                            className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-200"/>
                                        <span>Buy Card On TCG Player</span>
                                    </a>
                                    <a
                                        href={selectedCard.scryfall_uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex w-full items-center justify-center gap-2 border-2 border-purple-500 text-purple-500 font-semibold px-8 py-3 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                                    >
                                        <Search
                                            className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors duration-200"/>
                                        <span>Find Card On Scryfall</span>
                                    </a>
                                    {// only show link if not the same user
                                    }
                                    {display_name?.toLowerCase() !== builderName?.toLowerCase() ? (<div
                                        onClick={() => handleOpenTransaction({
                                            sellerAuth: builderName,
                                            cardInfo: selectedCard
                                        })}
                                        className="group inline-flex w-full items-center justify-center gap-2 border-2 border-red-500 text-red-500 font-semibold px-8 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                                    >
                                        <Search
                                            className="w-5 h-5 text-red-500 group-hover:text-white transition-colors duration-200"/>
                                        <span>Buy Card from {builderName}</span>
                                    </div>) : null}
                                </div>
                            </>
                        ) :
                        <img
                            src='https://via.placeholder.com/380x530?text=No+Image'
                            alt='No Image'
                            className="w-[380px] h-[530px] object-cover rounded-2xl shadow-lg"
                        />
                } 
                
                </div>
                <div className="mt-12 flex-1 max-w-4xl max-h-[80vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className='flex flex-col items-center px-6'>
                        <h1 className='text-4xl font-semibold text-gray-600 mb-2'>{title}</h1>
                        <div className="text-lg text-gray-400 font-medium mb-6">
                            {format}
                        </div>
                        {cards && cards.length > 0 ? (
                            <>
                            <span className='font-semibold text-gray-600 mb-2'>
                            {`Cards: (${cards.reduce((total, c) => total + c.quantity, 0)})`}
                            </span>
                                <div className="grid grid-cols-3 gap-x-1 gap-y-1 w-full mt-2">
                                    {cards.map((card) => (
                                    <span
                                        key={card.cardID}
                                        onClick={() => setSelectedCard(card)}
                                        className={`
                                        group px-3 py-1.5 rounded cursor-pointer flex items-center gap-2 transition-all
                                        ${selectedCard?.cardID === card.cardID
                                            ? "border-2 border-purple-500"
                                            : "text-gray-700 hover:bg-gray-50"} 
                                        `}
                                        onMouseEnter={() => setHoveredCard(card)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                    >
                                        <span className="text-purple-600 font-medium text-sm min-w-[2rem]">
                                            {card.quantity}x
                                        </span>
                                        {/* Text link */}
                                        <a
                                            href={`../cards/${card.cardID}`} // navigate to card
                                            className="group-hover:text-purple-600 text-[1.05rem] transition-colors truncate block"
                                            style={{
                                                maxWidth: "11rem",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                        {card.name}
                                        </a>
                                        {display_name?.toLowerCase() === builderName?.toLowerCase() && (
                                            <Trash2 
                                                onClick={() => {removedCardOnce(card.cardID, card.name)}} 
                                                className="ml-auto flex-shrink-0 w-5 h-5 hover:text-red-700 cursor-pointer transition-colors"
                                            />
                                        )}
                                    </span>
                                    ))}
                                </div>
                            </>
                        ) : (null)}
                        {display_name?.toLowerCase() === builderName?.toLowerCase() && (
                            <>
                                <h1 className='text-gray-700 font-medium mb-2 mt-7'>Add basic land:</h1>
                                <div className="flex items-center gap-1.5">
                                    {Object.entries(basicLandIds).map(([colorName, cardID]) => (
                                        <img
                                            key={colorName}
                                            src={colors[colorName]}
                                            alt={`Add ${colorName} basic land`}
                                            title={`Add ${colorName} basic land`}
                                            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-150 opacity-70 hover:opacity-100"
                                            onClick={async () => {
                                                const landName = colorName === 'White' ? 'Plains' : 
                                                                colorName === 'Blue' ? 'Island' : 
                                                                colorName === 'Black' ? 'Swamp' : 
                                                                colorName === 'Red' ? 'Mountain' : 'Forest';
                                                try {
                                                    const res = await fetch("http://localhost:5715/api/decks/card", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ cardID, deckID, quantity: 1 }),
                                                    });
                                                    if (res.ok) {
                                                        await fetchCards();
                                                        setMessage({ text: `${landName} added to deck`, type: 'success' });
                                                        setTimeout(() => setMessage(null), 1000);
                                                    }
                                                } catch (err) {
                                                    console.error("Error adding basic land:", err);
                                                    setMessage({ text: 'Failed to add card', type: 'error' });
                                                    setTimeout(() => setMessage(null), 1000);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-center gap-12 mb-7 mt-10">
                            {colorDistribution.map((color: any) => (
                                <div key={color.colorName} className="flex flex-col items-center gap-2">
                                    <img 
                                        src={colors[color.colorName]} 
                                        alt={color.colorName}
                                        className="w-20 h-20"
                                    />
                                    <span className="text-2xl font-bold text-gray-800">
                                        {color.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className='text-sm text-gray-500 mt-1'>
                            Built On • {new Date(createdAt).toLocaleDateString()}
                        </p>
                        {display_name?.toLowerCase() === builderName?.toLowerCase() && (
                            <button 
                                onClick={() => deleteDeck()}
                                className="flex items-center justify-center gap-2 mt-6 border px-6 py-1 border-red-500 rounded-xl bg-white text-red-500 hover:bg-red-50 hover:cursor-pointer active:scale-95 active:bg-red-200 transition"
                                >
                                <span>Delete Deck</span>
                                <Delete className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isTransactionDeckOpen && transactionData && (
                <TransactionDeckModal
                    isOpen={isTransactionDeckOpen}
                    transactionData={transactionData}
                    onClose={handleCloseTransaction}
                    onApply={handleTransaction}
                />
            )}
        </div>
    );
}
