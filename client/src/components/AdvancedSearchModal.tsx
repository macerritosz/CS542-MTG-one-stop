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
  set: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
}

const RARITIES = ['common', 'uncommon', 'rare', 'mythic', 'special'];
const COLORS = [
  { value: 'W', label: 'White', color: 'bg-white border-gray-300' },
  { value: 'U', label: 'Blue', color: 'bg-blue-500' },
  { value: 'B', label: 'Black', color: 'bg-black' },
  { value: 'R', label: 'Red', color: 'bg-red-500' },
  { value: 'G', label: 'Green', color: 'bg-green-500' },
  { value: 'C', label: 'Colorless', color: 'bg-gray-400' },
];
const FORMATS = ['standard', 'modern', 'commander', 'legacy', 'pioneer', 'vintage', 'pauper'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'mv', label: 'Mana Value' },
  { value: 'edhrec_rank', label: 'EDHREC Rank' },
  { value: 'released_at', label: 'Release Date' },
];

export default function AdvancedSearchModal({ isOpen, onClose, onApply, currentFilters }: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

  // Sync filters with currentFilters prop when modal opens or filters change externally
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleRarityToggle = (rarity: string) => {
    setFilters(prev => ({
      ...prev,
      rarity: prev.rarity.includes(rarity)
        ? prev.rarity.filter(r => r !== rarity)
        : [...prev.rarity, rarity]
    }));
  };

  const handleColorToggle = (color: string, type: 'colors' | 'colorIdentity') => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(color)
        ? prev[type].filter(c => c !== color)
        : [...prev[type], color]
    }));
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
      set: '',
      sortBy: 'name',
      sortOrder: 'asc',
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
          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Rarity</label>
            <div className="flex flex-wrap gap-2">
              {RARITIES.map(rarity => (
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

          {/* Colors Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Colors</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
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
          </div>

          {/* Color Identity Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Color Identity</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
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
          </div>

          {/* Mana Value Range */}
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

          {/* Format Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Format Legality</label>
            <select
              value={filters.format}
              onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Any Format</option>
              {FORMATS.map(format => (
                <option key={format} value={format}>
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
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

          {/* Set Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Set Name</label>
            <input
              type="text"
              placeholder="e.g., Foundations"
              value={filters.set}
              onChange={(e) => setFilters(prev => ({ ...prev, set: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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

