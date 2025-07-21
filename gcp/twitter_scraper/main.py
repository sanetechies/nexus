import functions_framework
import requests
from google.cloud import bigquery
from datetime import datetime

@functions_framework.http
def scrape_twitter(request):
    project_id = "nexus-466618"
    token = "AAAAAAAAAAAAAAAAAAAAAP%2Bw3AEAAAAAIQXaifKjtfWIk%2FeN6allHYD%2B9gI%3DvmiDeBopOZQmu4UObyyLZc6HfY1v5tdJqect8lLeBSCBcowGiq"

    headers = {"Authorization": f"Bearer {token}"}
    query = "bengaluru OR bangalore OR rain OR flood OR traffic OR riot OR chaos OR civic OR weather"
    url = "https://api.twitter.com/2/tweets/search/recent"
    
    max_pages = 10  # Adjust for more data (up to rate limit)
    next_token = None
    all_tweets = []

    for _ in range(max_pages):
        params = {
            "query": query,
            "tweet.fields": "created_at",
            "max_results": 100
        }
        if next_token:
            params["next_token"] = next_token

        res = requests.get(url, headers=headers, params=params).json()
        tweets = res.get("data", [])
        all_tweets.extend(tweets)

        # Exit if no more pages
        next_token = res.get("meta", {}).get("next_token")
        if not next_token:
            break

    # Prepare rows for BigQuery
    rows = [
        {
            "id": tweet["id"],
            "text": tweet["text"],
            "created_at": tweet.get("created_at", datetime.now().isoformat())
        }
        for tweet in all_tweets
    ]

    bq = bigquery.Client()
    table_id = f"{project_id}.social_data.twitter_data"
    bq.insert_rows_json(table_id, rows)
    
    return f"{len(rows)} tweets stored in BigQuery."
