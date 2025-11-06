import { FaSearch } from 'react-icons/fa'; 
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
    <nav className="w-full fixed top-0 left-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-bold text-blue-400 whitespace-nowrap">
            MTG One Stop Shop
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">Home</a>
            <a href="#about" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">About</a>
            <a href="/search" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">Search</a>
            <a href="/wiki" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">Wiki</a>
            <a href="/Profile" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">Profile</a>
            <div className="flex items-center justify-center space-x-6">
              {!isAuthenticated && (
                <>
                  <a href="/login" className="px-5 py-2 border border-blue-400 text-blue-400 rounded-full hover:border-white transition-colors">Login</a>
                  <a href="/signup" className="px-6 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition">Sign Up</a>
                </>
              )}
              {isAuthenticated && (
                <button onClick={logout} className="px-5 py-2 border border-blue-400 text-blue-400 rounded-full hover:border-white transition-colors">Logout</button>
              )}
              <FaSearch className={'w-5 h-5'}/>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            aria-label="Toggle Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
              <a href="/" className="py-2 text-gray-700 hover:text-blue-400">Home</a>
              <a href="#about" className="py-2 text-gray-700 hover:text-blue-400">About</a>
              <a href="/search" className="py-2 text-gray-700 hover:text-blue-400">Search</a>
              <a href="/wiki" className="py-2 text-gray-700 hover:text-blue-400">Wiki</a>
              <a href="/Profile" className="py-2 text-gray-700 hover:text-blue-400">Profile</a>
              <div className="flex items-center gap-3 pt-2">
                {!isAuthenticated && (
                  <>
                    <a href="/login" className="flex-1 text-center px-4 py-2 border border-blue-400 text-blue-400 rounded-full">Login</a>
                    <a href="/signup" className="flex-1 text-center px-4 py-2 bg-blue-400 text-white rounded-full">Sign Up</a>
                  </>
                )}
                {isAuthenticated && (
                  <button onClick={logout} className="flex-1 text-center px-4 py-2 border border-blue-400 text-blue-400 rounded-full">Logout</button>
                )}
                <FaSearch className={'w-5 h-5 ml-auto'}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
