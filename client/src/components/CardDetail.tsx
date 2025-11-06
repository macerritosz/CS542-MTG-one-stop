import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { CircleOff, CircleCheckBig, Store, Search } from 'lucide-react';

interface Card {
    cardID: string;
    oracle_id: string;
    name: string;
    released_at: string;
    set: string;
    set_name: string;
    set_type: string;
    collector_number: string;
    rarity: string;
    mana_cost: string;
    mv: number;
    oracle_text: string;
    power: number;
    loyalty: string;
    toughness: number;
    price_usd: number;
    price_foil_usd: number;
    image_uris: string;
    flavor_text: string;
    artist: string;
    scryfall_uri: string;
    rulings_uri: string;
    purchase_uris: string;
    edhrec_rank: number;
}

interface Legalities {
    [key: string]: number;
}

interface Keyword {
    keyword: string
}

interface ProducedMana {
    colorChar: string;
}

interface ColorIdentity {
    colorChar: string;
}

export default function CardInfo(){
    const navigate = useNavigate();
    const { cardID } = useParams();
    const [card, setCard] = useState<Card | null>(null);
    const [legalities, setLegalities] = useState<Legalities | null>(null);
    const [keywords, setKeywords] = useState<Keyword[] | null>(null);
    const [producedmana, setProducedMana] = useState<ProducedMana[] | null>(null);
    const [coloridentity, setColorIdentity] = useState<ColorIdentity[] | null>(null);


    const colors: Record<string, string> = {
        '{W}': 'https://svgs.scryfall.io/card-symbols/W.svg',
        '{U}': 'https://svgs.scryfall.io/card-symbols/U.svg',
        '{B}': 'https://svgs.scryfall.io/card-symbols/B.svg',
        '{R}': 'https://svgs.scryfall.io/card-symbols/R.svg',
        '{G}': 'https://svgs.scryfall.io/card-symbols/G.svg',
        '{C}': 'https://svgs.scryfall.io/card-symbols/C.svg',
        
        '{0}': 'https://svgs.scryfall.io/card-symbols/0.svg',
        '{1}': 'https://svgs.scryfall.io/card-symbols/1.svg',
        '{2}': 'https://svgs.scryfall.io/card-symbols/2.svg',
        '{3}': 'https://svgs.scryfall.io/card-symbols/3.svg',
        '{4}': 'https://svgs.scryfall.io/card-symbols/4.svg',
        '{5}': 'https://svgs.scryfall.io/card-symbols/5.svg',
        '{6}': 'https://svgs.scryfall.io/card-symbols/6.svg',
        '{7}': 'https://svgs.scryfall.io/card-symbols/7.svg',
        '{8}': 'https://svgs.scryfall.io/card-symbols/8.svg',
        '{9}': 'https://svgs.scryfall.io/card-symbols/9.svg',
        '{10}': 'https://svgs.scryfall.io/card-symbols/10.svg',
        '{11}': 'https://svgs.scryfall.io/card-symbols/11.svg',
        '{12}': 'https://svgs.scryfall.io/card-symbols/12.svg',
        '{13}': 'https://svgs.scryfall.io/card-symbols/13.svg',
        '{14}': 'https://svgs.scryfall.io/card-symbols/14.svg',
        '{15}': 'https://svgs.scryfall.io/card-symbols/15.svg',
        '{16}': 'https://svgs.scryfall.io/card-symbols/16.svg',
        '{17}': 'https://svgs.scryfall.io/card-symbols/17.svg',
        '{18}': 'https://svgs.scryfall.io/card-symbols/18.svg',
        '{19}': 'https://svgs.scryfall.io/card-symbols/19.svg',
        '{20}': 'https://svgs.scryfall.io/card-symbols/20.svg',
        
        '{X}': 'https://svgs.scryfall.io/card-symbols/X.svg',
        '{Y}': 'https://svgs.scryfall.io/card-symbols/Y.svg',
        '{Z}': 'https://svgs.scryfall.io/card-symbols/Z.svg',
        
        '{W/U}': 'https://svgs.scryfall.io/card-symbols/WU.svg',
        '{W/B}': 'https://svgs.scryfall.io/card-symbols/WB.svg',
        '{U/B}': 'https://svgs.scryfall.io/card-symbols/UB.svg',
        '{U/R}': 'https://svgs.scryfall.io/card-symbols/UR.svg',
        '{B/R}': 'https://svgs.scryfall.io/card-symbols/BR.svg',
        '{B/G}': 'https://svgs.scryfall.io/card-symbols/BG.svg',
        '{R/G}': 'https://svgs.scryfall.io/card-symbols/RG.svg',
        '{R/W}': 'https://svgs.scryfall.io/card-symbols/RW.svg',
        '{G/W}': 'https://svgs.scryfall.io/card-symbols/GW.svg',
        '{G/U}': 'https://svgs.scryfall.io/card-symbols/GU.svg',
        
        '{W/P}': 'https://svgs.scryfall.io/card-symbols/WP.svg',
        '{U/P}': 'https://svgs.scryfall.io/card-symbols/UP.svg',
        '{B/P}': 'https://svgs.scryfall.io/card-symbols/BP.svg',
        '{R/P}': 'https://svgs.scryfall.io/card-symbols/RP.svg',
        '{G/P}': 'https://svgs.scryfall.io/card-symbols/GP.svg',
        '{P}': 'https://svgs.scryfall.io/card-symbols/P.svg',
        
        '{2/W}': 'https://svgs.scryfall.io/card-symbols/2W.svg',
        '{2/U}': 'https://svgs.scryfall.io/card-symbols/2U.svg',
        '{2/B}': 'https://svgs.scryfall.io/card-symbols/2B.svg',
        '{2/R}': 'https://svgs.scryfall.io/card-symbols/2R.svg',
        '{2/G}': 'https://svgs.scryfall.io/card-symbols/2G.svg',
        
        '{S}': 'https://svgs.scryfall.io/card-symbols/S.svg',
        
        '{T}': 'https://svgs.scryfall.io/card-symbols/T.svg',
        '{Q}': 'https://svgs.scryfall.io/card-symbols/Q.svg',
        
        '{E}': 'https://svgs.scryfall.io/card-symbols/E.svg',
        
        '{HW}': 'https://svgs.scryfall.io/card-symbols/HW.svg',
        '{HR}': 'https://svgs.scryfall.io/card-symbols/HR.svg',
    }

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (!cardID) return;
       
        async function fetchCard() {
          try {
            const res = await fetch(`http://localhost:5715/api/card/info?cardID=${encodeURIComponent(cardID!)}`);
            const data = await res.json();
            setCard(data.card);
            setLegalities(data.legalities);
            setKeywords(data.keywords)
            setProducedMana(data.produced_mana)
            setColorIdentity(data.color_identity)
          } catch (err) {
            console.error("Failed to fetch card:", err);
          }
        };
        fetchCard();
    }, []);

    function renderOracleText(text: string): React.ReactNode[] {
        const parts = text.split(/(\{.*?\})/g);
    
        return parts.map((part, index) => {
            if (colors[part]) {
                return (
                    <img
                        key={index}
                        src={colors[part]}
                        alt={part}
                        className="inline-block w-5 h-5 mx-0.5 align-text-bottom"
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    }
    
    return (
        <div className="h-screen bg-gray-100/10">
            {card && (
                <div className="max-w-[1400px] mx-auto mt-20 flex gap-10 justify-center">
                        <div className="sticky top-20 h-fit self-start flex-shrink-0 flex flex-col items-center">
                        <img
                        src={card.image_uris}
                        alt={`Card ${card.cardID}`}
                        className="w-[380px] h-auto object-cover rounded-2xl shadow-md"
                        />
                        <div className="flex flex-col items-center gap-3 w-[250px] mt-8">
                            <a
                                href={card.purchase_uris}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex w-full items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 font-semibold px-8 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200"
                            >
                                <Store className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors duration-200" />
                                <span>Buy Card On TCG Player</span>
                            </a>

                            <a
                                href={card.scryfall_uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex w-full items-center justify-center gap-2 border-2 border-purple-500 text-purple-500 font-semibold px-8 py-3 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-200"
                            >
                                <Search className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors duration-200" />
                                <span>Find Card On Scryfall</span>
                            </a>
                        </div>

                    </div>
                    <div className="flex-1 min-w-0 max-w-3xl max-h-[80vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className='flex flex-col items-center'>
                        <div className='flex flex-wrap gap-6 items-center justify-center'>
                            <h1 className='text-4xl font-semibold text-gray-600'>{card.name}</h1>
                                {card.mana_cost && (
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                    {card.mana_cost.match(/\{.*?\}/g)?.map((symbol, index) => (
                                        <img
                                        key={`${symbol}-${index}`}
                                        src={colors[symbol]}
                                        alt={symbol}
                                        className="w-8 h-8"
                                        />
                                    ))}
                                    </div>
                                )}
                            </div>
                            {keywords ? (
                                <div className='flex gap-2 mt-3'>
                                    {keywords.map((item, index) => (
                                        <span key={index} className='text-3xl text-gray-400'>
                                            {item.keyword}{index < keywords.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                            <p className="text-xl mt-6 text-center text-gray-700 max-w-2xl leading-relaxed px-4">
                                {renderOracleText(card.oracle_text)}
                            </p>

                            {card.flavor_text && card.flavor_text !== 'None' && (
                                <p className='text-lg mt-4 text-center text-gray-500 italic max-w-2xl px-4'>
                                    "{card.flavor_text}"
                                </p>
                            )}

                            <div className='grid grid-cols-2 gap-x-15 gap-y-4 mt-8 text-lg'>
                                <div className='flex gap-x-5'>
                                    <span className='text-gray-500 font-medium'>Rarity:</span>
                                    <span className='text-gray-700 capitalize'>{card.rarity}</span>
                                </div>
                                
                                {card.mv !== null && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Mana Value:</span>
                                        <span className='text-gray-700'>{card.mv}</span>
                                    </div>
                                )}
                                
                                {card.power !== null && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Power:</span>
                                        <span className='text-gray-700'>{card.power}</span>
                                    </div>
                                )}
                                
                                {card.toughness !== null && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Toughness:</span>
                                        <span className='text-gray-700'>{card.toughness}</span>
                                    </div>
                                )}
                                
                                {card.loyalty && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Loyalty:</span>
                                        <span className='text-gray-700'>{card.loyalty}</span>
                                    </div>
                                )}
                                
                                {card.price_usd !== null && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Price:</span>
                                        <span className='text-gray-700'>${card.price_usd}</span>
                                    </div>
                                )}
                                
                                {card.price_foil_usd !== null && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Foil Price:</span>
                                        <span className='text-gray-700'>${card.price_foil_usd}</span>
                                    </div>
                                )}
                                
                                {card.edhrec_rank && (
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500 font-medium'>Rank:</span>
                                        <span className='text-gray-700'>#{card.edhrec_rank}</span>
                                    </div>
                                )}
                            </div>
                            {coloridentity && producedmana &&
                                JSON.stringify(coloridentity) === JSON.stringify(producedmana) ? (
                                    <div className="flex flex-col items-center mt-6">
                                        <span className="text-gray-500 text-lg font-medium mb-2">
                                            Color Identity &amp; Produced Mana:
                                        </span>
                                        <div className="flex justify-center items-center gap-2">
                                            {coloridentity.map((item, index) => {
                                                const symbol = typeof item === 'string' ? item : item.colorChar;
                                                const key = `{${symbol}}`;
                                                const imgUrl = colors[key];
                                                return (
                                                    imgUrl ? (
                                                        <img
                                                            key={`${symbol}-${index}`}
                                                            src={imgUrl}
                                                            alt={symbol}
                                                            className="w-8 h-8"
                                                        />
                                                    ) : null
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {coloridentity && coloridentity.length > 0 && (
                                            <div className="flex flex-col items-center mt-6">
                                                <span className="text-gray-500 text-lg font-medium mb-2">
                                                    Color Identity:
                                                </span>
                                                <div className="flex justify-center items-center gap-2">
                                                    {coloridentity.map((item, index) => {
                                                        const symbol = typeof item === 'string' ? item : item.colorChar;
                                                        const key = `{${symbol}}`;
                                                        const imgUrl = colors[key];
                                                        return (
                                                            imgUrl ? (
                                                                <img
                                                                    key={`${symbol}-${index}`}
                                                                    src={imgUrl}
                                                                    alt={symbol}
                                                                    className="w-8 h-8"
                                                                />
                                                            ) : null
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {producedmana && producedmana.length > 0 && (
                                            <div className="flex flex-col items-center mt-6">
                                                <span className="text-gray-500 text-lg font-medium mb-2">
                                                    Produced Mana:
                                                </span>
                                                <div className="flex justify-center items-center gap-2">
                                                    {producedmana.map((item, index) => {
                                                        const symbol = typeof item === 'string' ? item : item.colorChar;
                                                        const key = `{${symbol}}`;
                                                        const imgUrl = colors[key];
                                                        return (
                                                            imgUrl ? (
                                                                <img
                                                                    key={`${symbol}-${index}`}
                                                                    src={imgUrl}
                                                                    alt={symbol}
                                                                    className="w-8 h-8"
                                                                />
                                                            ) : null
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )
                            }
                            <div className='mt-6 text-center'>
                                <p className='text-gray-600'>
                                    <span className='font-medium'>{card.set_name}</span> ({card.set})
                                </p>
                                <p className='text-sm text-gray-500 mt-1'>
                                    {card.set_type} • Released {new Date(card.released_at).toLocaleDateString()} • {card.collector_number}
                                </p>
                                <p className='text-sm text-gray-500 mt-1'>Illustrated by {card.artist}</p>
                            </div>

                            <h2 className='text-2xl font-semibold text-gray-600 mt-10 mb-4'>Format Legality</h2>
                                                        

                            {legalities ? (
                                <div className='grid grid-cols-3 gap-9 gap-x-11 text-gray-600 mt-5 mb-50'> 
                                    {Object.entries(legalities).sort(([a], [b]) => a.localeCompare(b)).map(([format, value]) => (
                                        format !== 'cardID' ? (
                                            <div key={format} className='flex items-center space-x-2'>
                                                {value == 1 ? (
                                                    <CircleCheckBig className="text-green-500 w-5 h-5"/>
                                                ) : (
                                                    <CircleOff className='text-red-500 w-5 h-5'/>
                            
                                                )}
                                                <span className="capitalize">{format}</span>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            ) : (
                                <p>Loading legalities...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
