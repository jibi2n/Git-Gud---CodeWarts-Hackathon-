from __future__ import annotations

import argparse
import datetime as dt
import json
import random
import re
from pathlib import Path


def pick_language(rng: random.Random) -> str:
    x = rng.random()
    if x < 0.4:
        return "taglish"
    if x < 0.7:
        return "tl"
    return "en"


def maybe_noise(rng: random.Random, s: str) -> str:
    if rng.random() < 0.2:
        w = s.split(" ")
        if len(w) > 8:
            i = rng.randint(2, min(10, len(w) - 2))
            w.insert(i, w[i])
            s = " ".join(w)
    if rng.random() < 0.25:
        s = s.replace(",", "")
    if rng.random() < 0.12:
        s = re.sub(r"\s+", " ", s).strip()
    return s


def competencies_for(rng: random.Random, role_key: str, processes: list[str]) -> list[str]:
    comps: set[str] = {
        "safety_ppe",
        "measurement_layout",
        "cutting_grinding",
        "inspection_qc",
    }

    if rng.random() < 0.6:
        comps.add("blueprint_reading")
    if rng.random() < 0.35:
        comps.add("teamwork")

    if "SMAW" in processes:
        comps.add("smaw")
    if "GMAW" in processes:
        comps.add("gmaw")
    if "GTAW" in processes:
        comps.add("gtaw")
    if "FCAW" in processes:
        comps.add("fcaw")

    if role_key in ("pipeline_welder", "underwater_welder"):
        comps.add("pipe_welding")
    if rng.random() < 0.7:
        comps.add("weld_positions")

    return sorted(comps)


def mk_story(
    rng: random.Random,
    *,
    language: str,
    role_key: str,
    processes: list[str],
    materials: list[str],
    positions: list[str],
    city: str,
    province: str,
    cert: str | None,
) -> str:
    years = rng.choice([1, 2, 3, 4, 5, 6, 7, 8, 10, 12])
    shift = rng.choice(["day shift", "night shift", "OT minsan", "graveyard"])
    site = rng.choice(["construction site", "shop", "plant", "shipyard", "project site"])

    proc_phrase = ", ".join(rng.sample(processes, k=min(len(processes), rng.randint(1, 2))))
    mat_phrase = rng.choice(materials)
    pos_phrase = rng.choice(positions)

    if language == "en":
        parts = [
            f"I’ve been working as a {role_key.replace('_', ' ')} for about {years} years in {city}, {province}.",
            f"On site we do {proc_phrase} on {mat_phrase}, mostly {pos_phrase} positions, and I help with fit-up and basic QC.",
            "I follow PPE and safety checks, and I can read basic drawings and do measurements before welding.",
        ]
        if cert:
            parts.append(f"For credentials, I’m familiar with {cert} requirements and weld testing.")
        if rng.random() < 0.35:
            parts.append(f"I’m usually on {shift} at the {site}.")
        s = " ".join(parts)
        if rng.random() < 0.35:
            s = s.replace("I ", rng.choice(["So I ", "Basically I ", "Honestly I "]), 1)
        return maybe_noise(rng, s)

    if language == "tl":
        parts = [
            f"Mga {years} taon na akong {role_key.replace('_', ' ')} sa {city}, {province}.",
            f"Gumagawa kami ng {proc_phrase} sa {mat_phrase}, kadalasan {pos_phrase}, tapos ako din sa fit-up at simpleng inspection.",
            "Masinop ako sa PPE at safety, marunong magbasa ng drawing, at maayos mag-measure bago mag-weld.",
        ]
        if cert:
            parts.append(f"May idea ako sa requirements ng {cert} at weld test.")
        if rng.random() < 0.35:
            parts.append(f"Madalas {shift} sa {site}.")
        s = " ".join(parts)
        if rng.random() < 0.35:
            s = s.replace("tapos", rng.choice(["then", "tsaka", "tapos"]), 1)
        return maybe_noise(rng, s)

    parts = [
        f"Mga {years} years na ako sa welding, {role_key.replace('_', ' ')} sa {city} {province}.",
        f"Sa work namin, {proc_phrase} sa {mat_phrase}, usually {pos_phrase}, then fit-up and basic QC ako din.",
        "Safety first ako, PPE always, marunong magbasa ng drawing at mag-measure bago mag-weld.",
    ]
    if cert:
        parts.append(f"Familiar din ako sa {cert} test requirements.")
    if rng.random() < 0.35:
        parts.append(f"Usually {shift} sa {site}.")
    s = " ".join(parts)
    if rng.random() < 0.6:
        s = s.replace("usually", rng.choice(["usually", "madalas", "usually talaga"]), 1)
    if rng.random() < 0.4:
        s = s.replace("then", rng.choice(["tapos", "then", "tsaka"]), 1)
    if rng.random() < 0.25:
        s = s + " " + rng.choice(["ano", "kumbaga", "parang", "tapos", "ganun", "mismo", "kasi", "syempre"]) + "."
    return maybe_noise(rng, s)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", type=int, default=5000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument(
        "--out",
        type=str,
        default=str(Path(__file__).resolve().parent / "data" / "synthetic_tesda_welding_5k.jsonl"),
    )
    args = ap.parse_args()

    rng = random.Random(args.seed)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    roles: list[tuple[str, list[str], list[str], list[str]]] = [
        ("structural_welder", ["SMAW", "FCAW"], ["steel beams", "columns", "plates"], ["3G", "4G"]),
        ("pipeline_welder", ["SMAW", "GTAW"], ["pipes", "spools"], ["5G", "6G"]),
        ("fabrication_welder", ["GMAW", "SMAW", "GTAW"], ["frames", "railings", "brackets"], ["2G", "3G"]),
        ("shipyard_welder", ["SMAW", "FCAW"], ["ship hull", "bulkhead", "deck"], ["3G", "4G"]),
        ("maintenance_welder", ["SMAW", "GMAW"], ["repairs", "patch plates", "supports"], ["2G", "3G"]),
        ("underwater_welder", ["SMAW"], ["marine structures", "piles"], ["wet welding"]),
    ]

    locs = [
        ("Quezon City", "NCR"),
        ("Caloocan", "NCR"),
        ("Manila", "NCR"),
        ("Makati", "NCR"),
        ("Pasig", "NCR"),
        ("Cebu City", "Cebu"),
        ("Davao City", "Davao del Sur"),
        ("Iloilo City", "Iloilo"),
        ("Baguio", "Benguet"),
        ("Batangas City", "Batangas"),
        ("San Fernando", "Pampanga"),
        ("Cagayan de Oro", "Misamis Oriental"),
    ]

    certs = ["TESDA SMAW NC II", "AWS D1.1", "API 1104", "ASME Section IX"]

    created = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    with out_path.open("w", encoding="utf-8") as f:
        for i in range(args.rows):
            role_key, processes, materials, positions = rng.choice(roles)
            city, province = rng.choice(locs)
            language = pick_language(rng)
            comp_ids = competencies_for(rng, role_key, processes)
            cert = rng.choice(certs) if rng.random() < 0.45 else None
            text = mk_story(
                rng,
                language=language,
                role_key=role_key,
                processes=processes,
                materials=materials,
                positions=positions,
                city=city,
                province=province,
                cert=cert,
            )

            row = {
                "id": f"synth_weld_{i:05d}",
                "tesda_category": "welding",
                "track_id": "tesda_smaw_demo",
                "language": language,
                "primary_archetype": role_key,
                "location_city": city,
                "location_province": province,
                "competency_ids": comp_ids,
                "text": text,
                "source": "synthetic_v1",
                "created_utc": created,
            }
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    print(str(out_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
