from typing import Dict, List
from datetime import datetime
import re


class DataValidator:
    async def validate(self, extracted_data: List[Dict], document_type: str) -> Dict:
        """
        Validate extracted fields against business rules
        """
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "confidence_score": 1.0,
        }

        # Convert extracted list to dict for easier lookup
        data_dict = {}
        for entity in extracted_data:
            key = entity.get("entity_type", "").lower()
            if key not in data_dict:
                data_dict[key] = entity.get("text")

        # Type-specific validation
        if document_type == "invoice":
            validation_result = await self._validate_invoice(
                data_dict, validation_result
            )
        elif document_type == "contract":
            validation_result = await self._validate_contract(
                data_dict, validation_result
            )

        return validation_result

    async def _validate_invoice(self, data: Dict[str, str], result: Dict) -> Dict:
        """Invoice-specific validation"""

        # Check required fields
        # Not all invoices might have all these in basic extraction, but applying basic PRD rules
        required_fields = ["invoice_number", "invoice_date", "amount_total"]

        for field in required_fields:
            if field not in data or not data[field]:
                result["errors"].append(f"Missing required field: {field}")
                result["is_valid"] = False

        # Validate date format (trying to parse standard MM/DD/YYYY or similar given from Regex)
        if "invoice_date" in data and data["invoice_date"]:
            date_str = str(data["invoice_date"]).replace("-", "/")
            try:
                # Check simple parts
                parts = date_str.split("/")
                if len(parts) >= 3:
                    year_part = parts[-1]
                    if len(year_part) == 2 or len(year_part) == 4:
                        pass  # naive pass
            except Exception:
                result["errors"].append("Invalid invoice date format")
                result["is_valid"] = False

        # Validate amount is positive
        if "amount_total" in data and data["amount_total"]:
            amount_str = str(data["amount_total"]).replace(",", "")
            try:
                if float(amount_str) <= 0:
                    result["errors"].append("Amount must be positive")
                    result["is_valid"] = False
            except ValueError:
                result["errors"].append("Amount format is invalid")
                result["is_valid"] = False

        return result

    async def _validate_contract(self, data: Dict[str, str], result: Dict) -> Dict:
        """Contract-specific validation"""
        required_fields = ["effective_date", "party_name"]
        for field in required_fields:
            if field not in data or not data[field]:
                result["warnings"].append(f"Missing recommended field: {field}")
        return result


class AnomalyDetector:
    async def detect_anomalies(
        self, extracted_data: List[Dict], document_type: str
    ) -> List[Dict]:
        """
        Detect suspicious patterns using rules
        (In a full ML setup, this would also include Isolation Forest models)
        """
        anomalies = []

        data_dict = {}
        for entity in extracted_data:
            key = entity.get("entity_type", "").lower()
            if key not in data_dict:
                data_dict[key] = entity.get("text")

        if document_type == "invoice":
            # Date anomaly
            if "invoice_date" in data_dict and data_dict["invoice_date"]:
                date_str = str(data_dict["invoice_date"]).replace("-", "/")
                try:
                    parts = date_str.split("/")
                    if len(parts) == 3:
                        year = int(parts[2])
                        if year < 100:
                            year += 2000
                        current_year = datetime.now().year
                        if year > current_year:
                            anomalies.append(
                                {
                                    "type": "FUTURE_DATE",
                                    "severity": "CRITICAL",
                                    "description": "Invoice date appears to be in the future.",
                                    "field": "invoice_date",
                                }
                            )
                except ValueError:
                    pass

            # High amount anomaly - Static threshold for demo (e.g. > $100k)
            if "amount_total" in data_dict and data_dict["amount_total"]:
                amount_str = str(data_dict["amount_total"]).replace(",", "")
                try:
                    amount = float(amount_str)
                    if amount > 100000:
                        anomalies.append(
                            {
                                "type": "HIGH_AMOUNT",
                                "severity": "HIGH",
                                "description": f"Amount ${amount} is unusually high.",
                                "field": "amount_total",
                            }
                        )
                except ValueError:
                    pass

            vendor_name = data_dict.get("vendor_name", "")
            if vendor_name and self._contains_suspicious_text(str(vendor_name)):
                anomalies.append(
                    {
                        "type": "SUSPICIOUS_VENDOR",
                        "severity": "MEDIUM",
                        "description": "Vendor name contains suspicious patterns.",
                        "field": "vendor_name",
                    }
                )

        return anomalies

    def _contains_suspicious_text(self, text: str) -> bool:
        """Check for suspicious patterns"""
        suspicious_patterns = [r"test.*invoice", r"dummy", r"fake", r"spam"]

        for pattern in suspicious_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
