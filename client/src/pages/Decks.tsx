import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import background from '../assets/search_background.jpg'

export default function Decks() {
    const location = useLocation();
    const navigate = useNavigate();
    const [decks, setDecks] = useState([]);
    const [query, setQuery] = useState('');

    const params = new URLSearchParams(location.search);

    useEffect(() => {
        const url_query = params.get("query")
        if (!url_query) return;
        
        setQuery(url_query);

        async function fetchDecks() {
          try {
            const res = await fetch(`http://localhost:5715/api/decks?query=${encodeURIComponent(url_query!)}`);
            const data = await res.json();
            console.log(data)
            setDecks(data);
          } catch (err) {
            console.error("Failed to fetch decks:", err);
          }
        };
        fetchDecks();
    }, [location.search]);

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
        <div className="h-screen bg-white">
            <div className="w-full h-[50vh] bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}> 
                <h1 className="text-9xl font-bold text-white">GATHERING MAGIC</h1>
                <p className="mt-4 text-2xl text-white">Query Decks</p>
            </div>
            <div className="m-20">
                <h1 className="text-6xl font-semibold text-gray-800">Deck Search</h1>
                <form onSubmit={handleSubmit} className="mt-5">
                    <input
                        className="border border-gray-400 rounded-lg px-4 py-2 w-140 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        type="text"
                        id="query"
                        name="query"
                        placeholder={`Search for decks`}
                        value={query}
                        onChange={handleChange}
                    />
                </form>
                <a href="/" className="text-gray-800 hover:underline mt-2 font-medium drop-shadow"> Advanced </a>
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


*/