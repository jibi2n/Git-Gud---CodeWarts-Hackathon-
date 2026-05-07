"""
Train LightGBM dropout risk model on synthetic caseload data.
Exports model.pkl (scikit-learn pipeline) and model.onnx (for Node.js inference).
Run: python ml/train_model.py
"""
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path

import lightgbm as lgb
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
from sklearn.pipeline import Pipeline

MODEL_CONFIG = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.05,
    "class_weight": "balanced",
    "random_state": 42,
    "num_leaves": 31,
    "subsample": 0.8,
}

FEATURE_COLS = [
    "attendanceRate30d", "attendanceRate90d", "attendanceTrend",
    "averageGrade", "gradeTrend", "failingSubjects",
    "householdIncomeShock", "parentEmploymentChange",
    "householdSize", "numberOfSiblings", "hasOlderSiblingDropout",
    "ageGradeMismatch", "distanceToSchoolKm", "recentRelocation",
    "monthsIn4Ps", "recentComplianceWarnings",
]


def generate_labels(df):
    """Rule-based synthetic label generation with realistic noise."""
    score = np.zeros(len(df))

    # Attendance crash is the strongest signal
    score += (1 - df["attendanceRate30d"]) * 3.0
    score += np.clip(-df["attendanceTrend"], 0, 1) * 2.0

    # Economic shock
    score += df["householdIncomeShock"].astype(float) * 1.5
    score += df["parentEmploymentChange"].astype(float) * 1.0

    # Family history
    score += df["hasOlderSiblingDropout"].astype(float) * 1.2

    # Academic
    score += (df["failingSubjects"] > 1).astype(float) * 0.8
    score += np.clip(-df["gradeTrend"], 0, 10) * 0.2

    # Structural
    score += (df["ageGradeMismatch"] > 0).astype(float) * 0.6
    score += df["recentRelocation"].astype(float) * 0.7
    score += (df["distanceToSchoolKm"] > 3).astype(float) * 0.4
    score += df["recentComplianceWarnings"] * 0.4

    # Normalize to 0-1 range
    prob = 1 / (1 + np.exp(-score + 3))

    # Add noise (~15% label flips)
    labels = (prob > 0.5).astype(int)
    noise_mask = np.random.rand(len(labels)) < 0.15
    labels[noise_mask] = 1 - labels[noise_mask]

    return labels, prob


def load_data():
    with open("data/synthetic_caseload.json") as f:
        data = json.load(f)

    children = data.get("allChildren") or data.get("flaggedChildren", [])
    records = []
    for child in children:
        feat = child["features"]
        record = {col: feat.get(col, 0) for col in FEATURE_COLS}
        record["id"] = child["id"]
        records.append(record)

    return pd.DataFrame(records)


def main():
    print("Loading data...")
    df = load_data()

    for col in ["householdIncomeShock", "parentEmploymentChange",
                "hasOlderSiblingDropout", "recentRelocation"]:
        df[col] = df[col].astype(float)

    X = df[FEATURE_COLS].values
    labels, probs = generate_labels(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, labels, test_size=0.2, random_state=42, stratify=labels
    )

    print("Training LightGBM model...")
    base_model = lgb.LGBMClassifier(**MODEL_CONFIG)
    calibrated = CalibratedClassifierCV(base_model, method="isotonic", cv=5)
    calibrated.fit(X_train, y_train)

    y_pred = calibrated.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_pred)
    print(f"AUC-ROC: {auc:.3f}")

    Path("ml/artifacts").mkdir(exist_ok=True)
    with open("ml/artifacts/model.pkl", "wb") as f:
        pickle.dump(calibrated, f)
    print("Model saved → ml/artifacts/model.pkl")

    try:
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType
        initial_type = [("float_input", FloatTensorType([None, len(FEATURE_COLS)]))]
        onnx_model = convert_sklearn(calibrated, initial_types=initial_type)
        with open("ml/artifacts/model.onnx", "wb") as f:
            f.write(onnx_model.SerializeToString())
        print("ONNX model saved → ml/artifacts/model.onnx")
    except ImportError:
        print("skl2onnx not installed — ONNX export skipped. Using pre-computed predictions.")

    print(f"Target AUC ≥ 0.85: {'PASS' if auc >= 0.85 else 'REVIEW'}")


if __name__ == "__main__":
    main()
