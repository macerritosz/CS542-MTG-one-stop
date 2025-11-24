import { useEffect, useMemo, useState } from "react";
import background from "../assets/search_background.jpg";

interface PlayerDecksBuilt {
  display_name: string;
  total_decks_built: number;
  public_decks: number;
  private_decks: number;
  most_recent_deck: string;
}

interface PopularBuilder {
  display_name: string;
  decks_built: number;
  total_saves_received: number;
  unique_savers: number;
  avg_saves_per_deck: number;
}

interface CardMostUsed {
  cardID: string;
  name: string;
  rarity: string;
  mana_value: number;
  price_usd: number | null;
  decks_using_card: number;
  total_quantity_in_decks: number;
  avg_quantity_per_deck: number;
  max_quantity_in_single_deck: number;
}

interface CardMostExpensive {
  cardID: string;
  name: string;
  rarity: string;
  mana_value: number;
  price_usd: number | null;
  price_foil_usd: number | null;
  set_name: string;
  image_uris: string;
}

interface DeckMostSaved {
  deckID: number;
  title: string;
  format: string;
  created_at: string;
  builder_name: string;
  total_saves: number;
  unique_savers: number;
  total_cards: number;
}

interface LeaderboardsResponse {
  playersDecksBuilt: PlayerDecksBuilt[];
  playersPopularBuilders: PopularBuilder[];
  cardsMostUsed: CardMostUsed[];
  cardsMostExpensive: CardMostExpensive[];
  decksMostSaved: DeckMostSaved[];
}

const statPill =
  "px-3 py-1 rounded-full bg-white/90 text-gray-800 text-sm font-semibold shadow";

function formatNumber(value: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (value === null || typeof value === "undefined" || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", opts).format(value);
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function Leaderboards() {
  const [data, setData] = useState<LeaderboardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5715/api/leaderboards");
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Failed to fetch leaderboards");
        setData(payload);
      } catch (err) {
        console.error(err);
        setError("Unable to load leaderboards right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboards();
  }, []);

  const heroStats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Cards Tracked",
        value: data.cardsMostUsed.length ? data.cardsMostUsed.length : "10",
        caption: "per leaderboard",
      },
      {
        label: "Deck Insights",
        value: data.decksMostSaved.length ? data.decksMostSaved.length : "10",
        caption: "top saved decks",
      },
      {
        label: "Builders Ranked",
        value: data.playersDecksBuilt.length ? data.playersDecksBuilt.length : "10",
        caption: "per leaderboard",
      },
    ];
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="w-full h-[50vh] bg-cover bg-center flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="backdrop-blur-sm bg-black/40 rounded-3xl px-10 py-8 text-white space-y-6 max-w-5xl">
          <p className="uppercase tracking-[0.4em] text-sm text-gray-200">Leaderboards</p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Spotlight on the Multiverse
          </h1>
          <p className="text-lg text-gray-100">
            Discover the most dedicated deck builders, the hottest cards in circulation, and the
            decks the community can’t stop saving – all in one place.
          </p>
          {heroStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-2xl py-4">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-200/80 mt-1">
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">{stat.caption}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {loading && (
          <div className="text-center text-gray-600 text-lg">Loading leaderboards...</div>
        )}
        {error && (
          <div className="text-center text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl py-6">
            {error}
          </div>
        )}
        {!loading && !error && data && (
          <>
            <LeaderboardPlayersDecksBuilt entries={data.playersDecksBuilt} />
            <LeaderboardPopularBuilders entries={data.playersPopularBuilders} />
            <LeaderboardCardsMostUsed entries={data.cardsMostUsed} />
            <LeaderboardCardsMostExpensive entries={data.cardsMostExpensive} />
            <LeaderboardDecksMostSaved entries={data.decksMostSaved} />
          </>
        )}
      </div>
    </div>
  );
}

