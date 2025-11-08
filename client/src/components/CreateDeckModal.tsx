import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface CreateDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (deckData: any) => void;
}

export default function CreateDeckModal({ isOpen, onClose, onApply }: CreateDeckModalProps){
    const { display_name } = useAuth();
    const [formData, setFormData] = useState({title: '', format: '', is_private: 'false', name: display_name})
    const [errors, setErrors] = useState({ title: '', format: '' });
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    if (!isOpen) return null;

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
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!formData.title.trim() && !formData.format.trim()) {
            setErrors({ title: '', format: '' });
            return;
        }
        const newErrors = { title: '', format: '' };
    
        if (!formData.title.trim()) newErrors.title = 'Please enter a title';
        if (!formats.includes(formData.format.toLowerCase())) {
            newErrors.format = 'Please select a valid format';
        }
        
        if (newErrors.title || newErrors.format) {
            setErrors(newErrors);
            return;
        }
    
        setErrors({ title: '', format: '' });
        onApply(formData);
        setFormData({ title: '', format: '', is_private: 'false', name: display_name });
    }
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full m-4" onClick={(e) => e.stopPropagation()}>
                <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">Create New Deck</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Deck Title
                        </label>
                        <input
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all"
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Enter deck name"
                            value={formData.title}
                            onChange={handleChange}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1.5">{errors.title}</p>
                        )}
                    </div>

                    <div className="flex gap-3 items-start">
                        <div className="relative flex-1">
                            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                                Format
                            </label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all"
                                type="text"
                                id="format"
                                name="format"
                                placeholder="e.g., Commander, Modern..."
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
                                            className="px-4 py-2.5 text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg capitalize"
                                        >
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            
                            {errors.format && (
                                <p className="text-red-500 text-sm mt-1.5">{errors.format}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="mt-[1.85rem] bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}