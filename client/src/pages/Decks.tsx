import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/search_background.jpg'

interface Deck {
    title: string;
    deckID: number;
}

export default function Decks() {
    const location = useLocation();
    const navigate = useNavigate();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const params = new URLSearchParams(location.search);

    useEffect(() => {
        const url_query = params.get("query")
        const url_page = parseInt(params.get("page") || "1", 10);

        if (!url_query) return;
        
        setQuery(url_query)
        setPage(url_page);

        async function fetchDecks() {
          try {
            const res = await fetch(`http://localhost:5715/api/decks?query=${encodeURIComponent(url_query!)}&page=${url_page}`);
            const data = await res.json();
            setDecks(data.decks);
            setTotalPages(data.totalPages || 1);
          } catch (err) {
            console.error("Failed to fetch decks:", err);
          }
        };
        fetchDecks();
    }, [location.search]);

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
                        <div className='relative'>
                            <input
                                className="relative z-20 border border-gray-400 rounded-lg px-4 py-2 w-140 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                type="text"
                                id="query"
                                name="query"
                                placeholder="Search for decks"
                                value={query}
                                onChange={handleChange}
                            />
                            <a href="/" className="absolute left-1/2 -translate-x-1/2 -bottom-[1.5rem] bg-gray-100 text-gray-800 text-sm px-3 py-0.5 rounded-b-lg border-x border-b border-gray-400 hover:underline">Advanced Search </a>
                        </div>
                    </form>
                </div>
                <div className="mt-20 px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify--items-center gap-6 ">
                    {decks.length > 0 ? (
                        decks.map((deck) => (
                            /*
                            <img
                                key={idx}
                                src={deck.title}
                                alt={`Deck ${idx}`}
                                className="w-full h-auto object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                            />
                            */
                           <a href={`/decks/${deck.deckID}`}> {deck.title}</a>
                        ))
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

SEACH PAGE:
sliding toggle between cards and decks
placeholder changes between Search for cards and Search for decks
search is going to be centered with cool image behind

once searched therse going to be an image 1/3 top h-screen and then like Card Search underneath with differnt fields ~ similar to mox field
also going to be a advanced search overlay modal

on deck page 
under Search deck theses going to be All decks, then a Your Decks toggle
*/


/*

TODO- 
authentication

home page

on load get event location and when user presses refresh it will get it


image for deck is collage of cards inside it
*/