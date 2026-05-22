from flask_mysqldb import MySQL
from dotenv import load_dotenv
import os

mysql = MySQL()

load_dotenv()

def connect_db(app):
    try:
        app.config["MYSQL_HOST"] = os.getenv("HOST")
        app.config["MYSQL_USER"] = os.getenv("USER")
        app.config["MYSQL_PASSWORD"] = os.getenv("PASSWORD")
        app.config["MYSQL_DB"] = os.getenv("DB_NAME")

        mysql.init_app(app)

        print("Database connection successful.")

    except Exception as e:
        print(f"Error connecting to database: {e}")