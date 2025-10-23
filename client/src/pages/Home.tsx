import background from '../assets/home_background.jpg';


export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}> 
            <h1 className="text-9xl font-bold text-white">HOME PAGE</h1>
            <p className="mt-4 text-2xl text-white">Events, Top Decks, Popular Combos, Search Bar</p>
        </div>
    );
}
