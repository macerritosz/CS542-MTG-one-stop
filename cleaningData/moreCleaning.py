import pandas as pd 
df = pd.read_json("filtered-cards-normalized.json")

if "defense" in df.columns:
    df.drop(columns=["defense"], inplace=True)


def extract_price_usd(prices):
    if isinstance(prices, dict):
        return prices.get("usd")
    return None

def extract_price_foil_usd(prices):
    if isinstance(prices, dict):
        return prices.get("usd_foil")
    return None

df["price_usd"] = df["prices"].apply(extract_price_usd)
df["price_foil_usd"] = df["prices"].apply(extract_price_foil_usd)


df.drop(columns=["prices"], inplace=True)


df.to_json("filtered-cards-final.json", orient="records", indent=2)

print("Final dataset saved as 'filtered-cards-final.json'")
print(f"Columns now: {list(df.columns)}")