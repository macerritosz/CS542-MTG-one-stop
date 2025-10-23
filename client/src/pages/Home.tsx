import { useState } from "react";
import background from '../assets/home_background.jpg';
import { buildUrl } from  'build-url-ts';


export default function Home() {
    const [url, setUrl] = useState<string>("");
    const [locationString, setLocationString] = useState<string>("");
    
    async function getAddressFromCoords(lat: Number, lng: number) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const { city, town, village, state, country } = data.address;
            const finalCity = city || town || village || "";
            const finalString = `${finalCity}, ${state}, ${country}`;
            setLocationString(finalString)
            return finalString
        } catch (error) {
            console.error("Error fetching address", error);
        }
    }

    async function handleGetLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationString = await getAddressFromCoords(latitude, longitude);

                    const urlBuilder = buildUrl('https://locator.wizards.com', {
                        path: 'search',
                        queryParams: {
                            searchType: 'magic-events',
                            query: locationString,
                            distance: 10,
                            page: 1,
                            sort: 'date',
                            sortDirection: 'Asc'
                        },
                    });

                    setUrl(urlBuilder);
                    console.log(urlBuilder);
                },
                (error) => {
                    console.error("Geolocation error:", error.message);
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.error("Geolocation didn't work");
        }
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(${background})` }}> 
            <h1 className="text-9xl font-bold text-white">HOME PAGE</h1>
            <p className="mt-4 text-2xl text-white">Events, Top Decks, Popular Combos, Search Bar</p>
            <button className="mt-4 px-5 py-2 text-2xl text-white rounded-full border hover:bg-gray-500 active:bg-gray-700 transform active:scale-95 transition-all duration-150 shadow-lg" onClick={handleGetLocation}>Find My Location</button>
            <p className="mt-4 text-2xl text-white">{locationString}</p>
        </div>
    );
}
