import { useEffect, useRef } from 'react';
import picture from '../assets/wiki_image.png'
import background from '../assets/wiki_background1.jpg'
import overlay from '../assets/wiki_overlay.png'

export default function Wiki() {
    const colorsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (colorsRef.current) {
            const rect = colorsRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const startTrigger = windowHeight * 0.6;
            const endTrigger = -rect.height * 0.4;
            
            const scrollProgress = Math.max(0, Math.min(1, 
                (startTrigger - rect.top) / (startTrigger - endTrigger)
            ));
            
            const maxScroll = colorsRef.current.scrollWidth - colorsRef.current.clientWidth;
            colorsRef.current.scrollLeft = scrollProgress * maxScroll * 1.6;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
    <>
        <div
            className="relative flex items-center justify-center h-screen bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>

            <div className="relative z-10 w-1/2 pl-35 text-white mb-10 flex flex-col justify-center items-center">
                <h1 className="text-8xl font-bold mb-6 text-center">Magic: The Gathering</h1>
                <p className="text-2xl leading-relaxed max-w-lg text-center">
                    MTG is a strategic card game where players become
                    planeswalkers — powerful beings who cast spells, summon creatures, and
                    battle opponents. Usually played with two players, each brings their
                    own deck built from over 27,000 unique cards.
                </p>
            </div>
            <div
                className="relative z-10 w-1/2 h-full bg-right mr-20 rounded-l-3xl overflow-hidden"
                style={{
                    backgroundImage: `url(${overlay})`,
                    backgroundSize: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right center'
                }}
                ></div>
        </div>
        <div className="relative flex items-center justify-between h-screen px-20 bg-gray-50">
            <img
                src={picture}
                alt="Magic card anatomy"
                className="w-5/9 h-auto rounded-2xl sticky top-20"
            />
            
            <div className="w-1/2 space-y-8 overflow-y-auto max-h-screen py-20 pl-12">
                <h2 className="text-5xl font-bold text-gray-800 mb-10">Card Anatomy</h2>
                
                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Name</h3>
                    <p className="text-gray-600">
                        Positioned in the title bar at the top left corner—the primary method of identification.
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Mana Cost</h3>
                    <p className="text-gray-600">
                        Top right corner shows how much and what type of mana is needed. The colored symbols determine the card's color.
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Illustration</h3>
                    <p className="text-gray-600">
                        Visual representation in the center with no gameplay function.
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Type Line</h3>
                    <p className="text-gray-600">
                        Specifies when and how a card can be played. Includes supertypes (game rules) and subtypes (categorization).
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Expansion Symbol</h3>
                    <p className="text-gray-600">
                        Shows which set the card belongs to. Color-coded by rarity: black (common), silver (uncommon), gold (rare), orange (mythic).
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Text Box</h3>
                    <p className="text-gray-600">
                        Contains rules text and flavor text (italicized at bottom, no gameplay effect).
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Power/Toughness</h3>
                    <p className="text-gray-600">
                        For creatures: damage dealt / damage needed to destroy. Planeswalkers show loyalty counters. Battles show defense counters.
                    </p>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Card Information</h3>
                    <p className="text-gray-600">
                        Bottom section includes artist credit, collector number, rarity, set code, language, and copyright.
                    </p>
                </div>
            </div>
        </div>
        <div className="relative h-screen bg-gray-50 flex items-center justify-center pt-50">
            <div className="max-w-5xl mx-auto px-20">
                <h2 className="text-6xl font-bold text-gray-800 mb-12 text-center">How to Play</h2>
                
                <div className="space-y-10">
                    <div>
                        <h3 className="text-3xl font-semibold text-gray-700 mb-3">1. Starting the Game</h3>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Each player shuffles their deck and draws 7 cards. Decide who goes first (usually by dice roll). 
                            The player going first skips their first draw step.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-3xl font-semibold text-gray-700 mb-3">2. Turn Structure</h3>
                        <ul className="text-xl text-gray-600 space-y-2 list-disc list-inside">
                            <li><span className="font-semibold">Untap:</span> Untap all your tapped cards</li>
                            <li><span className="font-semibold">Upkeep:</span> Triggered abilities happen here</li>
                            <li><span className="font-semibold">Draw:</span> Draw one card from your library</li>
                            <li><span className="font-semibold">Main Phase 1:</span> Play lands, cast spells, activate abilities</li>
                            <li><span className="font-semibold">Combat:</span> Declare attackers, opponent declares blockers, damage dealt</li>
                            <li><span className="font-semibold">Main Phase 2:</span> Play more cards after combat</li>
                            <li><span className="font-semibold">End:</span> Discard down to 7 cards if needed</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-3xl font-semibold text-gray-700 mb-3">3. Mana & Casting Spells</h3>
                        <p className="text-xl text-gray-600 leading-relaxed mb-2">
                            Lands produce mana, which you use to cast spells. You can play ONE land per turn. Tap lands to generate mana.
                        </p>
                        <p className="text-lg text-gray-500 italic">
                            Example: A spell costs "2R" = 2 mana of any color + 1 red mana. You tap a Mountain (for red) and two other lands.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-3xl font-semibold text-gray-700 mb-3">4. Combat</h3>
                        <p className="text-xl text-gray-600 leading-relaxed mb-2">
                            On your turn, you can attack with creatures. Your opponent chooses which creatures block. 
                            Creatures deal damage equal to their power.
                        </p>
                        <p className="text-lg text-gray-500 italic">
                            Example: Your 3/3 creature attacks. Opponent blocks with a 2/2. Both creatures take lethal damage and die!
                        </p>
                    </div>

                    <div>
                        <h3 className="text-3xl font-semibold text-gray-700 mb-3">5. Winning the Game</h3>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Reduce your opponent to 0 life, make them draw from an empty library, or win through special 
                            card effects like "You win the game."
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className="relative min-h-screen bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-20">
                <h2 className="text-6xl font-bold text-gray-800 mb-8 text-center">Mana</h2>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-6 text-center max-w-4xl mx-auto">
                    Mana is a renewable resource in Magic: The Gathering. Mana is generated by some cards, most notably land, 
                    and then used to play most of the game's cards and abilities.
                </p>
                
                <p className="text-lg text-gray-600 leading-relaxed mb-8 text-center max-w-4xl mx-auto">
                    A player taps land to add mana to their mana pool; one's mana supply regenerates naturally when lands 
                    untap during the beginning phase of their turn. A player that exhausts their supply of mana is considered "tapped out."
                </p>

                <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                    <h3 className="text-3xl font-semibold text-gray-700 mb-4">Mana Abilities</h3>
                    <p className="text-lg text-gray-600 mb-4">A mana ability is either:</p>
                    <ol className="text-lg text-gray-600 space-y-2 list-decimal list-inside mb-4">
                        <li>An activated ability, with no target, that could put mana into a player's mana pool when it resolves</li>
                        <li>A triggered ability, with no target, that triggers from a mana ability and could produce additional mana</li>
                    </ol>
                    <p className="text-lg text-gray-600">
                        A mana ability does not use the stack, and thus cannot be countered or responded to. They can be activated 
                        during the casting of a spell or activation of other abilities.
                    </p>
                </div>

                <h2 className="text-5xl font-bold text-gray-800 mb-10 text-center">The Five Colors</h2>

                <div 
                    className="flex gap-6 mb-12 overflow-x-auto"
                    ref={colorsRef}
                >
                    <div className="flex-1 min-w-[250px] bg-white rounded-xl shadow-lg p-6 border-t-8 border-yellow-100">
                        <div className="flex flex-col items-center mb-4">
                            <img 
                                src="https://svgs.scryfall.io/card-symbols/W.svg" 
                                alt="White mana" 
                                className="w-16 h-16 mb-2"
                            />
                            <h3 className="text-2xl font-bold text-gray-800">White</h3>
                            <p className="text-gray-500 text-sm">Plains</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">Philosophy:</span> Peace, law, structure, selflessness, equality
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Strengths:</span> Small creatures, life gain, removal, protection
                        </p>
                    </div>
                    <div className="flex-1 min-w-[250px] bg-white rounded-xl shadow-lg p-6 border-t-8 border-blue-400">
                        <div className="flex flex-col items-center mb-4">
                            <img 
                                src="https://svgs.scryfall.io/card-symbols/U.svg" 
                                alt="Blue mana" 
                                className="w-16 h-16 mb-2"
                            />
                            <h3 className="text-2xl font-bold text-gray-800">Blue</h3>
                            <p className="text-gray-500 text-sm">Island</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">Philosophy:</span> Knowledge, deceit, caution, deliberation, perfection
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Strengths:</span> Card draw, counterspells, flying creatures, bounce
                        </p>
                    </div>
                    <div className="flex-1 min-w-[250px] bg-white rounded-xl shadow-lg p-6 border-t-8 border-gray-800">
                        <div className="flex flex-col items-center mb-4">
                            <img 
                                src="https://svgs.scryfall.io/card-symbols/B.svg" 
                                alt="Black mana" 
                                className="w-16 h-16 mb-2"
                            />
                            <h3 className="text-2xl font-bold text-gray-800">Black</h3>
                            <p className="text-gray-500 text-sm">Swamp</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">Philosophy:</span> Power, self-interest, death, sacrifice, uninhibitedness
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Strengths:</span> Creature removal, hand disruption, reanimation
                        </p>
                    </div>
                    <div className="flex-1 min-w-[250px] bg-white rounded-xl shadow-lg p-6 border-t-8 border-red-500">
                        <div className="flex flex-col items-center mb-4">
                            <img 
                                src="https://svgs.scryfall.io/card-symbols/R.svg" 
                                alt="Red mana" 
                                className="w-16 h-16 mb-2"
                            />
                            <h3 className="text-2xl font-bold text-gray-800">Red</h3>
                            <p className="text-gray-500 text-sm">Mountain</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">Philosophy:</span> Freedom, emotion, action, impulse, destruction
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Strengths:</span> Direct damage, fast creatures, artifact destruction
                        </p>
                    </div>
                    <div className="flex-1 min-w-[250px] bg-white rounded-xl shadow-lg p-6 border-t-8 border-green-600">
                        <div className="flex flex-col items-center mb-4">
                            <img 
                                src="https://svgs.scryfall.io/card-symbols/G.svg" 
                                alt="Green mana" 
                                className="w-16 h-16 mb-2"
                            />
                            <h3 className="text-2xl font-bold text-gray-800">Green</h3>
                            <p className="text-gray-500 text-sm">Forest</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">Philosophy:</span> Nature, wildlife, connection, spirituality, tradition
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Strengths:</span> Big creatures, mana acceleration, enchantments
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50">
                    <h2 className="text-4xl font-bold text-gray-800 mb-6">Deck Building</h2>
                    <p className="text-xl text-gray-700 leading-relaxed mb-4">
                        A deck is the collection of cards that a player plays with; it becomes that player's library.
                    </p>
                    <ul className="text-lg text-gray-600 space-y-3 list-disc list-inside">
                        <li>A regular deck needs a <span className="font-semibold">minimum of 60 cards</span></li>
                        <li>While the maximum is technically infinite, a player must be able to shuffle satisfactorily within the normal time frame</li>
                        <li>There is a <span className="font-semibold">maximum of 4 cards with the same name</span> in each deck</li>
                        <li>The only exceptions are <span className="font-semibold">basic lands</span> or if a card's text contradicts this rule</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="relative min-h-screen bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-20">
                <h2 className="text-6xl font-bold text-gray-800 mb-8 text-center">Card Types</h2>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-12 text-center max-w-4xl mx-auto">
                    Card type is a characteristic found on every Magic: The Gathering card. It appears in the type line, 
                    between any supertypes and subtypes that card might have.
                </p>

                <p className="text-lg text-gray-600 leading-relaxed mb-12 text-center max-w-4xl mx-auto">
                    Standard Magic cards typically have one or more of either the <span className="font-semibold">permanent types</span> 
                    (Land, Creature, Artifact, Enchantment, Planeswalker, and Battle), or one of the <span className="font-semibold">non-permanent spell types</span> 
                    (Instant and Sorcery).
                </p>

                <div className="space-y-6">
                    {/* Artifacts */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">Artifacts</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Artifacts are permanents that represent magical items, animated constructs, pieces of equipment, 
                            or other objects and devices.
                        </p>
                    </div>

                    {/* Lands */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">Lands</h3>
                        <p className="text-lg text-gray-600 leading-relaxed mb-2">
                            Lands represent locations under the player's control, most of which have mana abilities. 
                            Because mana is needed to use almost any card or ability, most decks need a high number of mana-producing lands.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Lands are played on the player's turn, and <span className="font-semibold">only one can be played per turn</span>. 
                            When a player wants to play a land and has the opportunity, they simply put it into play.
                        </p>
                    </div>

                    {/* Creatures */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">Creatures</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Creatures are permanent cards that serve the player, usually by fighting on their behalf. 
                            Because almost all creatures can attack each turn to reduce an opponent's life or block the opponent's attackers, 
                            creature cards are fundamental to most deck strategies.
                        </p>
                    </div>

                    {/* Enchantments */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">Enchantments</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Enchantments are card types that represent persistent magical effects, usually remaining in play indefinitely.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Sorceries */}
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                            <h3 className="text-3xl font-bold text-gray-800 mb-3">Sorceries</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Sorceries, like instants, represent one-shot or short-term magical spells. 
                                They are never put onto the battlefield; instead, they take effect when their mana cost is paid 
                                and the spell resolves, then are immediately put into the owner's graveyard.
                            </p>
                        </div>

                        {/* Instants */}
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                            <h3 className="text-3xl font-bold text-gray-800 mb-3">Instants</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Instants, like sorceries, represent one-shot or short-term magical spells. 
                                They are never put onto the battlefield; instead, they take effect when their mana cost is paid 
                                and the spell resolves, then are immediately put into the player's graveyard.
                            </p>
                        </div>
                    </div>

                    {/* Planeswalkers */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">Planeswalkers</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Planeswalkers have an intrinsic ability to enter the battlefield with a set number of loyalty counters. 
                            A planeswalker can be attacked, like a player, or be damaged by an opponent's spell or ability. 
                            Any damage dealt to planeswalkers removes that many loyalty counters and a planeswalker with no loyalty counters 
                            is put into the graveyard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}
