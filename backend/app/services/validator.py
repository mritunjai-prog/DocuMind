import re
from typing import List, Dict, Any


class DocumentValidator:
    """
    Validates extracted entities and detects potential anomalies
    """

    @staticmethod
    def validate(
        document_type: str, entities: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        anomalies = []

        # Convert entities to a more searchable format
        extracted_data = {}
        for entity in entities:
            label = entity.get("label", "").upper()
            text = entity.get("text", "")
            if label not in extracted_data:
                extracted_data[label] = []
            extracted_data[label].append(text)

        # Build prefix-tolerant lookup so "AMOUNTS" matches "AMOUNT", etc.
        def _has_label(prefix: str) -> bool:
            prefix_up = prefix.upper()
            return any(k.startswith(prefix_up) for k in extracted_data)

        def _get_label_values(prefix: str) -> list:
            prefix_up = prefix.upper()
            result = []
            for k, v in extracted_data.items():
                if k.startswith(prefix_up):
                    result.extend(v)
            return result

        # 1. Document Type Rules
        if document_type.upper() == "INVOICE":
            # Check for missing required fields
            if not _has_label("AMOUNT") and not _has_label("TOTAL"):
                anomalies.append(
                    {
                        "severity": "high",
                        "type": "missing_required_field",
                        "message": "Invoice is missing a Total Amount.",
                    }
                )

            # Pattern Validation / Statistical Amount Checks
            for amount in _get_label_values("AMOUNT") + _get_label_values("TOTAL"):
                clean_amount = re.sub(r"[^\d.]", "", amount)
                try:
                    val = float(clean_amount)
                    if (
                        val > 100000
                    ):  # Arbitrary threshold (can be dynamically parameterized with IQR or Historical Data)
                        anomalies.append(
                            {
                                "severity": "medium",
                                "type": "statistical_outlier",
                                "message": f"Unusually high invoice amount detected: {val}",
                            }
                        )
                except ValueError:
                    anomalies.append(
                        {
                            "severity": "low",
                            "type": "format_error",
                            "message": f"Could not parse amount correctly: {amount}",
                        }
                    )

        elif document_type.upper() == "CONTRACT":
            if not _has_label("DATE") and not _has_label("EFFECTIVE_DATE"):
                anomalies.append(
                    {
                        "severity": "low",
                        "type": "missing_field",
                        "message": "Contract appears to be missing an effective date.",
                    }
                )

        # 2. General Global Rules
        for label, items in extracted_data.items():
            if "EMAIL" in label:
                for email in items:
                    if "@" not in email or "." not in email:
                        anomalies.append(
                            {
                                "severity": "medium",
                                "type": "format_warning",
                                "message": f"Invalid email format detected: {email}",
                            }
                        )

        return anomalies