function LeaderboardPlayersDecksBuilt({ entries }: { entries: PlayerDecksBuilt[] }) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-500">Builders</p>
        <h2 className="text-3xl font-bold text-gray-900">Most Prolific Deck Architects</h2>
        <p className="text-gray-600 max-w-3xl">
          Measured by total decks created and their balance between public and private brewing.
        </p>
      </header>
      <div className="space-y-4">
        {entries.slice(0, 10).map((player, index) => (
          <div
            key={`${player.display_name}-${index}`}
            className="bg-white shadow-md rounded-2xl px-6 py-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">#{index + 1}</p>
                <h3 className="text-2xl font-semibold text-gray-900">{player.display_name}</h3>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className={statPill}>Public: {player.public_decks}</span>
                <span className={statPill}>Private: {player.private_decks}</span>
                <span className={statPill}>Total: {player.total_decks_built}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Latest deck on {formatDate(player.most_recent_deck)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LeaderboardPopularBuilders({ entries }: { entries: PopularBuilder[] }) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-500">Community</p>
        <h2 className="text-3xl font-bold text-gray-900">Fan Favorite Creators</h2>
        <p className="text-gray-600 max-w-3xl">
          Ranked by community saves and average saves per deck – the makers everyone follows.
        </p>
      </header>
      <div className="grid gap-4">
        {entries.slice(0, 10).map((player, index) => (
          <div
            key={`${player.display_name}-${index}`}
            className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-2xl px-6 py-5 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-purple-500 font-semibold">#{index + 1}</p>
                <h3 className="text-2xl font-bold text-gray-900">{player.display_name}</h3>
                <p className="text-gray-600 text-sm">
                  {player.decks_built} decks crafted • {player.unique_savers} unique fans
                </p>
              </div>
              <div className="flex gap-3 text-sm font-semibold text-gray-800 flex-wrap">
                <span className={statPill}>Total Saves: {player.total_saves_received}</span>
                <span className={statPill}>
                  Avg Saves/Deck: {formatNumber(player.avg_saves_per_deck, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LeaderboardCardsMostUsed({ entries }: { entries: CardMostUsed[] }) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-orange-500">Meta</p>
        <h2 className="text-3xl font-bold text-gray-900">Most Used Cards</h2>
        <p className="text-gray-600 max-w-3xl">
          These staples appear across the most decks in the community, showing their staying power.
        </p>
      </header>
      <div className="grid gap-4">
        {entries.slice(0, 10).map((card, index) => (
          <a
            key={`${card.cardID}-${index}`}
            className="bg-white rounded-2xl px-6 py-5 shadow-md flex flex-col gap-3 active:scale-98 transition duration-200"
            href={`/cards/${card.cardID}`}
          >
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-orange-400 font-semibold">#{index + 1}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.name}</h3>
                <p className="text-gray-600 text-sm">
                  {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)} • Mana Value {card.mana_value}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap items-center">
                <span className={statPill}>
                  Decks: {formatNumber(card.decks_using_card)}
                </span>
                <span className={statPill}>
                  Avg Qty: {formatNumber(card.avg_quantity_per_deck, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Total copies slotted into decks: {formatNumber(card.total_quantity_in_decks)} (max {card.max_quantity_in_single_deck} in a single deck)
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function LeaderboardCardsMostExpensive({ entries }: { entries: CardMostExpensive[] }) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-500">Market</p>
        <h2 className="text-3xl font-bold text-gray-900">Most Valuable Singles</h2>
        <p className="text-gray-600 max-w-3xl">
          Track the priciest spell slingers across sets to see where the secondary market is heading.
        </p>
      </header>
      <div className="grid gap-4">
        {entries.slice(0, 10).map((card, index) => (
          <a
            key={`${card.cardID}-${index}`}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row active:scale-98 transition duration-200"
            href={`/cards/${card.cardID}`}
          >
            {card.image_uris && (
              <div className="md:w-40 md:flex-shrink-0 bg-gray-100">
                <img src={card.image_uris} alt={card.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 px-6 py-5 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm text-emerald-500 font-semibold">#{index + 1}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{card.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {card.set_name} • Mana Value {card.mana_value} • {card.rarity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">
                    {card.price_usd ? `$${formatNumber(card.price_usd, { minimumFractionDigits: 2 })}` : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Foil:{" "}
                    {card.price_foil_usd
                      ? `$${formatNumber(card.price_foil_usd, { minimumFractionDigits: 2 })}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function LeaderboardDecksMostSaved({ entries }: { entries: DeckMostSaved[] }) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Community Signal</p>
        <h2 className="text-3xl font-bold text-gray-900">Most Saved Decks</h2>
        <p className="text-gray-600 max-w-3xl">
          These lists inspire the most copycats. Track which builders, formats, and strategies are trending.
        </p>
      </header>
      <div className="grid gap-4">
        {entries.slice(0, 10).map((deck, index) => (
          <a
            key={`${deck.deckID}-${index}`}
            className="bg-white rounded-2xl px-6 py-5 shadow-md hover:shadow-lg transition-shadow duration-200"
            href={`/decks/${deck.deckID}`}
          >
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-rose-500 font-semibold">#{index + 1}</p>
                <h3 className="text-2xl font-bold text-gray-900">{deck.title}</h3>
                <p className="text-gray-600 text-sm">
                  {deck.builder_name} • {deck.format} • {deck.total_cards} cards
                </p>
                <p className="text-sm text-gray-500">Created on {formatDate(deck.created_at)}</p>
              </div>
              <div className="flex gap-3 items-start flex-wrap">
                <span className={statPill}>Saves: {deck.total_saves}</span>
                <span className={statPill}>Unique Savers: {deck.unique_savers}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
