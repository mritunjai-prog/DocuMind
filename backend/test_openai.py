#!/usr/bin/env python
"""Test OpenAI API integration from India"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 70)
print("Testing OpenAI API Availability in India")
print("=" * 70)

# Check if OpenAI API key is set
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ ERROR: OPENAI_API_KEY not set in backend/.env")
    print("Please set OPENAI_API_KEY=sk-proj-... in backend/.env")
    sys.exit(1)

print("✅ OPENAI_API_KEY is configured")
print(f"   Key preview: {api_key[:20]}...{api_key[-10:]}")

try:
    print("\n" + "=" * 70)
    print("Test 1: Initialize ChatOpenAI")
    print("=" * 70)
    from langchain_openai import ChatOpenAI

    chat = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    print("✅ ChatOpenAI instance created successfully")

    print("\n" + "=" * 70)
    print("Test 2: Send a test message to OpenAI")
    print("=" * 70)
    response = chat.invoke(
        "Confirm you can access from India: Just say 'Available from India'"
    )
    print(f"✅ Response received: {response.content}")

except Exception as e:
    print(f"❌ ChatOpenAI Error: {e}")
    sys.exit(1)

try:
    print("\n" + "=" * 70)
    print("Test 3: Initialize OpenAI Embeddings")
    print("=" * 70)
    from langchain_openai import OpenAIEmbeddings

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    print("✅ OpenAIEmbeddings instance created successfully")

    print("\n" + "=" * 70)
    print("Test 4: Generate test embedding")
    print("=" * 70)
    embedding_result = embeddings.embed_query("Test document from India")
    print(f"✅ Embedding generated successfully")
    print(f"   Embedding dimensions: {len(embedding_result)}")
    print(f"   First 5 values: {embedding_result[:5]}")

except Exception as e:
    print(f"❌ OpenAIEmbeddings Error: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("✅ ALL TESTS PASSED - OpenAI API is accessible from India!")
print("=" * 70)
