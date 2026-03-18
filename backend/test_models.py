import os, requests
from dotenv import load_dotenv
load_dotenv()
url = f'https://generativelanguage.googleapis.com/v1beta/models?key={os.getenv("GOOGLE_API_KEY")}'
res = requests.get(url)
print([m['name'] for m in res.json().get('models', [])])
