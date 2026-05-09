import os
import sys
from dotenv import load_dotenv

load_dotenv()

print("Testing Google Gemini...")
api_key = os.getenv("GOOGLE_API_KEY")

try:
    from langchain_google_genai import ChatGoogleGenerativeAI

    chat = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    res = chat.invoke("Say 'Hello from India'")
    print("✅ Chat success:", res.content)
except Exception as e:
    print("❌ Chat Error:", e)

try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings

    embed = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    res = embed.embed_query("Test query")
    print("✅ Embeddings success, dimension:", len(res))
except Exception as e:
    print("❌ Embeddings Error:", e)
