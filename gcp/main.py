# from twitter_scraper import scrape_twitter as twitter_func

# def scrape_twitter(request):
#     return twitter_func(request)

import requests
from google.cloud import bigquery
from datetime import datetime
from flask import jsonify
import time

def scrape_twitter(request):
    project_id = "nexus-466618"
    token = "AAAAAAAAAAAAAAAAAAAAAP%2Bw3AEAAAAAIQXaifKjtfWIk%2FeN6allHYD%2B9gI%3DvmiDeBopOZQmu4UObyyLZc6HfY1v5tdJqect8lLeBSCBcowGiq"

    # headers = {"Authorization": f"Bearer {token}"}
    # query = "weather OR civic OR flood"
    # url = f"https://api.twitter.com/2/tweets/search/recent?query={query}&tweet.fields=created_at&max_results=100"

    headers = {"Authorization": f"Bearer {token}"}
    query = "weather OR civic OR flood"
    url = f"https://api.twitter.com/2/tweets/search/recent?query={query}"

    all_tweets = []
    next_token = None
    max_pages = 2  # throttled down to avoid rate limit

    for _ in range(max_pages):
        params = {
            "query": query,
            "tweet.fields": "created_at",
            "max_results": 100
        }
        if next_token:
            params["next_token"] = next_token

        try:
            res = requests.get(url, headers=headers, params=params)
            if res.status_code == 429:
                print("Rate limit hit. Waiting 30 seconds...")
                time.sleep(30)
                continue

            if res.status_code != 200:
                print("Twitter API Error:", res.status_code, res.text)
                return f"Twitter API Error: {res.status_code}", 500

            response = res.json()
            print("Meta info:", response.get("meta", {}))
            tweets = response.get("data", [])
            print(f"Fetched {len(tweets)} tweets.")
            all_tweets.extend(tweets)

            next_token = response.get("meta", {}).get("next_token")
            if not next_token:
                break

        except Exception as e:
            print("Exception during Twitter fetch:", str(e))
            return f"Error occurred: {str(e)}", 500

    rows = [
        {
            "id": tweet["id"],
            "text": tweet["text"],
            "created_at": tweet.get("created_at", datetime.utcnow().isoformat())
        }
        for tweet in all_tweets
    ]

    if not rows:
        return "No tweets found for the query. Nothing inserted to BigQuery."

    bq = bigquery.Client()
    table_id = f"{project_id}.social_data.twitter_data"
    errors = bq.insert_rows_json(table_id, rows)
    if errors:
        print("BQ Insert errors:", errors)
        return f"BigQuery insert errors: {errors}", 500

import time    return f"{len(rows)} tweets stored in BigQuery."