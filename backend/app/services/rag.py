import os
from typing import Dict, Any

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.documents import Document
from dotenv import load_dotenv

from .ocr import OCREngine
from .validator import DocumentValidator

load_dotenv()

vector_stores = {}


class DocumentRAG:
    @staticmethod
    def process_document_into_rag(document_id: str, file_path: str):
        print(f"Processing RAG for {file_path}")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        if file_path.lower().endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            docs = loader.load()
        elif file_path.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff")):
            print(f"Image format detected. Extracting text via OCR: {file_path}")
            ocr_engine = OCREngine()
            ocr_text = ocr_engine.extract_text(file_path)["text"]
            docs = [
                Document(
                    page_content=(
                        ocr_text
                        if ocr_text.strip()
                        else "No text could be extracted from this image."
                    ),
                    metadata={"source": file_path},
                )
            ]
        else:
            loader = TextLoader(file_path, encoding="utf-8")
            try:
                docs = loader.load()
            except Exception:
                docs = [
                    Document(
                        page_content="Could not read this file type locally.",
                        metadata={"source": file_path},
                    )
                ]

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        )
        splits = text_splitter.split_documents(docs)
        print(f"Created {len(splits)} chunks.")

        try:
            # Note: Google updated their free embedding model names.
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-001"
            )
            vectorstore = FAISS.from_documents(splits, embeddings)
            vector_stores[document_id] = vectorstore
            print("Successfully vectorized and stored.")
            return True
        except Exception as e:
            print(f"Error during embedding. Did you set GOOGLE_API_KEY?: {e}")
            return False

    @staticmethod
    def query_document(document_id: str, query: str) -> Dict[str, Any]:
        if document_id not in vector_stores:
            return {
                "answer": "The document hasn't been processed for chat yet or the server restarted. Please re-upload.",
                "sources": [],
            }

        try:
            vectorstore = vector_stores[document_id]
            retriever = vectorstore.as_retriever()

            docs = retriever.invoke(query)
            context_text = "\n\n---\n\n".join([doc.page_content for doc in docs])

            llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash")

            system_prompt = (
                "You are an intelligent document assistant. "
                "Use the following pieces of retrieved context from the document to answer the question. "
                "If you don't know the answer or if the information is not in the context, say so clearly. "
                "Keep the answer helpful and concise."
            )

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Context:\n{context_text}\n\nQuestion: {query}"),
            ]

            response = llm.invoke(messages)

            sources = [doc.page_content for doc in docs]

            return {
                "answer": response.content,
                "sources": sources,
            }
        except Exception as e:
            return {
                "answer": f"Error generating answer: {str(e)}\n\nMake sure your GOOGLE_API_KEY is defined in `backend/.env`.",
                "sources": [],
            }

    @staticmethod
    def analyze_document(document_id: str) -> Dict[str, Any]:
        """
        Creates a summary, mock NER, and returns raw text directly from the Vector DB chunks.
        """
        if document_id not in vector_stores:
            return {
                "document_id": document_id,
                "status": "processing",
                "ocr_text": "Processing...",
                "entities": [],
                "summary": "Document is still processing or not found. If you just uploaded it, please try clicking the Summary tab again in a few seconds.",
            }

        try:
            vectorstore = vector_stores[document_id]
            # Get all chunks (or up to a reasonable limit)
            docs = list(vectorstore.docstore._dict.values())[
                :10
            ]  # Grab up to 10 context chunks for summary
            full_text = "\n\n".join([doc.page_content for doc in docs])

            llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash")

            prompt = (
                "Please provide a concise but comprehensive summary of the following text:\n\n"
                f"{full_text}\n\n"
                "Summary:"
            )

            ner_prompt = (
                "Extract ALL significant named entities (such as PEOPLE, ORGANIZATIONS, LOCATIONS, DATES, AMOUNTS, EMAILS, PHONE NUMBERS, and SPECIALIZED_CONCEPTS) from the following text. Do not limit to just 3-5, provide as many relevant entities as you can find. "
                "Format the response EXACTLY as a list of 'LABEL: Entity text' with one per line. Do not include asterisks or bolding.\n\n"
                f"{full_text}\n\n"
                "Entities:"
            )

            classification_prompt = (
                "Analyze the following text and categorize this document into exactly one of these types: "
                "Invoice, Contract, Receipt, Medical Record, Tax Form, Insurance, Purchase Order, Bank Statement, or Other. "
                "Respond with ONLY the category name. Do not include any other text.\n\n"
                f"{full_text}\n\n"
                "Category:"
            )

            response = llm.invoke([HumanMessage(content=prompt)])
            summary = response.content

            ner_response = llm.invoke([HumanMessage(content=ner_prompt)])
            entities = []
            for line in ner_response.content.split("\n"):
                if ":" in line:
                    label, text = line.split(":", 1)
                    entities.append(
                        {
                            "label": label.strip().strip("*"),
                            "text": text.strip().strip("*"),
                        }
                    )

            # fallback if missing schema setup
            if not entities:
                entities = [{"label": "INFO", "text": "Extracted via Gemini"}]

            classification_response = llm.invoke(
                [HumanMessage(content=classification_prompt)]
            )
            document_type = classification_response.content.strip().strip("*")

            # Phase 5: Anomaly Detection Validation
            anomalies = DocumentValidator.validate(document_type, entities)

            return {
                "document_id": document_id,
                "status": "completed",
                "ocr_text": full_text,
                "entities": entities,
                "summary": summary,
                "document_type": document_type,
                "anomalies": anomalies,
            }
        except Exception as e:
            return {
                "document_id": document_id,
                "status": "error",
                "ocr_text": "Error extracting text.",
                "entities": [],
                "summary": f"Could not generate summary due to an error: {str(e)}",
            }
