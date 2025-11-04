import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CreateDeck(){
    const { display_name } = useAuth();
    const [formData, setFormData] = useState({title: '', format: '', is_private: 'false', name: display_name})

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5715/api/decks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                console.log(data)
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    };
    
    return (
        <div>
            <h1 className="text-5xl text-gray-700">
                {display_name}
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center">
                <input
                    className="text-xl mt-[4%] bg-gray-300 opacity-70 rounded-sm px-[4%] py-[2.5%] w-[55%] shadow-md text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                />
                <input
                    className="text-xl mt-[4%] bg-gray-300 opacity-70 rounded-sm px-[4%] py-[2.5%] w-[55%] shadow-md text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    type="text"
                    id="format"
                    name="format"
                    placeholder="Format"
                    value={formData.format}
                    onChange={handleChange}
                />
                <input
                    className="text-xl mt-[4%] bg-gray-300 opacity-70 rounded-sm px-[4%] py-[2.5%] w-[55%] shadow-md text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    type="text"
                    id="is_private"
                    name="is_private"
                    placeholder="Is Private?"
                    value={formData.is_private}
                    onChange={handleChange}
                />
                <button
                    type="submit"
                    className=" mb-[3%] bg-blue-400 text-white font-semibold px-[4%] py-[2%] w-[55%] rounded-lg hover:bg-blue-500 active:bg-blue-600 transition-all"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}