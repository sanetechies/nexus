# from twitter_scraper import scrape_twitter as twitter_func

# def scrape_twitter(request):
#     return twitter_func(request)

import requests
from google.cloud import bigquery
from datetime import datetime
from flask import jsonify

def scrape_twitter(request):
    project_id = "nexus-466618"
    token = "AAAAAAAAAAAAAAAAAAAAAP%2Bw3AEAAAAAIQXaifKjtfWIk%2FeN6allHYD%2B9gI%3DvmiDeBopOZQmu4UObyyLZc6HfY1v5tdJqect8lLeBSCBcowGiq"

    headers = {"Authorization": f"Bearer {token}"}
    query = "weather OR civic OR flood"
    url = f"https://api.twitter.com/2/tweets/search/recent?query={query}&tweet.fields=created_at&max_results=100"

    response = requests.get(url, headers=headers).json()
    print("Twitter API response:", response)

    rows = [
        {
            "id": tweet["id"],
            "text": tweet["text"],
            "created_at": tweet.get("created_at", datetime.now().isoformat())
        }
        for tweet in response.get("data", [])
    ]

    if not rows:
        return "No tweets found for the query. Nothing inserted to BigQuery."

    bq = bigquery.Client()
    table_id = f"{project_id}.social_data.twitter_data"
    errors = bq.insert_rows_json(table_id, rows)
    if errors:
        print("BQ Insert errors:", errors)
        return f"BigQuery insert errors: {errors}", 500

    return f"{len(rows)} tweets stored in BigQuery."
