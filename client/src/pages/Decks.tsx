import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/search_background.jpg'
import { useAuth } from '../contexts/AuthContext';

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

export default function Decks() {
    const location = useLocation();
    const navigate = useNavigate();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState('All Decks')
    const { isAuthenticated, display_name } = useAuth();

    const params = new URLSearchParams(location.search);

    useEffect(() => {
        const url_query = params.get("query")
        const url_page = parseInt(params.get("page") || "1", 10);

        if (!url_query) return;
        
        setQuery(url_query)
        setPage(url_page);

        async function fetchDecks() {
          try {
            let url = `http://localhost:5715/api/decks?query=${encodeURIComponent(url_query!)}&page=${url_page}`;
            if (selected === "My Decks") url += `&name=${encodeURIComponent(display_name!)}`;
            
            const res = await fetch(url);
            const data = await res.json();

            setDecks(data.decks);
            setTotalPages(data.totalPages || 1);

          } catch (err) {
            console.error("Failed to fetch decks:", err);
          }
        };
        fetchDecks();
    }, [location.search, selected]);

    function changePage(newPage: number) {
        navigate(`/decks?query=${encodeURIComponent(query)}&page=${newPage}`);
    }
    
    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { value } = e.target;
        setQuery(value);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
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
                                <button className='px-7 py-2 rounded-lg outline-none ring-1 ring-purple-500 text-purple-500 hover:scale-105 transition-all duration-200'>
                                    Sort
                                </button>
                                {isAuthenticated && (
                                    <a href="/createdeck" className='px-3 py-2 rounded-lg outline-none ring-1 ring-blue-500 text-blue-500 hover:scale-105 transition-all duration-200 whitespace-nowrap'>
                                        Create Deck
                                    </a>
                                )}
                            </div>
                            
                            <a href="/" className="absolute left-1/2 -translate-x-1/2 -bottom-[1.5rem] bg-white text-purple-500 text-sm px-3 py-0.5 rounded-b-lg border-x border-b border-purple-500 hover:underline">Advanced Search </a>
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
                        })
                    ) : (
                        <p className="text-gray-600 mt-10 col-span-full text-center">No decks found.</p>
                    )}
                </div>
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


/*
IDEAS:
advanced search overlay modal

trigger idea- amount of decks this card is in - derived value for card 
*/


/*

TODO- 
on load get event location and when user presses refresh it will get it

deck needs a certain amount of cards to publish


what need for each card:
produced mana- 
difference between color identity and colors to card??

i dont think we need colors to card


*/
