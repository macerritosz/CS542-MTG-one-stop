import { useState } from 'react';
import background from '../assets/search_background.jpg';
import { useNavigate } from 'react-router-dom';

type FormType = 'cards' | 'decks'

export default function Search() {
    const [formData, setFormData] = useState( {type: 'cards', query: ''});
    const navigate = useNavigate();
    const selected = formData.type;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { value } = e.target;
        setFormData(prev => ( {...prev, ['query']: value }));
    }

    function handleToggle(value : FormType) {
        setFormData((prev) => ({ ...prev, type: value }));
      };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!formData.query.trim()) return;
        navigate(`/${formData.type}?query=${encodeURIComponent(formData.query)}&page=1`);
    }

    return (
        <div className="w-full h-screen bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}>
            <div className="w-[48rem] min-h-[35rem] flex flex-col items-center ">
            <h1 className="mt-30 text-7xl font-bold bg-gradient-to-r from-purple-300 via-blue-600 to-white bg-clip-text text-transparent leading-tight">
                Gathering Magic
            </h1>
            <p className="-mt-1 text-2xl text-gray-300 drop-shadow-lg font-medium">Search for Cards and player created Decks</p>
                <form onSubmit={handleSubmit} className="flex flex-col items-center mt-8">
                    <div className="relative flex bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full p-1 w-[200px] mb-2 shadow-lg">
                        <div className={`absolute top-1 left-1 w-1/2 h-[calc(100%-0.5rem)] rounded-full bg-gray-900 transition-transform duration-300 ease-in-out ${
                            selected === "decks" ? "translate-x-[94%]" : "translate-x-0"}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleToggle("cards")}
                            className={`relative z-10 flex-1 px-4 py-2 rounded-full transition-colors ${
                                selected === "cards" ? "text-white" : "text-gray-300"}`}
                        >
                            Cards
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggle("decks")}
                            className={`relative z-10 flex-1 px-4 py-2 rounded-full transition-colors ${
                                selected === "decks" ? "text-white" : "text-gray-300"}`}
                        >
                            Decks
                        </button>
                    </div>
                    <input
                        className="border border-gray-400 rounded-lg px-4 py-2 w-140 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        type="text"
                        id="query"
                        name="query"
                        placeholder={`Search for ${selected}`}
                        value={formData.query}
                        onChange={handleChange}
                    />
                </form>
                <a href="/" className="text-gray-300 hover:underline mt-2 font-medium drop-shadow"> Advanced </a>
            </div>
        </div>
    );
}
