import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 
import ProtectedRoute from './router/ProtectedRoute';
import PublicOnlyRoute from './router/PublicOnlyRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Cards from './pages/Cards';
import Decks from './pages/Decks';
import Wiki from './pages/Wiki';
import CreateDeck from './pages/CreateDeck';
import Auth from './pages/Auth';
import DeckDetail from './components/DeckDetail';
import CardDetail from './components/CardDetail';

function Layout() {
    const location = useLocation();
    const hideNavbar = ["/login", "/signup"].includes(location.pathname);

    return (
        <>
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/search' element={<Search/>}/>
                <Route path='/cards' element={<Cards/>}/>
                <Route path='/cards/:cardID' element={<CardDetail/>}/>
                <Route path='/decks' element={<Decks/>}/>
                <Route path='/decks/:deckID' element={<DeckDetail/>}/>
                <Route path='/wiki' element={<Wiki/>}/>
                <Route path='/createdeck' element={<ProtectedRoute><CreateDeck/></ProtectedRoute>}/>
                <Route path='/login' element={<PublicOnlyRoute> <Auth/></PublicOnlyRoute> }/>
                <Route path='/signup' element={<PublicOnlyRoute> <Auth/> </PublicOnlyRoute>}/>
            </Routes>
        </>
    );
}

export default function App() {
    return (
      <AuthProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    );
  }