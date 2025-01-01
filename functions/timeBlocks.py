import os
import psycopg2
import json

# Get the database URL from the environment variables
DATABASE_URL = os.environ.get('DATABASE_URL')

def handler(event, context):
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        cur = conn.cursor()

        if event['httpMethod'] == 'GET':
            # Fetch all time blocks
            cur.execute("SELECT * FROM timeBlocks")
            rows = cur.fetchall()

            # Convert rows to a list of dictionaries
            time_blocks = [
                {"id": r[0], "start_time": r[1], "end_time": r[2], "description": r[3]} for r in rows
            ]

            return {
                "statusCode": 200,
                "body": json.dumps(time_blocks),
            }

        elif event['httpMethod'] == 'POST':
            # Parse the request body
            data = json.loads(event['body'])
            cur.execute(
                "INSERT INTO timeBlocks (start_time, end_time, description) VALUES (%s, %s, %s)",
                (data['start_time'], data['end_time'], data['description']),
            )
            conn.commit()

            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Time block added successfully"}),
            }

        else:
            return {
                "statusCode": 405,
                "body": json.dumps({"message": "Method Not Allowed"}),
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": f"Error: {str(e)}"}),
        }

    finally:
        # Close the database connection
        if conn:
            cur.close()
            conn.close()
