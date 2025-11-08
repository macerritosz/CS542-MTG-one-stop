import { FaSearch } from 'react-icons/fa'; 
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth();
  
    return (
    <nav className="w-full relative bg-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex justify-between items-center w-full">
            <a href="/" className="text-2xl font-bold text-blue-400">
                MTG One Stop Shop
            </a>
            <a href="/" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Home
            </a>
            <a href="/search" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Search
            </a>
            <a href="/#about" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              About
            </a>
            <a href="/#mission" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Our Mission
            </a>
            <a href="/wiki" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Wiki
            </a>
            <a href="/Profile" className="text-gray-700 hover:text-blue-400 text-lg font-medium transition-colors">
              Profile
            </a>
          
          <div className="flex items-center justify-center space-x-6">
            {!isAuthenticated && ( 
              <>
                <a href="/login" className="px-5 py-2 border border-blue-400 text-blue-400 rounded-full hover:border-white transition-colors">
                  Login
                </a>
                <a href="/signup" className="px-6 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition">
                  Sign Up
                </a>
              </>
            )}
            {isAuthenticated && (
              <button onClick={logout} className="px-5 py-2 border border-blue-400 text-blue-400 rounded-full hover:border-white transition-colors">
                Logout
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
