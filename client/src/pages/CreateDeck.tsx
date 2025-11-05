import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import background from '../assets/createdeck_background.jpg';

export default function CreateDeck(){
    const { display_name } = useAuth();
    const [formData, setFormData] = useState({title: '', format: '', is_private: 'false', name: display_name})
    const [errors, setErrors] = useState({ title: '', format: '' });
    const [showSuggestions, setShowSuggestions] = useState(false);

    const formats = [
        'standard', 'future', 'historic', 'timeless', 'gladiator',
        'pioneer', 'modern', 'legacy', 'pauper', 'vintage', 'penny',
        'commander', 'oathbreaker', 'standardbrawl', 'brawl', 'alchemy',
        'paupercommander', 'duel', 'oldschool', 'premodern', 'predh'
    ];

    const filteredFormats = formData.format ? formats.filter(f => f.toLowerCase().includes(formData.format.toLowerCase())) : [];

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));

        if (name === 'format') setShowSuggestions(true);
    }

    function handleSelectFormat(format: string) {
        setFormData(prev => ({ ...prev, format }));
        setShowSuggestions(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        
        if (!formData.title.trim() && !formData.format.trim()) {
            setErrors({ title: '', format: ''})
            return;
        }

        const newErrors = { title: '', format: '' };

        if (!formData.title.trim()) newErrors.title = 'Please enter a title';
    
        if (!formats.includes(formData.format.toLowerCase())) newErrors.format = 'Please select a valid format';
        
        if (newErrors.title || newErrors.format) {
            setErrors(newErrors);
            return;
        }

        setErrors({ title: '', format: ''})
        setFormData({ title: '', format: '', is_private: 'false', name: display_name });

        try {
            const res = await fetch("http://localhost:5715/api/decks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                console.log(data)
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    };
    
    return (
        <div className="h-screen bg-gray-100/10">
            <div className="w-full h-full bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}> 
                <div>
                    <h1 className="text-8xl font-bold text-white text-center">Create Deck</h1>
                    <p className="text-2xl font-semibold text-white/90 mt-4 text-center">Make the next biggest masterpiece</p>
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="mt-[8%] flex flex-col items-center gap-2 w-full">
                    <input
                        className="text-lg bg-white rounded-md px-3 py-[1.5%] w-full shadow-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        />
                        
                        <div className="h-5 flex items-center justify-center -mt-1">
                            {errors.title && (
                                <p className="text-white text-sm text-center">{errors.title}</p>
                            )}
                        </div>
                        
                        <div className="flex items-start justify-center gap-5 w-full">
                            <div className="relative flex-1">
                                <input
                                    className="text-lg bg-white rounded-md px-3 py-[1.5%] w-full shadow-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    type="text"
                                    id="format"
                                    name="format"
                                    placeholder="Format"
                                    value={formData.format}
                                    onChange={handleChange}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    onFocus={() => formData.format && setShowSuggestions(true)}
                                    autoComplete="off"
                                />
                                {showSuggestions && filteredFormats.length > 0 && (
                                <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                                    {filteredFormats.map((f, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSelectFormat(f)}
                                        className="px-4 py-2 text-gray-700 hover:bg-purple-100 cursor-pointer transition-all"
                                    >
                                        {f}
                                    </li>
                                    ))}
                                </ul>
                                )}
                                <div className="h-5 flex items-center justify-center mt-1">
                                    {errors.format && (
                                        <p className="text-white text-sm text-center">{errors.format}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="bg-purple-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-purple-600 hover:shadow-lg active:bg-purple-700 transition-all"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            
            </div>
        </div>
    );
}