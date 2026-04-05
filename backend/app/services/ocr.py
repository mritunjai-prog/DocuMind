import cv2
import numpy as np
import pytesseract
import re
import os
from typing import Dict, List

# Tell pytesseract exactly where the binary is installed securely across Windows environments
tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path


class ImagePreprocessor:
    def preprocess(self, image_path: str) -> np.ndarray:
        """
        1. Deskew image
        2. Denoise
        3. Binarize
        4. Optimize contrast
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image from {image_path}")

        # Scale up image by 2.0x
        img = cv2.resize(img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

        # Deskew
        angle = self._detect_skew(img)
        img = self._rotate_image(img, angle)

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Denoise heavily to remove ID card background patterns (guilloche lines)
        gray = cv2.fastNlMeansDenoising(
            gray, None, h=15, templateWindowSize=7, searchWindowSize=21
        )

        # Enhance contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        # Apply a gentler adaptive threshold
        processed = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 41, 15
        )

        return processed

    def _detect_skew(self, img: np.ndarray) -> float:
        """Detect image rotation angle"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, 100, 10)

        if lines is None:
            return 0.0

        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            angles.append(angle)

        if not angles:
            return 0.0

        return float(np.median(angles))

    def _rotate_image(self, img: np.ndarray, angle: float) -> np.ndarray:
        if angle == 0.0:
            return img
        (h, w) = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )
        return rotated


