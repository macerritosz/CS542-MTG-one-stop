import { FaSearch } from 'react-icons/fa'; 
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
    <nav className="w-full fixed top-0 left-0 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex justify-between items-center w-full">
            <a href="/" className="text-2xl font-bold text-blue-400">
                MTG One Stop Shop
            </a>
            <a href="/" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Home
            </a>
            <a href="/cards" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Cards
            </a>
            <a href="/decks" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Decks
            </a>
            <a href="/wiki" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Wiki
            </a>
            <a href="/Profile" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Profile
            </a>
          
          <div className="flex items-center justify-center space-x-6">
            <button className="px-5 py-2 border border-blue-400 text-blue-400 rounded-full hover:border-white transition-colors">
              Login
            </button>
            <button 
                className="px-6 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition">
              Sign Up
            </button>
            <FaSearch className={'w-5 h-5'}/>
          </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
