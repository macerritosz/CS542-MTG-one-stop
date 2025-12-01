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
    const [userQuantity, setUserQuantity] = useState<number>(0);
    const foilAvailable = !!transactionData?.cardInfo.price_foil_usd;
    const [decksBuilt, setDecksBuilt] = useState<any[]>([]);
    const [decksSaved, setDecksSaved] = useState<any[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string>("");
    const [deckError, setDeckError] = useState<string>("");
    const [cardPrice, setCardPrice] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [errors, setErrors] = useState({quantity: '', price: ''});
    const [formData, setFormData] = useState({
        quantity: 0,
        is_foil: false,
        sellerName: transactionData?.sellerAuth,
        buyer_name: display_name
    })

    useEffect(() => {
        async function fetchDecks() {
            try {
                const res = await fetch(`http://localhost:5715/api/decks/me?name=${encodeURIComponent(display_name!)}`);
                const data = await res.json();
                setDecksBuilt(data.decksBuilt);
                setDecksSaved(data.decksSaved);
                console.log(data)
            } catch (error) {
                console.error("Failed to fetch decks:", error);
            }
        };
        fetchDecks();
    }, []);

    useEffect(() => {
        const price = formData.is_foil
            ? Number(transactionData?.cardInfo.price_foil_usd)
            : Number(transactionData?.cardInfo.price_usd);

        setCardPrice(price);
    }, [formData.is_foil, transactionData]);

    useEffect(() => {
        const total = formData.is_foil
            ? Number(transactionData?.cardInfo.price_foil_usd)
            : Number(transactionData?.cardInfo.price_usd) * userQuantity

        setTotalPrice(total);
    }, [formData.is_foil, transactionData, userQuantity]);

    useEffect(() => {
        setFormData(prev => ({...prev, quantity: userQuantity}));
    }, [userQuantity]);

    if (!transactionData || ! isOpen) return null;


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const price = formData.is_foil
            ? Number(transactionData?.cardInfo.price_foil_usd)
            : Number(transactionData?.cardInfo.price_usd);

        const quantity = Number(formData.quantity);

        const formErrors = {quantity: '', price: ''};
        if (quantity <= 0) errors.quantity = "Quantity must be at least 1"
        if (price <= 0) errors.price = "Card price is invalid"

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return
        }

        onApply({
            ...formData,
            card_price: cardPrice,
            total_price: totalPrice,
            selectedDeckID: selectedDeck
        });
        setFormData({
            quantity: 0,
            is_foil: false,
            sellerName: '',
            buyer_name: display_name
        });
    }

    //For increment Buttons
    const increment = () =>
        setUserQuantity(prev => Math.min(prev + 1, upperBound));

    const decrement = () =>
        setUserQuantity(prev => Math.max(prev - 1, 0));

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
                                    value={userQuantity}
                                    onChange={e => {
                                        const val = Number(e.target.value);
                                        setUserQuantity(Math.min(Math.max(val, 0), upperBound));
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
                                        ${cardPrice.toFixed(2)}
                                    </p>

                                    <p>
                                        <span className="font-medium">Quantity:</span> {userQuantity}
                                    </p>

                                    <hr className="my-2"/>

                                    <p className="text-xl font-bold text-gray-900">
                                        Total: $
                                        {totalPrice.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="col-start-1 col-end-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add to Deck <span className="text-red-500">*</span>
                                </label>

                                <select
                                    value={selectedDeck}
                                    onChange={e => {
                                        setSelectedDeck(e.target.value);
                                        setDeckError("");
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                                    text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500
                                    focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select a deck…</option>

                                    {decksBuilt.length > 0 && (
                                        <optgroup label="My Built Decks">
                                            {decksBuilt.map((deck, i) => (
                                                <option key={`built-${i}`} value={deck.title}>
                                                    {deck.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {decksSaved.length > 0 && (
                                        <optgroup label="My Saved Decks">
                                            {decksSaved.map((deck, i) => (
                                                <option key={`saved-${i}`} value={deck.title}>
                                                    {deck.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>

                                {deckError && (
                                    <p className="text-red-500 text-sm mt-1">{deckError}</p>
                                )}
                            </div>


                            <button
                                type="submit"
                                disabled={userQuantity <= 0 || (formData.is_foil ? !transactionData.cardInfo.price_foil_usd : !transactionData.cardInfo.price_usd)}
                                className={`bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-lg
                                    ${userQuantity <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-600"}
                                `}
                            >
                                Buy
                            </button>
                            {errors.quantity && (
                                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                            )}
                            {errors.price && (
                                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}