import pandas as pd

df = pd.read_json("default-cards-20250919090807.json")

filtered_df = df[df["set_name"].isin(["Foundations"])]

keep_columns = [
    "id",                 # maps to cid
    "oracle_id",
    "name",
    "released_at",
    "set",
    "set_name",
    "set_type",
    "collector_number",
    "rarity",
    "mana_cost",
    "cmc",                # maps to mv
    "oracle_text",
    "power",
    "toughness",
    "loyalty",
    "defense",
    "colors",
    "color_identity",
    "keywords",
    "produced_mana",
    "legalities",
    "prices",
    "image_uris",
    "flavor_text",
    "artist",
    "frame_effects",
    "border_color",
    "full_art",
    "scryfall_uri",
    "rulings_uri",
    "purchase_uris",
    "edhrec_rank"
]


existing_columns = [c for c in keep_columns if c in filtered_df.columns]
trimmed_df = filtered_df[existing_columns].copy()

trimmed_df.rename(columns={
    "id": "cid",
    "cmc": "mv"
}, inplace=True)

trimmed_df.to_json("filtered-cards-clean.json", orient="records", indent=2)

print(f"Filtered + trimmed dataset saved with {len(trimmed_df)} rows and {len(trimmed_df.columns)} columns.")


# filtered_df.to_json("filtered-cards.json", orient="records", indent=2)
# print("Columns in filtered_df:")
# for col in filtered_df.columns:
#     print(col)
# print(f"Filtered dataset saved. Rows remaining: {len(filtered_df)}")


# ## print a count of all rows
# print(len(df))
# print(df.columns)
# print(len(df.columns))