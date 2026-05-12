"""
Smart calculator module for handling mathematical queries and conversions.
Supports CGPA/GPA conversions, percentage calculations, unit conversions, etc.
Also includes smart document extraction for academic metrics.
"""

import re
from typing import Dict, Any, Optional, Tuple, List


def detect_calculation_query(query: str) -> bool:
    """Detect if the query is asking for a mathematical calculation."""
    calculation_keywords = [
        r"\bgpa\b|\bcgpa\b|\bpercentage\b|\bpercent\b|convert",
        r"\bmarks?\b.*\bpercentage\b|\bpercentage\b.*\bmarks?",
        r"out\s+of|convert.*?to\b|\bhow\s+many\b|\bcalculate\b|\bcompute\b",
        r"\bcalculate.*?gpa\b|\bcgpa\b.*\bcalculate\b",
        r"\bsum\b|\btotal\b|\baverage\b|\bmean\b",
        r"\bmath\b|\bcalc\b|\bcalculation\b",
        r"\bconversion\b|\bconvert\b",
        r"\bpercentage\b.*?\bmarks?\b|\bmarks?.*?\bpercentage\b",
    ]

    query_lower = query.lower()
    for keyword in calculation_keywords:
        if re.search(keyword, query_lower):
            return True
    return False


def calculate_gpa_to_cgpa(
    gpa: float, scale: float = 4.0, cgpa_scale: float = 10.0
) -> float:
    """Convert GPA to CGPA. Default GPA scale is 4.0, CGPA scale is 10.0."""
    try:
        cgpa = (gpa / scale) * cgpa_scale
        return round(cgpa, 2)
    except (ValueError, ZeroDivisionError):
        return None


def calculate_cgpa_to_gpa(
    cgpa: float, cgpa_scale: float = 10.0, gpa_scale: float = 4.0
) -> float:
    """Convert CGPA to GPA. Default CGPA scale is 10.0, GPA scale is 4.0."""
    try:
        gpa = (cgpa / cgpa_scale) * gpa_scale
        return round(gpa, 2)
    except (ValueError, ZeroDivisionError):
        return None


def calculate_percentage_from_marks(obtained_marks: float, total_marks: float) -> float:
    """Calculate percentage from marks."""
    try:
        if total_marks == 0:
            return None
        percentage = (obtained_marks / total_marks) * 100
        return round(percentage, 2)
    except (ValueError, TypeError):
        return None


def calculate_marks_from_percentage(percentage: float, total_marks: float) -> float:
    """Calculate marks from percentage."""
    try:
        marks = (percentage / 100) * total_marks
        return round(marks, 2)
    except (ValueError, TypeError):
        return None


def calculate_cgpa_from_percentage(
    percentage: float, cgpa_scale: float = 10.0
) -> float:
    """Convert percentage to CGPA. Typically: CGPA = Percentage / 10."""
    try:
        cgpa = percentage / 10.0
        return round(cgpa, 2)
    except (ValueError, TypeError):
        return None


def calculate_percentage_from_cgpa(cgpa: float) -> float:
    """Convert CGPA to percentage. Typically: Percentage = CGPA * 10."""
    try:
        percentage = cgpa * 10
        return round(percentage, 2)
    except (ValueError, TypeError):
        return None


def extract_numbers_from_query(query: str) -> list:
    """Extract all numbers from a query string."""
    numbers = re.findall(r"\d+\.?\d*", query)
    return [float(num) for num in numbers]


def calculate_average(numbers: list) -> float:
    """Calculate average of a list of numbers."""
    try:
        if not numbers:
            return None
        return round(sum(numbers) / len(numbers), 2)
    except (ValueError, ZeroDivisionError):
        return None


def calculate_total(numbers: list) -> float:
    """Calculate sum of a list of numbers."""
    try:
        return round(sum(numbers), 2)
    except ValueError:
        return None


