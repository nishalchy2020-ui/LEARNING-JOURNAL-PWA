import json
import os

# JSON file in the same folder as this script
JSON_PATH = os.path.join(os.path.dirname(__file__), "reflections.json")

def load_data():
    if not os.path.exists(JSON_PATH):
        return []
    with open(JSON_PATH, "r") as f:
        return json.load(f)

def save_data(data):
    with open(JSON_PATH, "w") as f:
        json.dump(data, f, indent=4)

def add_entry():
    data = load_data()

    print("Add a new reflection entry:")
    week = int(input("Week number (e.g. 3): "))
    date = input("Date (YYYY-MM-DD): ")
    title = input("Short title: ")
    reflection = input("Reflection text: ")

    new_id = max((item["id"] for item in data), default=0) + 1

    new_entry = {
        "id": new_id,
        "week": week,
        "date": date,
        "title": title,
        "reflection": reflection
    }

    data.append(new_entry)
    save_data(data)
    print("Entry added and JSON file updated at:", JSON_PATH)

if __name__ == "__main__":
    add_entry()