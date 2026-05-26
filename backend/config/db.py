# Development mode setup for MySQL db connection

# from flask_mysqldb import MySQL
# from dotenv import load_dotenv
# import os

# mysql = MySQL()

# load_dotenv()

# def connect_db(app):
    # try:
       # app.config["MYSQL_HOST"] = os.getenv("HOST")
        # app.config["MYSQL_USER"] = os.getenv("USER")
        # app.config["MYSQL_PASSWORD"] = os.getenv("PASSWORD")
        # app.config["MYSQL_DB"] = os.getenv("DB_NAME")

        # mysql.init_app(app)

        # print("Database connection successful.")

    # except Exception as e:
       # print(f"Error connecting to database: {e}")


# Production mode setup for MySQL db connection using aiven cloud platform

import os
from flask_mysqldb import MySQL
from dotenv import load_dotenv

mysql = MySQL()

load_dotenv()

def connect_db(app):
    try:
        app.config["MYSQL_HOST"] = os.getenv("HOST")
        app.config["MYSQL_USER"] = os.getenv("USER")
        app.config["MYSQL_PASSWORD"] = os.getenv("PASSWORD")
        app.config["MYSQL_DB"] = os.getenv("DB_NAME")
        app.config["MYSQL_PORT"] = int(os.getenv("DB_PORT"))

        # Absolute path to the ca.pem file inside your config folder
        ca_cert_path = os.path.join(os.path.dirname(__file__), "ca.pem")

        # SSL connection required by Aiven
        app.config["MYSQL_CUSTOM_OPTIONS"] = {
            "ssl": {
                "ca": ca_cert_path
            }
        }

        mysql.init_app(app)
        print("Database configuration loaded successfully.")

    except Exception as e:
        print(f"Error configuring database variables: {e}")