def handle_calculation_query(query: str) -> Optional[str]:
    """
    Handle mathematical queries intelligently.
    Returns a formatted answer if calculation is detected and successful.
    """
    query_lower = query.lower()
    numbers = extract_numbers_from_query(query)

    # GPA to CGPA conversion
    if re.search(
        r"(convert|change|transform).*?gpa.*?to.*?cgpa|gpa.*?cgpa", query_lower
    ):
        if numbers and len(numbers) >= 1:
            gpa = numbers[0]
            cgpa = calculate_gpa_to_cgpa(gpa)
            if cgpa is not None:
                return f"GPA {gpa} converts to CGPA {cgpa} (on a 10.0 scale)"

    # CGPA to GPA conversion
    if re.search(
        r"(convert|change|transform).*?cgpa.*?to.*?gpa|cgpa.*?gpa", query_lower
    ):
        if numbers and len(numbers) >= 1:
            cgpa = numbers[0]
            gpa = calculate_cgpa_to_gpa(cgpa)
            if gpa is not None:
                return f"CGPA {cgpa} converts to GPA {gpa} (on a 4.0 scale)"

    # Percentage from marks
    if re.search(
        r"percentage.*?marks?|marks?.*?percentage|(\d+)\s*out\s*of\s*(\d+)", query_lower
    ):
        if numbers and len(numbers) >= 2:
            obtained = numbers[0]
            total = numbers[1]
            percentage = calculate_percentage_from_marks(obtained, total)
            if percentage is not None:
                return f"{obtained} out of {total} marks = {percentage}%"

    # CGPA to Percentage conversion
    if re.search(r"cgpa.*?percentage|percentage.*?cgpa", query_lower):
        if numbers and len(numbers) >= 1:
            if re.search(r"cgpa.*?percentage", query_lower):
                cgpa = numbers[0]
                percentage = calculate_percentage_from_cgpa(cgpa)
                if percentage is not None:
                    return f"CGPA {cgpa} is equivalent to {percentage}%"
            else:
                percentage = numbers[0]
                cgpa = calculate_cgpa_from_percentage(percentage)
                if cgpa is not None:
                    return f"Percentage {percentage}% is equivalent to CGPA {cgpa}"

    # Average calculation
    if re.search(r"average|mean|avg", query_lower) and len(numbers) > 1:
        avg = calculate_average(numbers)
        if avg is not None:
            return f"Average of {numbers} = {avg}"

    # Sum/Total calculation
    if re.search(r"\bsum\b|\btotal\b", query_lower) and len(numbers) > 1:
        total = calculate_total(numbers)
        if total is not None:
            return f"Total of {numbers} = {total}"

    return None


def format_calculation_answer(
    query: str, calculation_result: str, document_context: Optional[str] = None
) -> str:
    """Format the answer to include calculation result and document context if available."""
    answer = f"📊 **Calculation Result:**\n{calculation_result}"

    if document_context:
        answer += f"\n\n📄 **Related Information from Document:**\n{document_context}"

    return answer


def extract_academic_metrics_from_context(context: str) -> Dict[str, Any]:
    """Extract academic metrics (GPA, CGPA, percentage, marks) from document context."""
    metrics = {}

    if not context:
        return metrics

    context_lower = context.lower()

    # Extract CGPA - handles all common resume formats:
    # "CGPA: 8.5", "CGPA 8.5", "cgpa - 8.5", "cgpa=8.5", "CGPA: 8.5/10"
    # "Cumulative GPA: 8.5", "GPA: 8.5/10", "gpa 8.5 out of 10"
    cgpa_patterns = [
        r"(?:cumulative\s+)?cgpa\s*[-:=/]?\s*(\d+\.?\d*)\s*(?:/\s*10|out\s+of\s+10)?",
        r"cumulative\s+gpa\s*[-:=/]?\s*(\d+\.?\d*)",  # "Cumulative GPA: 8.5"
        r"(?:cumulative\s+)?gpa\s*[-:=/]?\s*(\d+\.?\d*)\s*(?:/\s*10|out\s+of\s+10)",  # GPA/10 = CGPA
        r"grade\s+point\s+average\s*[-:=/]?\s*(\d+\.?\d*)",
    ]
    for pat in cgpa_patterns:
        m = re.search(pat, context_lower)
        if m:
            val = float(m.group(1))
            if 0 <= val <= 10:
                metrics["cgpa"] = val
                break

    # Extract GPA (4.0 scale) - only if explicitly "out of 4" or "/4"
    gpa_pattern = r"(?:gpa|score)\s*[-:=/]?\s*(\d+\.?\d*)\s*(?:out\s+of\s+4|/\s*4(?!\.)|4\.0\s+scale)"
    gpa_match = re.search(gpa_pattern, context_lower)
    if gpa_match:
        gpa_val = float(gpa_match.group(1))
        if 0 <= gpa_val <= 4:
            metrics["gpa"] = gpa_val

    # Extract percentage - look for % sign or percentage label
    percentage_pattern = r"(\d+\.?\d*)\s*%|percentage\s*[-:=]?\s*(\d+\.?\d*)"
    percentage_matches = re.finditer(percentage_pattern, context_lower)
    for match in percentage_matches:
        pct = float(match.group(1)) if match.group(1) else float(match.group(2))
        if 0 <= pct <= 100:
            metrics["percentage"] = pct
            break

    # Extract marks (score out of total)
    marks_pattern = r"(?:marks?|score).*?(\d+\.?\d*)\s*(?:out\s*of|/)\s*(\d+\.?\d*)"
    marks_match = re.search(marks_pattern, context)
    if marks_match:
        obtained = float(marks_match.group(1))
        total = float(marks_match.group(2))
        if total > 0:
            metrics["marks"] = {"obtained": obtained, "total": total}

    return metrics


