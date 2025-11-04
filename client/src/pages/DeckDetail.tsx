import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";

interface Card {
    image_uris: string;
    cardID: string;
}

export default function DeckDetail() {
    const { deckID } = useParams();
    const [cards, setCards] = useState<Card[]>([]);
    
    useEffect(() => {
        if (!deckID) return;
       
        async function fetchCards() {
          try {
            const res = await fetch(`http://localhost:5715/api/decks/info?deckID=${encodeURIComponent(deckID!)}`);
            const data = await res.json();
            console.log(data)
            setCards(data.card_info);
          } catch (err) {
            console.error("Failed to fetch cards:", err);
          }
        };
        fetchCards();
    }, []);


    return(
        <div 
            className="mt-20 px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify--items-center gap-6 "
        >
            {cards.length > 0 ? (
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
    );
}
