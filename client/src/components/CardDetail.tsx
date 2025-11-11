import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircleOff, CircleCheckBig, Store, Search, Plus, ChevronDown } from 'lucide-react';

interface Card {
    cardID: string;
    oracle_id: string;
    name: string;
    released_at: string;
    set: string;
    set_name: string;
    set_type: string;
    collector_number: string;
    rarity: string;
    mana_cost: string;
    mv: number;
    oracle_text: string;
    power: number;
    loyalty: string;
    toughness: number;
    price_usd: number;
    price_foil_usd: number;
    image_uris: string;
    flavor_text: string;
    artist: string;
    scryfall_uri: string;
    rulings_uri: string;
    purchase_uris: string;
    edhrec_rank: number;
}

interface Legalities {
    [key: string]: number;
}

interface Keyword {
    keyword: string
}

interface ProducedMana {
    colorChar: string;
}

interface ColorIdentity {
    colorChar: string;
}

interface Deck {
    deckID: number;
    title: string;
    format: string;
    cards: Card[];
}

export default function CardInfo(){
    const navigate = useNavigate();
    const { cardID } = useParams();
    const [card, setCard] = useState<Card | null>(null);
    const [legalities, setLegalities] = useState<Legalities | null>(null);
    const [keywords, setKeywords] = useState<Keyword[] | null>(null);
    const [producedmana, setProducedMana] = useState<ProducedMana[] | null>(null);
    const [coloridentity, setColorIdentity] = useState<ColorIdentity[] | null>(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [alternatePrints, setAlternatePrints] = useState<Card[]>([]);
    const [currentPrintIndex, setCurrentPrintIndex] = useState(0);
    const [showDeckDropdown, setShowDeckDropdown] = useState(false);
    const [userDecks, setUserDecks] = useState<Deck[]>([]);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const { display_name } = useAuth();

    const colors: Record<string, string> = {
        '{W}': 'https://svgs.scryfall.io/card-symbols/W.svg',
        '{U}': 'https://svgs.scryfall.io/card-symbols/U.svg',
        '{B}': 'https://svgs.scryfall.io/card-symbols/B.svg',
        '{R}': 'https://svgs.scryfall.io/card-symbols/R.svg',
        '{G}': 'https://svgs.scryfall.io/card-symbols/G.svg',
        '{C}': 'https://svgs.scryfall.io/card-symbols/C.svg',
        
        '{0}': 'https://svgs.scryfall.io/card-symbols/0.svg',
        '{1}': 'https://svgs.scryfall.io/card-symbols/1.svg',
        '{2}': 'https://svgs.scryfall.io/card-symbols/2.svg',
        '{3}': 'https://svgs.scryfall.io/card-symbols/3.svg',
        '{4}': 'https://svgs.scryfall.io/card-symbols/4.svg',
        '{5}': 'https://svgs.scryfall.io/card-symbols/5.svg',
        '{6}': 'https://svgs.scryfall.io/card-symbols/6.svg',
        '{7}': 'https://svgs.scryfall.io/card-symbols/7.svg',
        '{8}': 'https://svgs.scryfall.io/card-symbols/8.svg',
        '{9}': 'https://svgs.scryfall.io/card-symbols/9.svg',
        '{10}': 'https://svgs.scryfall.io/card-symbols/10.svg',
        '{11}': 'https://svgs.scryfall.io/card-symbols/11.svg',
        '{12}': 'https://svgs.scryfall.io/card-symbols/12.svg',
        '{13}': 'https://svgs.scryfall.io/card-symbols/13.svg',
        '{14}': 'https://svgs.scryfall.io/card-symbols/14.svg',
        '{15}': 'https://svgs.scryfall.io/card-symbols/15.svg',
        '{16}': 'https://svgs.scryfall.io/card-symbols/16.svg',
        '{17}': 'https://svgs.scryfall.io/card-symbols/17.svg',
        '{18}': 'https://svgs.scryfall.io/card-symbols/18.svg',
        '{19}': 'https://svgs.scryfall.io/card-symbols/19.svg',
        '{20}': 'https://svgs.scryfall.io/card-symbols/20.svg',
        
        '{X}': 'https://svgs.scryfall.io/card-symbols/X.svg',
        '{Y}': 'https://svgs.scryfall.io/card-symbols/Y.svg',
        '{Z}': 'https://svgs.scryfall.io/card-symbols/Z.svg',
        
        '{W/U}': 'https://svgs.scryfall.io/card-symbols/WU.svg',
        '{W/B}': 'https://svgs.scryfall.io/card-symbols/WB.svg',
        '{U/B}': 'https://svgs.scryfall.io/card-symbols/UB.svg',
        '{U/R}': 'https://svgs.scryfall.io/card-symbols/UR.svg',
        '{B/R}': 'https://svgs.scryfall.io/card-symbols/BR.svg',
        '{B/G}': 'https://svgs.scryfall.io/card-symbols/BG.svg',
        '{R/G}': 'https://svgs.scryfall.io/card-symbols/RG.svg',
        '{R/W}': 'https://svgs.scryfall.io/card-symbols/RW.svg',
        '{G/W}': 'https://svgs.scryfall.io/card-symbols/GW.svg',
        '{G/U}': 'https://svgs.scryfall.io/card-symbols/GU.svg',
        
        '{W/P}': 'https://svgs.scryfall.io/card-symbols/WP.svg',
        '{U/P}': 'https://svgs.scryfall.io/card-symbols/UP.svg',
        '{B/P}': 'https://svgs.scryfall.io/card-symbols/BP.svg',
        '{R/P}': 'https://svgs.scryfall.io/card-symbols/RP.svg',
        '{G/P}': 'https://svgs.scryfall.io/card-symbols/GP.svg',
        '{P}': 'https://svgs.scryfall.io/card-symbols/P.svg',
        
        '{2/W}': 'https://svgs.scryfall.io/card-symbols/2W.svg',
        '{2/U}': 'https://svgs.scryfall.io/card-symbols/2U.svg',
        '{2/B}': 'https://svgs.scryfall.io/card-symbols/2B.svg',
        '{2/R}': 'https://svgs.scryfall.io/card-symbols/2R.svg',
        '{2/G}': 'https://svgs.scryfall.io/card-symbols/2G.svg',
        
        '{S}': 'https://svgs.scryfall.io/card-symbols/S.svg',
        
        '{T}': 'https://svgs.scryfall.io/card-symbols/T.svg',
        '{Q}': 'https://svgs.scryfall.io/card-symbols/Q.svg',
        
        '{E}': 'https://svgs.scryfall.io/card-symbols/E.svg',
        
        '{HW}': 'https://svgs.scryfall.io/card-symbols/HW.svg',
        '{HR}': 'https://svgs.scryfall.io/card-symbols/HR.svg',
    }

    useEffect(() => {
        if (!cardID) return;
        setQuery('');
        async function fetchCard() {
          try {
            let res = await fetch(`http://localhost:5715/api/card/info?cardID=${encodeURIComponent(cardID!)}`);
            let data = await res.json();
            setCard(data.card);
            setLegalities(data.legalities);
            setKeywords(data.keywords)
            setProducedMana(data.produced_mana)
            setColorIdentity(data.color_identity)
            
            const printsRes = await fetch(`http://localhost:5715/api/cardssimple?query=${encodeURIComponent(data.card.name)}`);
            const printsData = await printsRes.json();
            setAlternatePrints(printsData.cards);

            const currentIndex = printsData.cards.findIndex((c: Card) => c.cardID === cardID);
            setCurrentPrintIndex(currentIndex >= 0 ? currentIndex : 0);

            res = await fetch(`http://localhost:5715/api/cardsindecks?cardID=${encodeURIComponent(cardID!)}`);
            data = await res.json();
            setDecks(data.decks)
            
          } catch (err) {
            console.error("Failed to fetch card:", err);
          }
        };
        fetchCard();
    }, [cardID]);

    useEffect(() => {
        const fetchCards = async () => {
          if (!query.trim()) {
            setSuggestions([]);
            return;
          }

          try {
            const res = await fetch(`http://localhost:5715/api/cardnames?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSuggestions(data.cards.map((c: any) => c.name));
            setShowSuggestions(true);
          } catch (err) {
            console.error("Error fetching card names:", err);
          }
        };
        const timeout = setTimeout(fetchCards, 250);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        async function fetchUserDecks() {
          try {
            const res = await fetch(`http://localhost:5715/api/decks/me?name=${encodeURIComponent(display_name!)}`);
            const data = await res.json();
            setUserDecks(data.decksBuilt);
          } catch (error) {
            console.error("Failed to fetch decks:", error);
          }
        }
        if (display_name) {
          fetchUserDecks();
        }
    }, [display_name]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (showDeckDropdown) {
            const target = e.target as HTMLElement;
            if (!target.closest('.deck-dropdown-container')) {
              setShowDeckDropdown(false);
            }
          }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDeckDropdown]);


    async function addCardToDeck(deckID: number) {
        try {
          const quantity = 1;
          const res = await fetch('http://localhost:5715/api/decks/card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardID: card?.cardID, deckID, quantity }),
          });
          
          if (res.ok) {
            const deck = userDecks.find(d => d.deckID === deckID);
            setMessage({ 
              text: `Added ${card?.name} to ${deck?.title}`, 
              type: 'success' 
            });
            setTimeout(() => setMessage(null), 3000);
            setShowDeckDropdown(false);
          }
        } catch (err) {
          console.error("Failed to add card to deck:", err);
          setMessage({ text: 'Failed to add card to deck', type: 'error' });
          setTimeout(() => setMessage(null), 3000);
        }
    }

    function renderOracleText(text: string): React.ReactNode[] {
        const parts = text.split(/(\{.*?\})/g);
    
        return parts.map((part, index) => {
            if (colors[part]) {
                return (
                    <img
                        key={index}
                        src={colors[part]}
                        alt={part}
                        className="inline-block w-5 h-5 mx-0.5 align-text-bottom"
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    }

    function handleImageClick() {
        if (alternatePrints.length <= 1) return;
        const nextIndex = (currentPrintIndex + 1) % alternatePrints.length;
        const nextCard = alternatePrints[nextIndex];
        if (nextCard) navigate(`/cards/${nextCard.cardID}`);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        setQuery(e.target.value);
    }
    async function handleSelectCard(name: string) {
        setQuery(name);
        setShowSuggestions(false);
      
        try {
          const res = await fetch(`http://localhost:5715/api/cardid?name=${encodeURIComponent(name)}`);

          if (!res.ok) throw new Error("Failed to fetch card ID");

          const data = await res.json();
          navigate(`/cards/${data.id.cardID}`);
        } catch (err) {
          console.error("Error navigating to card:", err);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;

        const normalizedSuggestions = suggestions.map(s => s.toLowerCase());
        const normalizedQuery = query.toLowerCase();
        if (!normalizedSuggestions.includes(normalizedQuery)) {
            console.warn("Please select a valid card name from suggestions");
            return;
        }

        const res = await fetch(`http://localhost:5715/api/cardid?name=${encodeURIComponent(query)}`);
        const data = await res.json();
        console.log(data.id)
        navigate(`/cards/${data.id.cardID}`);
    }

    return (
        <div className="min-h-screen bg-gray-100/10 pb-20">
            {card && (
                <>
                    <div className="max-w-[1400px] mx-auto mt-12 flex gap-10 justify-center">
                        <div className="sticky top-20 h-fit self-start flex-shrink-0 flex flex-col items-center">
                            <div className={`w-[380px] mb-3 px-4 py-1 rounded-lg text-center font-medium transition-opacity duration-200 truncate ${
                                message 
                                    ? (message.type === 'success' ? 'bg-green-100 text-green-700 opacity-100' : 'bg-red-100 text-red-700 opacity-100')
                                    : 'bg-gray-100 text-transparent opacity-0'
                            }`}>
                                {message ? message.text : 'placeholder'}
                            </div>
                            <form onSubmit={handleSubmit} className="relative w-max mb-4 z-50 flex gap-5 justify-start items-center">
                                <div className="relative w-80">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                                    <input
                                        className="pl-10 border border-gray-400 rounded-lg px-4 py-2 w-full text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        type="text"
                                        id="query"
                                        name="query"
                                        placeholder="Search for cards"
                                        value={query}
                                        onChange={handleChange}
                                        onFocus={() => query && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                        autoComplete="off"
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <ul className="absolute z-20 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                                            {suggestions.map((name, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleSelectCard(name)}
                                                className="px-4 py-2 text-gray-700 hover:bg-purple-100 cursor-pointer transition-all"
                                            >
                                                {name}
                                            </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="relative deck-dropdown-container">
                                    <button
                                        onClick={() => setShowDeckDropdown(!showDeckDropdown)}
                                        className="px-3 py-2 border border-purple-400 rounded-lg text-purple-500 hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add to Deck
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDeckDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showDeckDropdown && (
                                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-full max-h-[300px] overflow-y-auto">
                                        {userDecks.length > 0 ? (
                                            userDecks.map((deck) => (
                                            <button
                                                key={deck.deckID}
                                                onClick={() => addCardToDeck(deck.deckID)}
                                                className="w-full text-left px-3 py-2 hover:bg-purple-100 transition-colors border-b border-gray-100 last:border-b-0 flex flex-col gap-1"
                                            >
                                                <span className="text-gray-700 text-center">{deck.title}</span>

                                            </button>
                                            ))
                                        ) : (
                                            <div className="px-5 py-4 text-gray-500 text-center">
                                            No decks available
                                            </div>
                                        )}
                                        </div>
                                    )}
                                </div>
                            </form>

                            <img
                                src={card.image_uris}
                                alt={`Card ${card.cardID}`}
                                className="w-[380px] h-auto object-cover rounded-2xl shadow-lg"
                                onClick={handleImageClick}
                            />
                            <div className="flex flex-col items-center gap-3 w-[275px] mt-5">
                                <a
                                    href={card.purchase_uris}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex w-full items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-20 whitespace-nowrap"
                                >
                                    <Store className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-200" />
                                    <span>Buy Card On TCG Player</span>
                                </a>

                                <a
                                    href={card.scryfall_uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex w-full items-center justify-center gap-2 border-2 border-purple-500 text-purple-500 font-semibold px-8 py-3 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                                >
                                    <Search className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors duration-200" />
                                    <span>Find Card On Scryfall</span>
                                </a>
                            </div>
                        </div>
                        <div className="mt-10 flex-1 min-w-0 max-w-3xl max-h-[80vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className='flex flex-col items-center'>
                                <div className='flex flex-wrap gap-6 items-center justify-center'>
                                    <h1 className='text-4xl font-semibold text-gray-600'>{card.name}</h1>
                                        {card.mana_cost && (
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                {card.mana_cost.match(/\{.*?\}/g)?.map((symbol, index) => (
                                                    <img
                                                    key={`${symbol}-${index}`}
                                                    src={colors[symbol]}
                                                    alt={symbol}
                                                    className="w-8 h-8"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                </div>
                                {keywords ? (
                                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-3 text-center">
                                        {keywords.map((item, index) => (
                                            <span key={index} className='text-3xl text-gray-400'>
                                                {item.keyword}{index < keywords.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <p className="text-xl mt-6 text-center text-gray-700 max-w-2xl leading-relaxed px-4">
                                    {renderOracleText(card.oracle_text)}
                                </p>

                                {card.flavor_text && card.flavor_text !== 'None' && (
                                    <p className='text-lg mt-4 text-center text-gray-500 italic max-w-2xl px-4'>
                                        "{card.flavor_text}"
                                    </p>
                                )}

                                <div className='grid grid-cols-2 gap-x-15 gap-y-4 mt-8 text-lg'>
                                    <div className='flex gap-x-15'>
                                        <span className='text-gray-500 font-medium'>Rarity:</span>
                                        <span className='text-gray-700 capitalize'>{card.rarity}</span>
                                    </div>
                                    
                                    {card.mv !== null && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Mana Value:</span>
                                            <span className='text-gray-700'>{card.mv}</span>
                                        </div>
                                    )}
                                    
                                    {card.power !== null && String(card.power) !== 'None' && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Power:</span>
                                            <span className='text-gray-700'>{card.power}</span>
                                        </div>
                                    )}
                                    
                                    {card.toughness !== null && String(card.toughness) !== 'None' && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Toughness:</span>
                                            <span className='text-gray-700'>{card.toughness}</span>
                                        </div>
                                    )}
                                    
                                    {card.loyalty && card.loyalty !== 'None' && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Loyalty:</span>
                                            <span className='text-gray-700'>{card.loyalty}</span>
                                        </div>
                                    )}
                                    
                                    {card.price_usd !== null && String(card.price_usd) !== '0.00' && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Price:</span>
                                            <span className='text-gray-700'>${card.price_usd}</span>
                                        </div>
                                    )}
                                    
                                    {card.price_foil_usd !== null && String(card.price_foil_usd) !== '0.00' && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Foil Price:</span>
                                            <span className='text-gray-700'>${card.price_foil_usd}</span>
                                        </div>
                                    )}
                                    
                                    {card.edhrec_rank && (
                                        <div className='flex justify-between'>
                                            <span className='text-gray-500 font-medium'>Rank:</span>
                                            <span className='text-gray-700'>#{card.edhrec_rank}</span>
                                        </div>
                                    )}
                                </div>
                                {coloridentity && producedmana &&
                                    JSON.stringify(coloridentity) === JSON.stringify(producedmana) ? (
                                        <div className="flex flex-col items-center mt-6">
                                            <span className="text-gray-500 text-lg font-medium mb-2">
                                                Color Identity &amp; Produced Mana:
                                            </span>
                                            <div className="flex justify-center items-center gap-2">
                                                {coloridentity.map((item, index) => {
                                                    const symbol = typeof item === 'string' ? item : item.colorChar;
                                                    const key = `{${symbol}}`;
                                                    const imgUrl = colors[key];
                                                    return (
                                                        imgUrl ? (
                                                            <img
                                                                key={`${symbol}-${index}`}
                                                                src={imgUrl}
                                                                alt={symbol}
                                                                className="w-8 h-8"
                                                            />
                                                        ) : null
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {coloridentity && coloridentity.length > 0 && (
                                                <div className="flex flex-col items-center mt-6">
                                                    <span className="text-gray-500 text-lg font-medium mb-2">
                                                        Color Identity:
                                                    </span>
                                                    <div className="flex justify-center items-center gap-2">
                                                        {coloridentity.map((item, index) => {
                                                            const symbol = typeof item === 'string' ? item : item.colorChar;
                                                            const key = `{${symbol}}`;
                                                            const imgUrl = colors[key];
                                                            return (
                                                                imgUrl ? (
                                                                    <img
                                                                        key={`${symbol}-${index}`}
                                                                        src={imgUrl}
                                                                        alt={symbol}
                                                                        className="w-8 h-8"
                                                                    />
                                                                ) : null
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {producedmana && producedmana.length > 0 && (
                                                <div className="flex flex-col items-center mt-6">
                                                    <span className="text-gray-500 text-lg font-medium mb-2">
                                                        Produced Mana:
                                                    </span>
                                                    <div className="flex justify-center items-center gap-2">
                                                        {producedmana.map((item, index) => {
                                                            const symbol = typeof item === 'string' ? item : item.colorChar;
                                                            const key = `{${symbol}}`;
                                                            const imgUrl = colors[key];
                                                            return (
                                                                imgUrl ? (
                                                                    <img
                                                                        key={`${symbol}-${index}`}
                                                                        src={imgUrl}
                                                                        alt={symbol}
                                                                        className="w-8 h-8"
                                                                    />
                                                                ) : null
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )
                                }
                                <div className='mt-6 text-center'>
                                    <p className='text-gray-600'>
                                        <span className='font-medium'>{card.set_name}</span> ({card.set})
                                    </p>
                                    <p className='text-sm text-gray-500 mt-1'>
                                        {card.set_type} • Released {new Date(card.released_at).toLocaleDateString()} • {card.collector_number}
                                    </p>
                                    <p className='text-sm text-gray-500 mt-1'>Illustrated by {card.artist}</p>
                                </div>

                                <h2 className='text-2xl font-semibold text-gray-600 mt-10 mb-4'>Format Legality</h2>
                                                            

                                {legalities ? (
                                    <div className='grid grid-cols-3 gap-9 gap-x-11 text-gray-600 mt-5 ml-[10%] mb-50'> 
                                        {Object.entries(legalities).sort(([a], [b]) => a.localeCompare(b)).map(([format, value]) => (
                                            format !== 'cardID' ? (
                                                <div key={format} className='flex items-center space-x-2'>
                                                    {value == 1 ? (
                                                        <CircleCheckBig className="text-green-500 w-5 h-5"/>
                                                    ) : (
                                                        <CircleOff className='text-red-500 w-5 h-5'/>
                                
                                                    )}
                                                    <span className="capitalize">{format}</span>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                ) : (
                                    <p>Loading legalities...</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {decks.length > 0 ? (
                        <div className='flex flex-col items-center mt-30'>
                            <h2 className='text-gray-600 text-3xl font-semibold mb-8'>Popular Decks Using This Card</h2>
                            <div className=" px-[12%] grid grid-cols-1md:grid-cols-2 lg:grid-cols-3 justify--items-center gap-6 ">
                                    {decks.map((deck) => (
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
                                    ))}
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
