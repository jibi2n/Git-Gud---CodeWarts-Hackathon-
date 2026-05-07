from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


_SPLIT_RE = re.compile(r"[.!?。\n]+")


class ExtractorService:
    def __init__(self):
        track_path = Path(__file__).resolve().parents[1] / "tesda" / "welding_smaw.json"
        raw = json.loads(track_path.read_text(encoding="utf-8"))
        self.track_id: str = str(raw.get("track_id") or "unknown")
        self.track_name: str = str(raw.get("name") or "").strip()
        self.catalog: list[dict[str, Any]] = list(raw.get("competencies") or [])

    def _segments(self, text: str) -> list[str]:
        segs = [s.strip() for s in _SPLIT_RE.split(text) if s.strip()]
        return segs[:40] if len(segs) > 40 else segs

    @staticmethod
    def _transformers_enabled() -> bool:
        return os.getenv("BOSE_DISABLE_TRANSFORMERS", "").strip().lower() not in {
            "1",
            "true",
            "yes",
        }

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_model():
        import torch
        from transformers import AutoModel, AutoTokenizer

        tokenizer = AutoTokenizer.from_pretrained("xlm-roberta-base")
        model = AutoModel.from_pretrained("xlm-roberta-base")
        model.eval()
        return torch, tokenizer, model

    @staticmethod
    def _mean_pool(last_hidden_state, attention_mask):
        mask = attention_mask.unsqueeze(-1).to(last_hidden_state.dtype)
        masked = last_hidden_state * mask
        summed = masked.sum(dim=1)
        denom = mask.sum(dim=1).clamp(min=1e-9)
        return summed / denom

    def _embed(self, texts: list[str]):
        torch, tokenizer, model = self._load_model()
        encoded = tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt",
        )
        with torch.no_grad():
            out = model(**encoded)
        pooled = self._mean_pool(out.last_hidden_state, encoded["attention_mask"])
        return torch.nn.functional.normalize(pooled, p=2, dim=1)

    def _keyword_fallback(self, transcript: str) -> list[dict[str, Any]]:
        t = transcript.lower()
        segs = self._segments(transcript)
        out: list[dict[str, Any]] = []

        for comp in self.catalog:
            cid = str(comp.get("id") or "").strip()
            label = str(comp.get("label") or "").strip()
            if not cid or not label:
                continue
            if "weld" in t or "hinang" in t:
                if cid == "w-01" and ("plate" in t or "plato" in t or "steel" in t or "carbon" in t):
                    ev = next((s for s in segs if "weld" in s.lower() or "hinang" in s.lower()), segs[0] if segs else None)
                    out.append(
                        {
                            "id": cid,
                            "taglish_label": "Pagwe-welding ng plates",
                            "english_label": label,
                            "confidence": 0.65,
                            "evidence_span": ev,
                        }
                    )
                if cid == "w-02" and ("safety" in t or "ppe" in t or "mask" in t):
                    ev = next((s for s in segs if "safety" in s.lower() or "ppe" in s.lower() or "mask" in s.lower()), segs[0] if segs else None)
                    out.append(
                        {
                            "id": cid,
                            "taglish_label": "Safety practices sa welding",
                            "english_label": label,
                            "confidence": 0.6,
                            "evidence_span": ev,
                        }
                    )
                if cid == "w-03" and ("drawing" in t or "sketch" in t or "blueprint" in t):
                    ev = next((s for s in segs if "drawing" in s.lower() or "sketch" in s.lower() or "blueprint" in s.lower()), segs[0] if segs else None)
                    out.append(
                        {
                            "id": cid,
                            "taglish_label": "Pagbasa ng drawings/sketch",
                            "english_label": label,
                            "confidence": 0.6,
                            "evidence_span": ev,
                        }
                    )
                if cid == "w-04" and ("prepare" in t or "materials" in t or "tools" in t):
                    ev = next((s for s in segs if "prepare" in s.lower() or "materials" in s.lower() or "tools" in s.lower()), segs[0] if segs else None)
                    out.append(
                        {
                            "id": cid,
                            "taglish_label": "Pag-prepare ng welding materials",
                            "english_label": label,
                            "confidence": 0.58,
                            "evidence_span": ev,
                        }
                    )

        seen: set[str] = set()
        uniq: list[dict[str, Any]] = []
        for item in out:
            if item["id"] in seen:
                continue
            seen.add(item["id"])
            uniq.append(item)
        return uniq

    async def extract_from_text(self, transcript: str) -> list[dict[str, Any]]:
        if not transcript.strip():
            return []

        segs = self._segments(transcript)
        if not segs:
            return []

        if not self._transformers_enabled():
            return self._keyword_fallback(transcript)

        try:
            label_texts: list[str] = []
            ids: list[str] = []
            labels: list[str] = []
            for comp in self.catalog:
                cid = str(comp.get("id") or "").strip()
                label = str(comp.get("label") or "").strip()
                if cid and label:
                    ids.append(cid)
                    labels.append(label)
                    label_texts.append(f"{self.track_name} {label}")

            if not ids:
                return []

            label_vecs = self._embed(label_texts)
            seg_vecs = self._embed(segs)
            sims = label_vecs @ seg_vecs.T
            best_sim, best_idx = sims.max(dim=1)

            threshold = 0.34
            out: list[dict[str, Any]] = []
            for i, cid in enumerate(ids):
                sim = float(best_sim[i].item())
                if sim < threshold:
                    continue
                seg = segs[int(best_idx[i].item())]
                conf = max(
                    0.0, min(1.0, (sim - threshold) / max(1e-6, 1.0 - threshold))
                )
                out.append(
                    {
                        "id": cid,
                        "taglish_label": labels[i],
                        "english_label": labels[i],
                        "confidence": conf,
                        "evidence_span": seg,
                    }
                )

            return out if out else self._keyword_fallback(transcript)
        except Exception:
            return self._keyword_fallback(transcript)
