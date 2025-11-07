import os
from dotenv import load_dotenv
from flask_pymongo import PyMongo

load_dotenv()
mongo = PyMongo()


def init_db(app):
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    print("connection initialised:", app.config["MONGO_URI"])
    mongo.init_app(app)
