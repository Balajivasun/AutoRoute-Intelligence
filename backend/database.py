import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "autoroute")
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def init_db():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", "")
        )
        if connection.is_connected():
            cursor = connection.cursor()
            db_name = os.getenv("MYSQL_DATABASE", "autoroute")
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name};")
            cursor.execute(f"USE {db_name};")
            
            # Enriched dataset handling all the logical variables
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS buses (
                    id VARCHAR(50) PRIMARY KEY,
                    driver_name VARCHAR(100),
                    conductor_name VARCHAR(100),
                    route_id VARCHAR(50),
                    status VARCHAR(50),
                    speed DECIMAL(5,2),
                    passenger_count INT,
                    capacity INT,
                    tickets_generated INT,
                    location POINT SRID 4326,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    SPATIAL INDEX(location)
                );
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS agent_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    trigger_event VARCHAR(255),
                    agent_decision TEXT,
                    affected_buses JSON
                );
            """)
            
            connection.commit()
            print("Database enriched schema initialized successfully.")
    except Error as e:
        print(f"Error initializing database: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    init_db()
