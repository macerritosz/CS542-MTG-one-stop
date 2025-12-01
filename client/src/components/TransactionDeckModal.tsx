import {useAuth} from "@/contexts/AuthContext.tsx";
import {useEffect, useState} from "react";
import {X} from "lucide-react";
import type {TransactionData} from "@/components/DeckDetail.tsx";


interface TransactionDeckModalProps {
    isOpen: boolean,
    onClose: () => void,
    onApply: (deckData: any) => void,
    transactionData?: TransactionData | null
}


// This modal will buy the hovered card if the displayname not same as the seller
// will show wuanitty from the deck upper and lower bound
// will show the price
export default function TransactionDeckModal({isOpen, onClose, onApply, transactionData}: TransactionDeckModalProps) {

    const {display_name} = useAuth();
    const upperBound = Number(transactionData?.cardInfo.quantity ?? 0)
    const [userQuanity, setUserQuanity] = useState<number>(0);
    const foilAvailable = !!transactionData?.cardInfo.price_foil_usd;
    const [decksBuilt, setDecksBuilt] = useState<any[]>([]);
    const [decksSaved, setDecksSaved] = useState<any[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string>("");
    const [deckError, setDeckError] = useState<string>("");
    const [formData, setFormData] = useState({
        cardID: '',
        quantity: '',
        is_foil: false,
        sellerName: '',
        buyer_name: display_name
    })

    useEffect(() => {
        async function fetchDecks() {
            try {
                const res = await fetch(`http://localhost:5715/api/decks/me?name=${encodeURIComponent(display_name!)}`);
                const data = await res.json();
                console.log(data);
                setDecksBuilt(data.decksBuilt);
                setDecksSaved(data.decksSaved);
                console.log(data)
            } catch (error) {
                console.error("Failed to fetch decks:", error);
            }
        };
        fetchDecks();
    }, []);


    if (!transactionData || ! isOpen) return null;


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        onApply({
            cardID: '',
            quantityBought: '',
            is_foil: false,
            card_price: '',
            total_price: '',
            sellerName: '',
            buyer_name: display_name
        });
        setFormData({
            cardID: '',
            quantity: '',
            is_foil: false,
            sellerName: '',
            buyer_name: display_name
        });
    }

    //For increment Buttons
    const increment = () =>
        setUserQuanity(prev => Math.min(prev + 1, upperBound));

    const decrement = () =>
        setUserQuanity(prev => Math.max(prev - 1, 0));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
             onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full m-4" onClick={(e) => e.stopPropagation()}>
                <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">Buy Card from {transactionData.sellerAuth}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex items-center justify-evenly">
                        <div>
                            <a href={`../cards/${transactionData.cardInfo.cardID}`}>
                                <img
                                    src={transactionData.cardInfo.image_uris}
                                    alt={transactionData.cardInfo.name}
                                    className={`w-[280px] h-auto object-cover rounded-2xl shadow-lg`}
                                />
                            </a>
                            <div className="mt-3 text-center">
                                {transactionData.cardInfo.price_usd && (
                                    <p className="text-gray-700 text-lg font-semibold">
                                        ${transactionData.cardInfo.price_usd} USD
                                    </p>
                                )}

                                {transactionData.cardInfo.price_foil_usd && (
                                    <p className="text-gray-500 text-md">
                                        Foil: ${transactionData.cardInfo.price_foil_usd}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-3 items-start ">
                            <div className="col-start-1 col-end-1">
                                <h2 className="block font-medium text-gray-700">
                                    {transactionData.sellerAuth} has {transactionData.cardInfo.quantity} cards
                                </h2>
                            </div>
                            <div className="col-start-1 col-end-1">
                                <label htmlFor="quanity" className="block text-sm font-medium text-gray-700 mb-2">
                                    Request Amount
                                </label>
                                <input
                                    type="number"
                                    value={userQuanity}
                                    onChange={e => {
                                        const val = Number(e.target.value);
                                        setUserQuanity(Math.min(Math.max(val, 0), upperBound));
                                    }}
                                    className="w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900
                                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="foilBool"
                                    className={`
                                        flex items-center gap-2 px-4 py-2  cursor-pointer transition-all
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        id="foilBool"
                                        disabled={!foilAvailable}
                                        checked={formData.is_foil}
                                        onChange={() =>
                                            setFormData(prev => ({ ...prev, is_foil: !prev.is_foil }))
                                        }
                                        className="w-4 h-4 accent-purple-500 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    Foil
                                </label>
                            </div>

                            <div className="p-4 border bg-gray-50 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Receipt</h3>

                                <div className="space-y-2 text-gray-700">
                                    <p>
                                        <span className="font-medium">Card price:</span>{" "}
                                        ${formData.is_foil
                                        ? Number(transactionData.cardInfo.price_foil_usd).toFixed(2)
                                        : Number(transactionData.cardInfo.price_usd).toFixed(2)
                                    }
                                    </p>

                                    <p>
                                        <span className="font-medium">Quantity:</span> {userQuanity}
                                    </p>

                                    <hr className="my-2"/>

                                    <p className="text-xl font-bold text-gray-900">
                                        Total: $
                                        {(
                                            (formData.is_foil
                                                    ? Number(transactionData.cardInfo.price_foil_usd)
                                                    : Number(transactionData.cardInfo.price_usd)
                                            ) * userQuanity
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>


                            <button
                                type="submit"
                                className=" col-start-1 col-end-1 mt-[1.85rem] bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-lg
                            hover:bg-purple-600 active:bg-purple-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                                Buy
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}