from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import spacy
import torch
import numpy as np
import re
from typing import List, Dict


class DocumentClassifier:
    def __init__(self):
        # We're mocking the actual model loading for local testing since LayoutLM is massive
        # For production use: "microsoft/layoutlm-base-uncased"
        self.model_name = "distilbert-base-uncased"
        try:
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name
            )
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        except Exception as e:
            print(f"Failed to load classification model: {e}")
            self.model = None

        self.document_types = [
            "invoice",
            "contract",
            "receipt",
            "medical_record",
            "tax_form",
            "insurance",
            "po",
            "bank_statement",
        ]

    async def classify(self, extracted_text: str, ocr_confidence: float) -> Dict:
        """
        Classify document based on text content.
        Uses a mocked transformer pipeline or falls back to rule-based classification if ML fails.
        """
        if not extracted_text:
            return {"document_type": "unknown", "confidence": 0.0, "all_scores": {}}

        text_lower = extracted_text.lower()

        # Simple rule-based fallback if model wasn't loaded or simply as a booster
        if "invoice" in text_lower and "total" in text_lower:
            return {"document_type": "invoice", "confidence": 0.95, "all_scores": {}}
        elif "agreement" in text_lower and "parties" in text_lower:
            return {"document_type": "contract", "confidence": 0.95, "all_scores": {}}

        if self.model and self.tokenizer:
            try:
                inputs = self.tokenizer(
                    extracted_text[:512], return_tensors="pt", truncation=True
                )

                with torch.no_grad():
                    outputs = self.model(**inputs)
                    logits = outputs.logits[0]

                probabilities = torch.softmax(logits, dim=-1).cpu().numpy()
                top_idx = int(np.argmax(probabilities))

                # Normalize probabilities size to our document types length
                if len(probabilities) >= len(self.document_types):
                    final_probs = probabilities[: len(self.document_types)]
                else:
                    final_probs = np.pad(
                        probabilities,
                        (0, len(self.document_types) - len(probabilities)),
                        "constant",
                    )

                return {
                    "document_type": self.document_types[
                        top_idx % len(self.document_types)
                    ],
                    "confidence": float(final_probs[top_idx % len(final_probs)]),
                    "all_scores": {
                        dtype: float(prob)
                        for dtype, prob in zip(self.document_types, final_probs)
                    },
                }
            except Exception as e:
                print(f"Classification inference failed: {e}")

        return {"document_type": "unknown", "confidence": 0.0, "all_scores": {}}


class NERExtractor:
    def __init__(self, document_type: str):
        self.document_type = document_type
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading en_core_web_sm...")
            spacy.cli.download("en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")

        # Domain-specific NER models
        try:
            if document_type == "invoice":
                self.ner_pipeline = pipeline(
                    "token-classification", model="dslim/bert-base-NER-uncased"
                )
            else:
                self.ner_pipeline = None
        except Exception as e:
            print(f"Failed to load NER pipeline: {e}")
            self.ner_pipeline = None

    async def extract_entities(self, text: str) -> List[Dict]:
        """
        Extract entities using:
        1. Transformer-based NER (if available)
        2. Regex patterns (domain-specific)
        3. SpaCy named entity recognition
        """
        entities = []

        # Transformer-based extraction
        if self.ner_pipeline:
            try:
                transformer_entities = self.ner_pipeline(text[:512])
                for ent in transformer_entities:
                    entities.append(
                        {
                            "text": ent["word"],
                            "entity_type": ent["entity"],
                            "source": "transformer",
                            "confidence": float(ent["score"]),
                            "start": ent["start"],
                            "end": ent["end"],
                        }
                    )
            except Exception as e:
                print(f"Transformer extraction failed: {e}")

        # Regex patterns for specific fields
        pattern_matches = self._extract_by_patterns(text)
        entities.extend(pattern_matches)

        # SpaCy extraction
        if self.nlp:
            doc = self.nlp(text)
            spacy_entities = [
                {
                    "text": ent.text,
                    "entity_type": ent.label_,
                    "source": "spacy",
                    "confidence": 0.9,
                    "start": ent.start_char,
                    "end": ent.end_char,
                }
                for ent in doc.ents
            ]
            entities.extend(spacy_entities)

        return entities

    def _extract_by_patterns(self, text: str) -> List[Dict]:
        """Regex-based extraction for specific fields based on document type"""
        patterns = {}
        if self.document_type == "invoice":
            patterns = {
                "AMOUNT_TOTAL": r"Total[:\s]+\$?\s*([\d,]+\.?\d*)",
                "INVOICE_NUMBER": r"Invoice\s*#?:?\s*([A-Z0-9\-]+)",
                "INVOICE_DATE": r"Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
                "EMAIL": r"[\w\.-]+@[\w\.-]+\.\w+",
                "PHONE": r"\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}",
            }
        elif self.document_type == "contract":
            patterns = {
                "EFFECTIVE_DATE": r"effective\s+date\s*[:\w\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
                "PARTY_NAME": r"(between|by and between)\s+([A-Z][A-Za-z\s.,]+(?:Inc|LLC|Ltd|Corporation))",
            }
        else:
            patterns = {"DATE": r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})"}

        entities = []
        for entity_type, pattern in patterns.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entities.append(
                    {
                        "text": match.group(1) if match.groups() else match.group(0),
                        "entity_type": entity_type,
                        "source": "regex",
                        "confidence": 0.95,
                        "start": match.start(),
                        "end": match.end(),
                    }
                )

        return entities
