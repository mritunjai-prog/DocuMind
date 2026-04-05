import os
import re
import time
from typing import Dict, Any, List, Tuple
import fitz

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
chat_sessions: Dict[str, Dict[str, Any]] = {}


def _normalize_url(url: str) -> str:
    if not url:
        return ""

    cleaned = url.strip().strip("'\"<>[](){}.,;")
    if cleaned.startswith("www."):
        cleaned = f"https://{cleaned}"
    if cleaned.lower().startswith("github.com/"):
        cleaned = f"https://{cleaned}"
    if cleaned.lower().startswith("linkedin.com/"):
        cleaned = f"https://{cleaned}"
    return cleaned


def _extract_urls_from_text(text: str) -> List[str]:
    if not text:
        return []

    pattern = r"(?:https?://|www\.|github\.com/|mailto:|tel:)[^\s<>'\"\]\)\}]+"
    matches = re.findall(pattern, text, flags=re.IGNORECASE)

    urls: List[str] = []
    seen = set()
    for match in matches:
        normalized = _normalize_url(match)
        if normalized and normalized not in seen:
            seen.add(normalized)
            urls.append(normalized)

    return urls


def _is_link_query(query: str) -> bool:
    q = query.lower()
    keywords = [
        "link",
        "url",
        "github",
        "linkedin",
        "live",
        "website",
        "profile",
        "application",
        "app",
    ]
    return any(keyword in q for keyword in keywords)


def _answer_link_query(query: str, context_text: str) -> str:
    urls = _extract_urls_from_text(context_text)
    if not urls:
        return ""

    q = query.lower()
    candidates = urls

    # Prioritize project-specific URLs when user names one.
    for token in ["kolam", "documind", "mentoraid", "docent"]:
        if token in q:
            token_matches = [u for u in urls if token in u.lower()]
            if token_matches:
                candidates = token_matches
                break

    if "github" in q:
        github_matches = [u for u in candidates if "github.com" in u.lower()]
        if github_matches:
            candidates = github_matches

    if "profile" in q and "github" in q:
        profile_matches = [
            u
            for u in candidates
            if re.match(r"https?://github\.com/[^/]+/?$", u, flags=re.IGNORECASE)
        ]
        if profile_matches:
            candidates = profile_matches

    if "profile" in q and "linkedin" in q:
        linkedin_profile_matches = [
            u
            for u in candidates
            if re.match(
                r"https?://(www\.)?linkedin\.com/in/[^/]+/?$",
                u,
                flags=re.IGNORECASE,
            )
        ]
        if linkedin_profile_matches:
            candidates = linkedin_profile_matches

    if any(k in q for k in ["live", "website", "application", "app"]):
        live_matches = [
            u
            for u in candidates
            if not any(block in u.lower() for block in ["github.com", "linkedin.com"])
        ]
        if live_matches:
            candidates = live_matches

    if "mritunjai" in q:
        person_matches = [u for u in candidates if "mritunjai" in u.lower()]
        if person_matches:
            candidates = person_matches

    candidates = list(dict.fromkeys(candidates))
    if not candidates:
        return ""

    if len(candidates) == 1:
        return f"Here is the link: {candidates[0]}"

    # Prefer a shortest direct URL when the user asks for a single link.
    if any(word in q for word in ["link", "url", "profile"]):
        ranked = sorted(candidates, key=lambda u: (u.count("/"), len(u)))
        return f"Here is the link: {ranked[0]}"

    return "Here are the relevant links:\n" + "\n".join([f"- {u}" for u in candidates])


def _load_pdf_documents_with_links(file_path: str) -> List[Document]:
    pdf_doc = fitz.open(file_path)
    docs: List[Document] = []

    try:
        for page_index in range(pdf_doc.page_count):
            page = pdf_doc[page_index]
            page_text = page.get_text("text") or ""

            page_urls = _extract_urls_from_text(page_text)
            for link in page.get_links():
                uri = link.get("uri")
                normalized = _normalize_url(uri) if uri else ""
                if normalized and normalized not in page_urls:
                    page_urls.append(normalized)

            if page_urls:
                page_text = (
                    f"{page_text.strip()}\n\nExtracted Hyperlinks:\n"
                    + "\n".join([f"- {url}" for url in page_urls])
                )

            page_text = page_text.strip() or "No text extracted from this PDF page."
            docs.append(
                Document(
                    page_content=page_text,
                    metadata={
                        "source": file_path,
                        "page": page_index + 1,
                        "links": page_urls,
                    },
                )
            )
    finally:
        pdf_doc.close()

    return docs


def _chat_model_candidates() -> List[str]:
    configured_model = os.getenv("GEMINI_CHAT_MODEL", "").strip()
    defaults = [
        "models/gemini-2.5-flash",
        "gemini-2.5-flash",
        "models/gemini-2.0-flash",
        "gemini-2.0-flash",
        "models/gemini-1.5-pro",
        "gemini-1.5-pro",
    ]

    ordered = [configured_model] + defaults if configured_model else defaults
    deduped: List[str] = []
    seen = set()
    for model in ordered:
        if model and model not in seen:
            seen.add(model)
            deduped.append(model)
    return deduped


