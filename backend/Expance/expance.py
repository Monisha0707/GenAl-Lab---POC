from flask import Blueprint, request, jsonify
from datetime import datetime
from pymongo import MongoClient

# Setup
client = MongoClient("mongodb://localhost:27017/")
db = client["expense_tracker"]
expenses_collection = db["user_expenses"]

expense_routes = Blueprint("expense_routes", __name__)


@expense_routes.route("/add-expense", methods=["POST"])
def add_expense():
    data = request.get_json()
    print("Received data:", data)
    # Validate required fields
    required_fields = ["userID", "amount", "type", "place", "date"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    user_id = data["userID"]

    new_expense = {
        "amount": data["amount"],
        "type": data["type"],
        "customType": data.get("customType", ""),
        "specification": data.get("specification", ""),
        "place": data["place"],
        "date": data["date"],
        "timestamp": datetime.utcnow(),
    }

    # Check if user already has an entry in the table
    existing_user = expenses_collection.find_one({"userID": user_id})

    if existing_user:
        # Update existing document by appending to 'expenses' array
        expenses_collection.update_one(
            {"userID": user_id}, {"$push": {"expenses": new_expense}}
        )
    else:
        # Create new document for this user
        expenses_collection.insert_one({"userID": user_id, "expenses": [new_expense]})

    return jsonify({"message": "Expense added successfully!"}), 200
