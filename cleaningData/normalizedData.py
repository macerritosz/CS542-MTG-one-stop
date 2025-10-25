import pandas as pd

df = pd.read_json("filtered-cards-clean.json")


def simplify_prices(p):
    if isinstance(p, dict):
        return {
            "usd": p.get("usd"),
            "usd_foil": p.get("usd_foil")
        }
    return None

df["prices"] = df["prices"].apply(simplify_prices)

def simplify_purchase_uris(p):
    if isinstance(p, dict):
        return p.get("tcgplayer")
    return None

df["purchase_uris"] = df["purchase_uris"].apply(simplify_purchase_uris)

def simplify_image_uris(img):
    if isinstance(img, dict):
        return img.get("normal")
    return None

df["image_uris"] = df["image_uris"].apply(simplify_image_uris)

df.to_json("filtered-cards-normalized.json", orient="records", indent=2)

print("Simplified nested JSON fields and saved as 'filtered-cards-normalized.json'")
print(f"Remaining columns: {list(df.columns)}")