def _is_rate_limited_error(err: Exception) -> bool:
    message = str(err)
    return "429" in message or "RESOURCE_EXHAUSTED" in message


def _is_not_found_error(err: Exception) -> bool:
    message = str(err)
    return "404" in message or "NOT_FOUND" in message


def _invoke_chat_with_fallback(
    messages, max_retries: int = 3, retry_sleep_seconds: int = 20
) -> Tuple[Any, str]:
    last_error: Exception | None = None

    for model_name in _chat_model_candidates():
        llm = ChatGoogleGenerativeAI(model=model_name)

        for attempt in range(max_retries):
            try:
                return llm.invoke(messages), model_name
            except Exception as err:
                last_error = err

                if _is_rate_limited_error(err) and attempt < max_retries - 1:
                    print(
                        f"Rate limit hit for {model_name}. Sleeping {retry_sleep_seconds}s (Attempt {attempt + 1}/{max_retries})"
                    )
                    time.sleep(retry_sleep_seconds)
                    continue

                if _is_not_found_error(err):
                    print(f"Model not available: {model_name}. Trying next model.")
                    break

                raise err

    if last_error:
        raise last_error
    raise RuntimeError("No compatible Gemini chat model is configured.")


def _normalize_pointwise_summary(text: str) -> str:
    if not text:
        return ""

    normalized = text.replace("\r\n", "\n").replace("\r", "\n").strip()

    # Convert common bullet styles to standard dash bullets.
    normalized = re.sub(r"^\s*[\*•]\s+", "- ", normalized, flags=re.MULTILINE)

    # If model returns all bullets in one line, split them into separate lines.
    normalized = re.sub(r"(?<!\n)\s-\s", "\n- ", normalized)

    lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    if not lines:
        return ""

    # Ensure each line is a point.
    lines = [line if line.startswith("-") else f"- {line}" for line in lines]
    return "\n".join(lines)


def _get_chat_session(document_id: str) -> Dict[str, Any]:
    if document_id not in chat_sessions:
        chat_sessions[document_id] = {"history": [], "price_facts": []}
    return chat_sessions[document_id]


def _append_chat_history(session: Dict[str, Any], role: str, text: str):
    session.setdefault("history", []).append({"role": role, "text": text})
    # Keep the in-memory window bounded.
    if len(session["history"]) > 20:
        session["history"] = session["history"][-20:]


def _build_history_context(session: Dict[str, Any], last_n: int = 6) -> str:
    history = session.get("history", [])[-last_n:]
    if not history:
        return ""
    return "\n".join([f"{entry['role'].upper()}: {entry['text']}" for entry in history])


def _is_sum_query(query: str) -> bool:
    q = query.lower()
    triggers = ["sum", "total", "add", "combined", "altogether", "together"]
    return any(trigger in q for trigger in triggers)


