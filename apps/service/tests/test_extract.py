import os

from apps.service.extraction.extractor_service import ExtractorService


def test_extract_maps_to_welding_competencies_without_transformers() -> None:
    os.environ["BOSE_DISABLE_TRANSFORMERS"] = "1"
    svc = ExtractorService()
    transcript = (
        "Nung sa shop ako, nagwe-weld ako ng carbon steel plates. "
        "Sinusunod ko talaga yung safety practices at gamit ko PPE. "
        "Kaya ko rin mag-interpret ng drawings at sketches. "
        "Before welding, I prepare weld materials and tools."
    )
    out = svc._keyword_fallback(transcript)
    ids = {c["id"] for c in out}
    assert {"w-01", "w-02", "w-03", "w-04"} & ids
