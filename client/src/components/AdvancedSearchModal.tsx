import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

interface AdvancedSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: AdvancedFilters) => void;
    currentFilters: AdvancedFilters;
}

export default function AdvancedSearchModal({ isOpen, onClose, onApply, currentFilters }: AdvancedSearchModalProps) {
    const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

    const rarities = ['common', 'uncommon', 'rare', 'mythic'];
    const colors = [
        { value: 'W', label: 'White', color: 'bg-white border-gray-300' },
        { value: 'U', label: 'Blue', color: 'bg-blue-500' },
        { value: 'B', label: 'Black', color: 'bg-black' },
        { value: 'R', label: 'Red', color: 'bg-red-500' },
        { value: 'G', label: 'Green', color: 'bg-green-500' },
        { value: 'C', label: 'Colorless', color: 'bg-gray-400' },
    ];
    const formats = ['standard', 'future', 'historic', 'timeless', 'gladiator', 'pioneer', 'modern', 'legacy', 'pauper', 'vintage', 'penny', 'commander', 'oathbreaker', 'standardbrawl', 'brawl', 'alchemy', 'paupercommander', 'duel', 'oldschool', 'premodern', 'predh'];
  
    useEffect(() => {
        if (isOpen) setFilters(currentFilters);
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const handleRarityToggle = (rarity: string) => {
        setFilters(prev => ({...prev, rarity: prev.rarity.includes(rarity) ? prev.rarity.filter(r => r !== rarity) : [...prev.rarity, rarity]}));
    };

    const handleColorToggle = (color: string, type: 'colors' | 'colorIdentity') => {
        setFilters(prev => ({...prev, [type]: prev[type].includes(color) ? prev[type].filter(c => c !== color) : [...prev[type], color]}));
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters: AdvancedFilters = {
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
        setFilters(clearedFilters);
        onApply(clearedFilters);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Advanced Search</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Rarity</label>
                        <div className="flex flex-wrap gap-2">
                            {rarities.map(rarity => (
                                <button
                                    key={rarity}
                                    onClick={() => handleRarityToggle(rarity)}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                        filters.rarity.includes(rarity)
                                        ? 'bg-purple-500 text-white border-purple-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                                    }`}
                                >
                                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Colors</label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => handleColorToggle(color.value, 'colors')}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                        filters.colors.includes(color.value)
                                        ? 'ring-2 ring-purple-500 ring-offset-2'
                                        : 'border-gray-300'
                                    } ${color.color} ${color.value === 'W' ? 'text-gray-800' : 'text-white'}`}
                                >
                                    {color.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, colorLogic: 'OR' }))}
                            className={`px-3 py-1 text-sm mt-3 rounded ${filters.colorLogic === 'OR' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                        >
                            OR
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, colorLogic: 'AND' }))}
                            className={`px-3 py-1 text-sm rounded ${filters.colorLogic === 'AND' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                        >
                            AND
                         </button>
                        
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Color Identity</label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => handleColorToggle(color.value, 'colorIdentity')}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                        filters.colorIdentity.includes(color.value)
                                        ? 'ring-2 ring-blue-500 ring-offset-2'
                                        : 'border-gray-300'
                                    } ${color.color} ${color.value === 'W' ? 'text-gray-800' : 'text-white'}`}
                                >
                                    {color.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, colorIdentityLogic: 'OR' }))}
                            className={`px-3 py-1 mt-3 text-sm rounded ${filters.colorIdentityLogic === 'OR' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                        >
                            OR
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, colorIdentityLogic: 'AND' }))}
                            className={`px-3 py-1 text-sm rounded ${filters.colorIdentityLogic === 'AND' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                        >
                            AND
                         </button>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Mana Value</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="0"
                                max="20"
                                placeholder="Min"
                                value={filters.manaValueMin}
                                onChange={(e) => setFilters(prev => ({ ...prev, manaValueMin: e.target.value }))}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                placeholder="Max"
                                value={filters.manaValueMax}
                                onChange={(e) => setFilters(prev => ({ ...prev, manaValueMax: e.target.value }))}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Format Legality</label>
                        <select
                            value={filters.format}
                            onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Any Format</option>
                            {formats.map(format => (
                                <option key={format} value={format}>
                                {format.charAt(0).toUpperCase() + format.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (USD)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Min"
                                value={filters.priceMin}
                                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Max"
                                value={filters.priceMax}
                                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={handleClear}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}