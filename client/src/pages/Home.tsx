import { useState, useEffect, useRef } from "react";
import background from '../assets/home_background.jpg';
import play from '../assets/play-button.png';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { BookOpen, Swords, Library, Calendar } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

type FormType = 'cards' | 'decks'

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [showVideo, setShowVideo] = useState(false);
    const [formData, setFormData] = useState( {type: 'cards', query: ''});
    const navigate = useNavigate();
    const selected = formData.type;
    
    const aboutRef = useRef(null);
    const missionRef = useRef(null);
    const pillarRef = useRef(null);
    const closingRef = useRef(null);

    const location = useLocation();

    // not scrolling into view when already on home page
    // want scroll even if already on /#about page as well
    useEffect(() => {
        console.log(location);
        if (location.hash) {
            const element = document.getElementById(location.hash.replace('#',''));
            
            if (element) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: element, offsetY: 200 },
                    ease: 'power2.inOut'
                });
            } else {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: 0 },
                    ease: 'power2.inOut'
                });
            }
        }
    }, [location]);


    useEffect(() => {
        const sections = [
            { ref: aboutRef },
            { ref: missionRef },
            { ref: pillarRef },
            { ref: closingRef },
        ];
        sections.forEach(({ ref }) => {
            if(!ref.current) return;
            gsap.fromTo(ref.current, 
                { autoAlpha: 0, y: 50 },
                {
                    duration: 1,
                    autoAlpha: 1,
                    y: 0,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'top 100%',
                        toggleActions: 'play none none reverse',
                    }
                }
            );
        });
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        }
    }, []);

    const pillars = [
        {
            icon: <BookOpen className="w-12 h-12" />,
            title: "Learn the Basics",
            description: "Master the fundamentals with easy-to-follow guides"
        },
        {
            icon: <Swords className="w-12 h-12" />,
            title: "Build Your First Deck",
            description: "Create winning strategies with our deck builder tools"
        },
        {
            icon: <Library className="w-12 h-12" />,
            title: "Explore Cards",
            description: "Browse thousands of cards with advanced search"
        },
        {
            icon: <Calendar className="w-12 h-12" />,
            title: "Find Events",
            description: "Discover local tournaments and community gatherings"
        }
    ];

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
        const { value } = e.target;
        setFormData(prev => ( {...prev, ['query']: value }));
    }

    function handleToggle(value : FormType) {
        setFormData((prev) => ({ ...prev, type: value }));
      };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!formData.query.trim()) return;
        navigate(`/${formData.type}?query=${encodeURIComponent(formData.query)}&page=1`);
    }

    return (
        <div className="h-screen bg-white">
            <div className="w-full h-[50vh] bg-cover bg-top flex flex-col items-center justify-center" style={{ backgroundImage: `url(${background})` }}> 
                <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-300 via-blue-600 to-white bg-clip-text text-transparent leading-tight pb-2">Gathering Magic</h1>
                <form onSubmit={handleSubmit} className="flex items-center gap-4 w-full max-w-4xl mx-auto">
                    <div className="relative flex bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full p-1 w-[200px] shadow-lg">
                        <div className={`absolute top-1 left-1 w-1/2 h-[calc(100%-0.5rem)] rounded-full bg-gray-900 transition-transform duration-300 ease-in-out ${
                            selected === "decks" ? "translate-x-[94%]" : "translate-x-0"}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleToggle("cards")}
                            className={`relative z-10 flex-1 px-4 py-2 rounded-full transition-colors ${
                                selected === "cards" ? "text-white" : "text-gray-300"}`}
                        >
                            Cards
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggle("decks")}
                            className={`relative z-10 flex-1 px-4 py-2 rounded-full transition-colors ${
                                selected === "decks" ? "text-white" : "text-gray-300"}`}
                        >
                            Decks
                        </button>
                    </div>
                    <input
                        className="flex-1 border border-gray-400 rounded-lg px-4 py-2 text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        type="text"
                        id="query"
                        name="query"
                        placeholder={`Search for ${selected}`}
                        value={formData.query}
                        onChange={handleChange}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                    >
                        Search
                    </button>
                </form>
            </div>
            <section 
                ref={aboutRef}
                className={"pt-40 pb-30"}
                id="about"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 gap-12 items-center">
                        <div className="relative w-full h-[40vh]">
                            {!showVideo ? (
                                <div 
                                    className="w-full h-full bg-cover bg-center flex flex-col items-center justify-center relative cursor-pointer group"
                                    style={{ backgroundImage: `url(https://images.ctfassets.net/s5n2t79q9icq/2fyz19E5hb1uspFYIl3oEd/7ab884d5c387da224fed7946200babad/eyvvXZbjR_A-HD.jpg?fm=webp)` }}
                                    onClick={() => setShowVideo(true)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img src={play} alt="Play" className="group-hover:scale-110 transition-transform" />
                                    </div>
                                </div>
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/eyvvXZbjR_A?autoplay=1"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div> 
                        <div>
                            <h2 className="text-5xl font-bold text-gray-900 mb-6">
                                What is <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Magic: The Gathering</span>?
                            </h2>
                            
                            <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                Magic: The Gathering is a collectible card game where players summon creatures, cast spells, and battle for victory using strategy and creativity. With over 30 years of history and millions of players worldwide, it's one of the most strategic and engaging games ever created.
                            </p>
                            <a href='/wiki' className="text-purple-600 hover:text-purple-700 font-semibold text-lg flex items-center gap-2 group">
                                Learn More 
                                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section 
                ref={missionRef}
                id='mission'
                className={"pt-20 pb-30"}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        We built this site to make Magic approachable for beginners — to learn the rules, build decks with confidence, and connect with events near you. Whether you're just starting your planeswalker journey or you're a seasoned veteran, we're here to enhance your Magic experience.
                    </p>
                </div>
            </section>

            <section 
                ref={pillarRef}
                id='pillar'
                className={"pt-20 pb-30"}
            >
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl font-bold text-gray-900 text-center mb-16">Everything You Need</h2>
                    <div className="grid grid-cols-4 gap-8">
                        {pillars.map((pillar, index) => (
                            <div 
                                key={index}
                                className="flex flex-col items-center bg-white rounded-xl px-6 py-8 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl group"
                            >
                                <div className="text-purple-600 mb-4 group-hover:text-blue-600 transition-colors">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
                                <p className="text-gray-600 text-center">{pillar.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {!isAuthenticated && (
                <section 
                    ref={closingRef}
                    id='closing'
                    className={"pt-20 pb-30"}
                >
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 shadow-2xl">
                            <h2 className="text-5xl font-bold text-white mb-6">Ready to Begin?</h2>
                            <p className="text-xl text-purple-50 mb-2">
                                Start exploring cards now — no signup required! 
                            </p>
                            <p className="text-xl text-purple-50 mb-8">
                                Create an account to save your decks and track your progress.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <a href='/signup' className="px-8 py-4 text-lg font-semibold text-purple-600 bg-white rounded-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl">
                                    Create Account
                                </a>
                                <a href='/search' className="px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white/10 rounded-lg transform hover:scale-105 transition-all duration-200">
                                    Browse Cards
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )};
        </div>
    ); 
}