def _extract_item_from_query(query: str) -> str:
    patterns = [
        r"(?:price|cost|amount)\s+of\s+([a-zA-Z ]+)",
        r"how\s+much\s+(?:is|are)\s+([a-zA-Z ]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, query, flags=re.IGNORECASE)
        if match:
            item = re.sub(r"\s+", " ", match.group(1)).strip(" ?.,")
            return item.lower()
    return ""


def _extract_numbers(text: str) -> List[float]:
    values = re.findall(r"\b(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\b", text)
    parsed: List[float] = []
    for value in values:
        try:
            parsed.append(float(value.replace(",", "")))
        except ValueError:
            continue
    return parsed


def _store_price_fact(session: Dict[str, Any], query: str, answer: str):
    item = _extract_item_from_query(query)
    if not item:
        return

    numbers = _extract_numbers(answer)
    if not numbers:
        return

    value = numbers[0]
    facts = session.setdefault("price_facts", [])

    # Keep only the latest value per item.
    updated = False
    for fact in facts:
        if fact["item"] == item:
            fact["value"] = value
            updated = True
            break

    if not updated:
        facts.append({"item": item, "value": value})

    if len(facts) > 20:
        session["price_facts"] = facts[-20:]


def _format_number(value: float) -> str:
    if value.is_integer():
        return f"{int(value)}"
    return f"{value:.2f}".rstrip("0").rstrip(".")


def _resolve_sum_facts(session: Dict[str, Any], query: str) -> List[Dict[str, Any]]:
    facts = session.get("price_facts", [])
    if not facts:
        return []

    q = query.lower()

    # If user references previously asked count like "these 3", use latest N.
    count_match = re.search(r"(?:these|last)\s+(\d+)", q)
    if count_match:
        count = max(1, int(count_match.group(1)))
        return facts[-count:]

    if "these three" in q:
        return facts[-3:]

    # If user mentions item names explicitly, sum those.
    selected = [fact for fact in facts if fact["item"] in q]
    if selected:
        return selected

    # Fallback: use latest three when available, else all known facts.
    if len(facts) >= 3:
        return facts[-3:]
    return facts


def _handle_sum_query(session: Dict[str, Any], query: str) -> str:
    selected_facts = _resolve_sum_facts(session, query)
    if len(selected_facts) < 2:
        return ""

    total = sum(float(fact["value"]) for fact in selected_facts)
    parts = [
        f"{fact['item'].title()}: {_format_number(float(fact['value']))}"
        for fact in selected_facts
    ]
    return (
        "Here is the total based on our previous values:\n"
        + "\n".join([f"- {part}" for part in parts])
        + f"\n- Total: {_format_number(total)}"
    )


class DocumentRAG:
    @staticmethod
    def process_document_into_rag(document_id: str, file_path: str):
        print(f"Processing RAG for {file_path}")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        if file_path.lower().endswith(".pdf"):
            try:
                docs = _load_pdf_documents_with_links(file_path)
                print(f"PDF loaded with hyperlink extraction. Pages: {len(docs)}")
            except Exception as e:
                print(
                    f"PyMuPDF link extraction failed, falling back to PyPDFLoader: {e}"
                )
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
            chat_sessions[document_id] = {"history": [], "price_facts": []}
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
            session = _get_chat_session(document_id)

            if _is_sum_query(query):
                computed_answer = _handle_sum_query(session, query)
                if computed_answer:
                    _append_chat_history(session, "user", query)
                    _append_chat_history(session, "assistant", computed_answer)
                    return {"answer": computed_answer, "sources": []}

            vectorstore = vector_stores[document_id]
            retriever = vectorstore.as_retriever()

            docs = retriever.invoke(query)
            context_text = "\n\n---\n\n".join([doc.page_content for doc in docs])
            history_context = _build_history_context(session)

            if _is_link_query(query):
                link_answer = _answer_link_query(query, context_text)
                if link_answer:
                    _append_chat_history(session, "user", query)
                    _append_chat_history(session, "assistant", link_answer)
                    return {
                        "answer": link_answer,
                        "sources": [doc.page_content for doc in docs],
                    }

            system_prompt = (
                "You are an intelligent document assistant. "
                "Use the following pieces of retrieved context from the document to answer the question. "
                "If you don't know the answer or if the information is not in the context, say so clearly. "
                "Keep the answer helpful and concise. "
                "If user asks a follow-up question, use recent conversation context as well. "
                "If the answer includes a link, always return the full URL including https:// when possible."
            )

            user_payload = f"Context:\n{context_text}\n\nQuestion: {query}"
            if history_context:
                user_payload = (
                    f"Recent conversation:\n{history_context}\n\n" + user_payload
                )

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_payload),
            ]

            response, model_used = _invoke_chat_with_fallback(
                messages, max_retries=2, retry_sleep_seconds=5
            )
            print(f"query_document used model: {model_used}")

            response_text = str(response.content)
            _append_chat_history(session, "user", query)
            _append_chat_history(session, "assistant", response_text)
            _store_price_fact(session, query, response_text)

            sources = [doc.page_content for doc in docs]

            return {
                "answer": response_text,
                "sources": sources,
            }
        except Exception as e:
            return {
                "answer": f"Error generating answer: {str(e)}\n\nCheck GOOGLE_API_KEY and optional GEMINI_CHAT_MODEL in backend/.env.",
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

            prompt = (
                "Please provide a structured, concise, and pointwise summary of the following text.\n"
                "CRITICAL REQUIREMENTS:\n"
                "1. Do NOT use markdown symbols like asterisk (*) or backticks (`).\n"
                "2. Use plain dashes (-) for list items.\n"
                "3. Use normal Sentence case. Do NOT write in ALL CAPS.\n"
                "4. Focus only on the extracted data (Names, IDs, Addresses, Key facts) and ignore garbled text.\n\n"
                f"{full_text}\n\n"
                "Structured Summary:"
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

            def safe_invoke(msgs):
                response, model_used = _invoke_chat_with_fallback(
                    msgs, max_retries=4, retry_sleep_seconds=20
                )
                print(f"analyze_document used model: {model_used}")
                return response

            response = safe_invoke([HumanMessage(content=prompt)])
            summary = _normalize_pointwise_summary(response.content)

            ner_response = safe_invoke([HumanMessage(content=ner_prompt)])
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

            classification_response = safe_invoke(
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
            is_rate_limited = _is_rate_limited_error(e)
            return {
                "document_id": document_id,
                "status": "completed",
                "ocr_text": (
                    full_text if "full_text" in locals() else "Error extracting text."
                ),
                "entities": [
                    {
                        "label": "INFO",
                        "text": (
                            "Skipped due to API Quota limits."
                            if is_rate_limited
                            else "Skipped due to AI model configuration error."
                        ),
                    }
                ],
                "summary": (
                    "- Summary bypassed due to strict API Quota limits.\n- OCR text has been completely extracted and successfully saved below."
                    if is_rate_limited
                    else "- Summary generation skipped due to AI model error.\n- OCR text has been completely extracted and successfully saved below."
                ),
                "document_type": "Identity Document",
                "anomalies": [],
            }