def is_document_extraction_query(query: str) -> bool:
    """Detect if query is asking for information extraction from document."""
    extraction_patterns = [
        r"what\s+is.*?(his|her|their|the)?\s*(cgpa|gpa|percentage|marks?|score)",
        r"(cgpa|gpa|percentage|marks?|score).*?(his|her|their|the|in|of)?",
        r"what.*?(cgpa|gpa|percentage|marks?|score)",
        r"find.*?(cgpa|gpa|percentage|marks?|score)",
        r"(his|her|their|candidate|applicant|student)\s+(cgpa|gpa|percentage|marks?|score)",
        r"tell.*?(cgpa|gpa|percentage|marks?|score)",
        r"show.*?(cgpa|gpa|percentage|marks?|score)",
        r"academic\s+record",
        r"performance\s+metrics",
        r"\b(cgpa|gpa)\b",  # Any mention of cgpa/gpa is likely an extraction query
    ]

    query_lower = query.lower()
    for pattern in extraction_patterns:
        if re.search(pattern, query_lower):
            return True
    return False


def extract_answer_from_context(query: str, context: str) -> Optional[str]:
    """
    Try to extract answer from document context by looking for specific information.
    """
    if not context:
        return None

    query_lower = query.lower()
    metrics = extract_academic_metrics_from_context(context)

    # Check what the user is asking for
    if re.search(r"\bcgpa\b", query_lower) and "cgpa" in metrics:
        cgpa = metrics["cgpa"]
        # Also calculate percentage if we have CGPA
        percentage = calculate_percentage_from_cgpa(cgpa)
        gpa = calculate_cgpa_to_gpa(cgpa) if "gpa" not in metrics else metrics["gpa"]

        answer = f"CGPA: {cgpa}\n"
        answer += f"  - Percentage equivalent: {percentage}%\n"
        answer += f"  - GPA (4.0 scale): {gpa}"
        return answer

    if re.search(r"\bgpa\b", query_lower) and "gpa" in metrics:
        gpa = metrics["gpa"]
        cgpa = calculate_gpa_to_cgpa(gpa)
        percentage = calculate_percentage_from_cgpa(cgpa)

        answer = f"GPA: {gpa}\n"
        answer += f"  - CGPA (10.0 scale): {cgpa}\n"
        answer += f"  - Percentage equivalent: {percentage}%"
        return answer

    if re.search(r"percentage", query_lower) and "percentage" in metrics:
        percentage = metrics["percentage"]
        cgpa = calculate_cgpa_from_percentage(percentage)
        gpa = calculate_cgpa_to_gpa(cgpa)

        answer = f"Percentage: {percentage}%\n"
        answer += f"  - CGPA (10.0 scale): {cgpa}\n"
        answer += f"  - GPA (4.0 scale): {gpa}"
        return answer

    if re.search(r"marks?", query_lower) and "marks" in metrics:
        marks = metrics["marks"]
        percentage = calculate_percentage_from_marks(marks["obtained"], marks["total"])
        cgpa = calculate_cgpa_from_percentage(percentage)

        answer = f"Marks: {marks['obtained']}/{marks['total']}\n"
        answer += f"  - Percentage: {percentage}%\n"
        answer += f"  - CGPA (10.0 scale): {cgpa}"
        return answer

    return None
