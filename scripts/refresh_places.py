"""Refresh the curated San Luis Obispo listing snapshot from OSM XML extracts.

Run `python3 scripts/refresh_places.py --osm-xml campus.osm --osm-xml downtown.osm`.
Get small extracts from an OpenStreetMap data provider or use Overpass. This
script intentionally does not query the OSM editing API on every site visit.
"""

import argparse
import json
import re
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SELECTED = {
    "node/4929341319": "restaurant",    # Firestone Grill
    "node/748732681": "restaurant",     # Woodstock's Pizza
    "node/10195974685": "restaurant",   # Raku Ramen
    "node/2396485350": "restaurant",    # Kona's Deli
    "node/1449700955": "restaurant",    # Jaffa Cafe
    "node/4929556822": "restaurant",    # 201 Kitchen
    "node/2597849163": "restaurant",    # Taqueria Santa Cruz Express
    "node/10195974691": "restaurant",   # Typhoon
    "node/4929556720": "restaurant",    # Coya Peruvian Food
    "node/2456191191": "restaurant",    # Thai Palace
    "node/2261957369": "restaurant",    # SLO Donut Company
    "node/12338209306": "coffee shop",  # Deltina Coffee
    "node/4915399688": "coffee shop",   # Field Day Coffee
    "node/4423745891": "coffee shop",   # Scout Coffee on Foothill
    "node/4436986554": "coffee shop",   # Sequel Tea on campus
    "node/4917195526": "study spot",   # Kreuzberg; OSM tags Wi-Fi
    "node/2368933719": "study spot",   # Linnaea's Cafe; OSM tags Wi-Fi
}
ADDRESS_OVERRIDES = {}
CUISINE_OVERRIDES = {
    "node/748732681": "Pizza",   # Woodstock's Pizza
    "node/4436986554": "Tea",    # Sequel Tea
}
CUISINE_NAMES = {
    "coffee_shop": "Coffee", "pizza": "Pizza", "indian": "Indian", "thai": "Thai",
    "mexican": "Mexican", "italian": "Italian", "chinese": "Chinese",
    "sandwich": "Sandwiches", "sushi": "Sushi", "barbecue": "Barbecue",
    "noodle": "Noodles", "ramen": "Ramen", "japanese": "Japanese",
    "mediterranean": "Mediterranean", "peruvian": "Peruvian", "donut": "Donuts",
    "bubble_tea": "Bubble tea", "asian": "Asian",
}


def sql(value):
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (float, int)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def format_hours(raw):
    if not raw:
        return None
    names = {"Mo": "Mon", "Tu": "Tue", "We": "Wed", "Th": "Thu", "Fr": "Fri", "Sa": "Sat", "Su": "Sun"}
    return re.sub(r"\b(?:Mo|Tu|We|Th|Fr|Sa|Su)\b", lambda match: names[match.group()], raw).replace("-", "–")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--osm-xml", required=True, action="append", type=Path, help="OSM XML extract covering Cal Poly or downtown SLO; repeat for multiple files")
    args = parser.parse_args()
    elements = {}
    for path in args.osm_xml:
        for element in ET.parse(path).getroot():
            key = f"{element.tag}/{element.get('id')}"
            if key in SELECTED:
                elements[key] = element
    places = []

    for key, element in elements.items():
        tags = {tag.get("k"): tag.get("v") for tag in element.findall("tag")}
        if not tags.get("name"):
            continue
        cuisine = CUISINE_OVERRIDES.get(key) or ", ".join(CUISINE_NAMES.get(part, part.replace("_", " ").title()) for part in tags.get("cuisine", "").split(";") if part) or None
        category = SELECTED[key]
        street = " ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street")]))
        address = ADDRESS_OVERRIDES.get(key) or (f"{street}, San Luis Obispo, CA" if street else "San Luis Obispo, CA")
        lat = float(element.get("lat")) if element.get("lat") else None
        lon = float(element.get("lon")) if element.get("lon") else None
        neighborhood = "On campus" if key == "node/4436986554" else ("Near Cal Poly" if lat and lat >= 35.29 else "Downtown SLO")
        tags_out = []
        if tags.get("internet_access") == "wlan": tags_out.extend(["wifi", "good for studying"])
        if tags.get("outdoor_seating") == "yes": tags_out.append("outdoor seating")
        if tags.get("diet:vegetarian") == "yes": tags_out.append("vegetarian friendly")
        if re.search(r"(?:23|24|25|26|27):\d\d|00:00|24/7", tags.get("opening_hours", "")): tags_out.append("late night")
        if cuisine: tags_out.extend(part.strip().lower() for part in cuisine.split(","))
        area = "on the Cal Poly campus" if neighborhood == "On campus" else ("near Cal Poly" if neighborhood == "Near Cal Poly" else "in downtown San Luis Obispo")
        if category == "restaurant":
            description = f"{cuisine or 'Food'} {area}."
        else:
            description = f"{cuisine or 'Café fare'} {area}."
        places.append({
            "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"https://www.openstreetmap.org/{key}")),
            "name": tags["name"], "category": category, "price_level": None,
            "cuisine": cuisine, "description": description, "address": address,
            "neighborhood": neighborhood, "hours": format_hours(tags.get("opening_hours")),
            "image_url": None, "tags": tags_out, "latitude": lat, "longitude": lon,
            "source_url": f"https://www.openstreetmap.org/{key}",
            "average_rating": None, "review_count": 0,
        })

    places.sort(key=lambda place: place["name"].casefold())
    if len(places) != len(SELECTED):
        missing = set(SELECTED) - {place["source_url"].removeprefix("https://www.openstreetmap.org/") for place in places}
        raise SystemExit(f"Expected {len(SELECTED)} places, found {len(places)}. Missing: {sorted(missing)}")

    (ROOT / "src/data/realPlaces.json").write_text(json.dumps(places, ensure_ascii=False, indent=2) + "\n")
    columns = ["id", "name", "category", "price_level", "cuisine", "description", "address", "neighborhood", "hours", "image_url", "tags", "latitude", "longitude", "source_url"]
    values = []
    for place in places:
        cells = ["array[" + ", ".join(sql(tag) for tag in place["tags"]) + "]::text[]" if col == "tags" else sql(place[col]) for col in columns]
        values.append("(" + ", ".join(cells) + ")")
    old_ids = [f"a1000000-0000-4000-8000-{i:012d}" for i in range(1, 13)]
    statement = """-- Generated from San Luis Obispo OpenStreetMap extracts. Run after schema.sql.
-- Previous Berkeley seed rows are hidden rather than deleted, preserving reviews.
alter table public.places add column if not exists latitude double precision;
alter table public.places add column if not exists longitude double precision;
alter table public.places add column if not exists source_url text;
alter table public.places add column if not exists is_active boolean not null default true;
alter table public.places alter column price_level drop not null;
alter table public.places alter column hours drop not null;

update public.places set is_active = false
where id in (""" + ", ".join(sql(value) for value in old_ids) + ")\n   or (latitude between 37.85 and 37.9 and longitude between -122.3 and -122.2);\n\n"
    statement += "insert into public.places (" + ", ".join(columns) + ") values\n" + ",\n".join(values) + "\n"
    statement += "on conflict (id) do update set " + ", ".join(f"{column} = excluded.{column}" for column in columns if column != "id") + ", is_active = true;\n"
    (ROOT / "supabase/real_places.sql").write_text(statement)
    print(f"Wrote {len(places)} real listings to src/data/realPlaces.json and supabase/real_places.sql")


if __name__ == "__main__":
    main()
