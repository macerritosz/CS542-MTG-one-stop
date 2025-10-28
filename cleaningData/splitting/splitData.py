import pandas as pd
import json

with open("filtered-cards-final.json", "r", encoding="utf-8") as f:
    cards = json.load(f)

cards_df = pd.DataFrame(cards)

color_map = {
    "W": 1, "U": 2, "B": 3, "R": 4, "G": 5, "C": 6
}

colors_to_card = []
for card in cards:
    if isinstance(card.get("colors"), list):
        for c in card["colors"]:
            if c in color_map:
                colors_to_card.append({
                    "cardID": card["cid"],
                    "colorID": color_map[c]
                })
colors_to_card_df = pd.DataFrame(colors_to_card)

color_identity = []
for card in cards:
    if isinstance(card.get("color_identity"), list):
        for c in card["color_identity"]:
            if c in color_map:
                color_identity.append({
                    "cardID": card["cid"],
                    "colorID": color_map[c]
                })
color_identity_df = pd.DataFrame(color_identity)

produced_mana = []
for card in cards:
    if isinstance(card.get("produced_mana"), list):
        for c in card["produced_mana"]:
            if c in color_map:
                produced_mana.append({
                    "cardID": card["cid"],
                    "colorID": color_map[c]
                })
produced_mana_df = pd.DataFrame(produced_mana)

all_keywords = {}
kw_to_card = []
kw_id = 1

for card in cards:
    if isinstance(card.get("keywords"), list):
        for kw in card["keywords"]:
            if kw not in all_keywords:
                all_keywords[kw] = kw_id
                kw_id += 1
            kw_to_card.append({
                "cardID": card["cid"],
                "keywordID": all_keywords[kw]
            })

keywords_df = pd.DataFrame(
    [{"keywordID": k_id, "keyword": kw} for kw, k_id in all_keywords.items()]
)
keywords_to_card_df = pd.DataFrame(kw_to_card)

legalities = []
for card in cards:
    leg = card.get("legalities", {})
    if isinstance(leg, dict):
        entry = {"cardID": card["cid"]}
        for key in [
            "standard", "future", "historic", "timeless", "gladiator",
            "pioneer", "modern", "legacy", "pauper", "vintage", "penny",
            "commander", "oathbreaker", "standardbrawl", "brawl",
            "alchemy", "paupercommander", "duel", "oldschool",
            "premodern", "predh"
        ]:
            entry[key] = (leg.get(key) == "legal")
        legalities.append(entry)
legalities_df = pd.DataFrame(legalities)


remove_columns = ["colors", "color_identity", "keywords", "produced_mana", "legalities","border_color", "frame_effects", "full_art"]

card_columns = [col for col in cards_df.columns if col not in remove_columns]
card_df = cards_df[card_columns].copy()

card_df.rename(columns={
    "cid": "cardID"
}, inplace=True)

card_df["released_at"] = "2024-11-15"
card_df.to_json("table_Card.json", orient="records", indent=2)
colors_to_card_df.to_json("table_Colors_To_Card.json", orient="records", indent=2)
color_identity_df.to_json("table_Color_Identity.json", orient="records", indent=2)
produced_mana_df.to_json("table_Produced_Mana.json", orient="records", indent=2)
keywords_df.to_json("table_Keywords.json", orient="records", indent=2)
keywords_to_card_df.to_json("table_Keywords_To_Card.json", orient="records", indent=2)
legalities_df.to_json("table_Legalities.json", orient="records", indent=2)

print("Normalization complete!")
print(f"Card table: {len(card_df)} records, {len(card_df.columns)} columns")
print(f"Keywords: {len(keywords_df)} unique")
