import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import background from '../assets/deckdetail_background.png';

interface Card {
    image_uris: string;
    cardID: string;
}

export default function DeckDetail() {
    const { deckID } = useParams();
    const [cards, setCards] = useState<Card[]>([]);
    const [title, setTitle] = useState('');
    const [format, setFormat] = useState('');
    
    useEffect(() => {
        if (!deckID) return;
       
        async function fetchCards() {
          try {
            const res = await fetch(`http://localhost:5715/api/decks/info?deckID=${encodeURIComponent(deckID!)}`);
            const data = await res.json();
            setCards(data.card_info);
            setTitle(data.title);
            setFormat(data.format);
          } catch (err) {
            console.error("Failed to fetch cards:", err);
          }
        };
        fetchCards();
    }, []);


    return(
        <div className="h-screen bg-gray-100/10">
            <div className="w-full h-[50vh] bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}> 
                <h1 className="text-9xl font-bold text-white">{title}</h1>
                <p className="text-3xl font-semibold text-white">{format}</p>
            </div>
            <div className="mt-15 mx-35">
                <div 
                    className="mt-20 px-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify--items-center gap-6 "
                >
                    {cards && cards.length > 0 ? (
                        cards.map((card) => (
                            <div key={card.cardID} 
                                className="relative group w-full transition-transform duration-200"
                            >
                                <img
                                    src={card.image_uris}
                                    alt={`Card ${card.cardID}`}
                                    className="w-full h-auto object-cover rounded-lg shadow-md"
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 mt-10 col-span-full text-center">No cards found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