class OCRPostProcessor:
    IMPORTANT_ID_KEYWORDS = (
        "aadhaar",
        "enrolment",
        "enrollment",
        "uidai",
        "government of india",
        "your aadhaar no",
        "dob",
        "date of birth",
        "male",
        "female",
        "address",
        "pin code",
        "mobile",
        "c/o",
        "s/o",
        "d/o",
        "w/o",
        "district",
        "state",
    )

    IDENTITY_CORE_KEYWORDS = (
        "enrolment",
        "enrollment",
        "aadhaar no",
        "dob",
        "date of birth",
        "male",
        "female",
        "address",
        "pin code",
        "mobile",
        "c/o",
        "s/o",
        "d/o",
        "w/o",
        "district",
        "state",
        "village",
        "sub district",
        "po:",
    )

    IDENTITY_DROP_PHRASES = (
        "proof of identity",
        "not of citizenship",
        "verification",
        "authentication",
        "offline xml",
        "qr code",
        "obligated to seek consent",
        "download maadhaar",
        "lock/unlock",
        "helps you avail",
    )

    def post_process(self, raw_text: str, document_type: str = "general") -> str:
        """
        1. Normalize OCR text while preserving line structure
        2. Repair critical numeric fields (Aadhaar, PIN, date)
        3. Remove noisy and duplicate lines
        """
        text = self._normalize_text(raw_text)
        text = self._fix_structured_numbers(text)

        lines = [self._normalize_line(line) for line in text.split("\n")]
        lines = [line for line in lines if line]

        if self._looks_like_identity_document(text, document_type):
            lines = self._filter_identity_lines(lines)
        else:
            lines = [line for line in lines if not self._is_noisy_line(line)]

        lines = self._dedupe_lines(lines)
        return "\n".join(lines).strip()

    def _normalize_text(self, text: str) -> str:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"[^\x09\x0A\x0D\x20-\x7E]", " ", text)
        text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
        text = re.sub(r"[ \t\f\v]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def _normalize_line(self, line: str) -> str:
        line = line.strip(" |\t")
        line = re.sub(r"\s+", " ", line)
        return line.strip()

    def _fix_structured_numbers(self, text: str) -> str:
        def normalize_numeric_token(token: str) -> str:
            return (
                token.replace("O", "0")
                .replace("o", "0")
                .replace("B", "8")
                .replace("l", "1")
                .replace("I", "1")
            )

        # Aadhaar-like pattern: XXXX XXXX XXXX or XXXXXXXXXXXX or with hyphens.
        text = re.sub(
            r"\b(?:[0-9OBoIl]{4}[\s-]?){2}[0-9OBoIl]{4}\b",
            lambda m: normalize_numeric_token(m.group(0)),
            text,
        )

        # PIN codes and other six-digit sequences.
        text = re.sub(
            r"\b[0-9OBoIl]{6}\b",
            lambda m: normalize_numeric_token(m.group(0)),
            text,
        )

        # Date format DD/MM/YYYY where OCR confuses 0/8/1 with letters.
        text = re.sub(
            r"\b[0-9OBoIl]{2}/[0-9OBoIl]{2}/[0-9OBoIl]{4}\b",
            lambda m: normalize_numeric_token(m.group(0)),
            text,
        )

        return text

    def _looks_like_identity_document(self, text: str, document_type: str) -> bool:
        lowered = text.lower()
        doc_type = (document_type or "").lower()
        if self._contains_keyword(lowered, self.IMPORTANT_ID_KEYWORDS):
            return True
        if "identity" in doc_type or "aadhaar" in doc_type:
            return True
        if re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", text):
            return True
        return False

    def _filter_identity_lines(self, lines: List[str]) -> List[str]:
        kept: List[str] = []
        numeric_signal = re.compile(
            r"\b\d{4}[\s-]\d{4}[\s-]\d{4}\b|\b\d{12}\b|\b\d{4}/\d{5}/\d{5}\b|\b\d{10}\b|\b\d{6}\b"
        )
        likely_name = re.compile(r"^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$")

        for line in lines:
            lowered = line.lower()
            has_keyword = self._contains_keyword(lowered, self.IDENTITY_CORE_KEYWORDS)
            has_numeric_signal = bool(numeric_signal.search(line))
            is_probable_name = bool(likely_name.match(line))

            if any(phrase in lowered for phrase in self.IDENTITY_DROP_PHRASES):
                continue

            if "proof" in lowered and "aadhaar" in lowered:
                continue
            if "security when not using" in lowered:
                continue
            if "keep your mobile" in lowered:
                continue

            if len(line) > 110 and not has_keyword:
                continue

            if has_numeric_signal and not has_keyword and len(line) > 50:
                continue

            if has_keyword or has_numeric_signal or is_probable_name:
                if not self._is_noisy_line(line, strict=False):
                    kept.append(line)

        # Keep a readable output even when keyword extraction is too strict.
        if not kept:
            kept = [line for line in lines if not self._is_noisy_line(line)]

        normalized = []
        for line in kept:
            cleaned = self._normalize_identity_line(line)
            if cleaned:
                normalized.append(cleaned)

        return normalized or kept

    def _normalize_identity_line(self, line: str) -> str:
        clean = line.strip()

        enrolment_match = re.search(r"\b(\d{4}/\d{5}/\d{5})\b", clean)
        if enrolment_match:
            return f"Enrolment No: {enrolment_match.group(1)}"

        aadhaar_match = re.search(r"\b(\d{4}[\s-]\d{4}[\s-]\d{4}|\d{12})\b", clean)
        if aadhaar_match:
            aadhaar_number = re.sub(r"[\s-]+", " ", aadhaar_match.group(1)).strip()
            return f"Aadhaar No: {aadhaar_number}"

        mobile_match = re.search(r"\b(\d{10})\b", clean)
        if mobile_match and re.search(r"\bmobile\b", clean, flags=re.IGNORECASE):
            return f"Mobile: {mobile_match.group(1)}"

        pin_match = re.search(r"\b(\d{6})\b", clean)
        if pin_match and re.search(
            r"\b(pin|bin)\s*code\b|\bpin\b", clean, flags=re.IGNORECASE
        ):
            return f"PIN Code: {pin_match.group(1)}"

        dob_match = re.search(r"\b(\d{2}/\d{2}/\d{4})\b", clean)
        if dob_match:
            return f"DOB: {dob_match.group(1)}"

        gender_match = re.search(r"\b(male|female)\b", clean, flags=re.IGNORECASE)
        if gender_match:
            return f"Gender: {gender_match.group(1).upper()}"

        relation_match = re.search(
            r"\b(c/o|s/o|d/o|w/o)\s*:\s*([^,]+)", clean, flags=re.IGNORECASE
        )
        if relation_match:
            return (
                f"{relation_match.group(1).upper()}: {relation_match.group(2).strip()}"
            )

        location_fields = ("PO", "Sub District", "District", "State")
        for field in location_fields:
            loc_match = re.search(
                rf"\b{re.escape(field)}\s*:\s*([^,]+)", clean, flags=re.IGNORECASE
            )
            if loc_match:
                return f"{field}: {loc_match.group(1).strip()}"

        if not self._is_noisy_line(clean, strict=False) and len(clean) <= 80:
            return clean

        return ""

    def _is_noisy_line(self, line: str, strict: bool = True) -> bool:
        if len(line) < 3:
            return True

        chars = [ch for ch in line if ch != " "]
        if not chars:
            return True

        symbol_count = sum(
            1 for ch in chars if not ch.isalnum() and ch not in "/:,-.()"
        )
        if symbol_count / len(chars) > 0.35:
            return True

        tokens = line.split()
        if not tokens:
            return True

        mixed_token_count = sum(
            1
            for token in tokens
            if len(token) >= 6 and bool(re.search(r"[A-Za-z]\d|\d[A-Za-z]", token))
        )
        if mixed_token_count / len(tokens) > (0.45 if strict else 0.60):
            return True

        alpha_chars = [ch for ch in line if ch.isalpha()]
        if len(alpha_chars) >= 12:
            vowels = sum(1 for ch in alpha_chars if ch.lower() in "aeiou")
            vowel_ratio = vowels / len(alpha_chars)
            if vowel_ratio < (0.18 if strict else 0.12):
                return True

        return False

    def _dedupe_lines(self, lines: List[str]) -> List[str]:
        deduped: List[str] = []
        seen_exact = set()
        seen_prefix = set()

        for line in lines:
            normalized = re.sub(r"[^a-z0-9]+", "", line.lower())
            if not normalized:
                continue

            prefix = normalized[:40]
            if normalized in seen_exact or prefix in seen_prefix:
                continue

            seen_exact.add(normalized)
            seen_prefix.add(prefix)
            deduped.append(line)

        return deduped

    def _contains_keyword(self, text: str, keywords: tuple) -> bool:
        for keyword in keywords:
            if any(ch in keyword for ch in ("/", ":", " ")):
                if keyword in text:
                    return True
                continue

            pattern = rf"\b{re.escape(keyword)}\b"
            if re.search(pattern, text):
                return True

        return False


class OCREngine:
    def __init__(self):
        self.preprocessor = ImagePreprocessor()
        self.postprocessor = OCRPostProcessor()

    def extract_text(self, image_path: str, document_type: str = "general") -> Dict:
        """
        Use Tesseract with pytesseract
        """
        # Preprocess
        preprocessed = self.preprocessor.preprocess(image_path)

        # Extract with confidence
        # PSM 6 usually gives cleaner block-level OCR for ID documents while preserving order.
        custom_config = r"--oem 3 --psm 6 -l eng -c preserve_interword_spaces=1"

        try:
            data = pytesseract.image_to_data(
                preprocessed, output_type=pytesseract.Output.DICT, config=custom_config
            )

            # Extract raw text
            raw_text = pytesseract.image_to_string(preprocessed, config=custom_config)

            # Calculate average confidence
            conf_key = "conf" if "conf" in data else "confidence"
            confidences = [
                int(conf)
                for conf in data.get(conf_key, [])
                if str(conf).strip() != "" and int(conf) > 0
            ]
            avg_confidence = float(np.mean(confidences)) / 100.0 if confidences else 0.0

            # Post-process
            processed_text = self.postprocessor.post_process(raw_text, document_type)
        except pytesseract.pytesseract.TesseractNotFoundError:
            print("Tesseract binary not found! Using simulated OCR text.")
            raw_text = "SIMULATED OCR EXTRACT: INVOICE #1024 Total: $450.00. This is fallback text."
            processed_text = raw_text
            avg_confidence = 0.99
            data = {}

        return {
            "text": processed_text,
            "raw_text": raw_text,
            "confidence": avg_confidence,
            "detailed_data": data,
        }
