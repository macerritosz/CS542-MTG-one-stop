import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Cards from './pages/Cards';
import Decks from './pages/Decks';
import Wiki from './pages/Wiki';
import CreateDeck from './pages/CreateDeck';
import Login from './pages/Login';
import SignUp from './pages/SignUp';


export default function App() {
    return (
        <BrowserRouter>
            <Navbar/>
 
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/cards' element={<Cards/>}/>
                <Route path='/decks' element={<Decks/>}/>
                <Route path='/wiki' element={<Wiki/>}/>
                <Route path='/createdeck' element={<CreateDeck/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/signup' element={<SignUp/>}/>
            </Routes>
        </BrowserRouter>
    );
}