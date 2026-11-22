import psycopg2

from config import Config


try:

    connection = psycopg2.connect(
        Config.SQLALCHEMY_DATABASE_URI
    )

    print("✅ RoadFix connected to PostgreSQL!")

    connection.close()

except Exception as error:

    print("❌ Database connection failed!")
    print(error)