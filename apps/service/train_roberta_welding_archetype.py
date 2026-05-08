from __future__ import annotations

import argparse
import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def stratified_split(
    rows: list[dict[str, Any]],
    *,
    label_key: str,
    seed: int,
    train_frac: float,
    val_frac: float,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    rng = random.Random(seed)
    by_label: dict[str, list[dict[str, Any]]] = {}
    for r in rows:
        lab = str(r[label_key])
        by_label.setdefault(lab, []).append(r)

    train: list[dict[str, Any]] = []
    val: list[dict[str, Any]] = []
    test: list[dict[str, Any]] = []

    for lab, items in by_label.items():
        rng.shuffle(items)
        n = len(items)
        n_train = max(1, int(round(n * train_frac)))
        n_val = max(1, int(round(n * val_frac)))
        if n_train + n_val >= n:
            n_train = max(1, n - 2)
            n_val = 1
        train.extend(items[:n_train])
        val.extend(items[n_train : n_train + n_val])
        test.extend(items[n_train + n_val :])

    rng.shuffle(train)
    rng.shuffle(val)
    rng.shuffle(test)
    return train, val, test


def macro_f1(*, y_true: list[int], y_pred: list[int], num_labels: int) -> float:
    tp = [0] * num_labels
    fp = [0] * num_labels
    fn = [0] * num_labels
    for t, p in zip(y_true, y_pred):
        if t == p:
            tp[t] += 1
        else:
            fp[p] += 1
            fn[t] += 1

    f1s: list[float] = []
    for k in range(num_labels):
        precision = tp[k] / (tp[k] + fp[k]) if (tp[k] + fp[k]) else 0.0
        recall = tp[k] / (tp[k] + fn[k]) if (tp[k] + fn[k]) else 0.0
        if precision + recall == 0:
            f1s.append(0.0)
        else:
            f1s.append(2 * precision * recall / (precision + recall))
    return sum(f1s) / num_labels if num_labels else 0.0


@dataclass(frozen=True)
class Example:
    text: str
    label: int


def to_examples(rows: list[dict[str, Any]], *, text_key: str, label_key: str, label2id: dict[str, int]) -> list[Example]:
    out: list[Example] = []
    for r in rows:
        text = str(r.get(text_key) or "").strip()
        lab = str(r.get(label_key) or "")
        if not text or lab not in label2id:
            continue
        out.append(Example(text=text, label=label2id[lab]))
    return out


def freeze_roberta_base(model, *, unfreeze_last_n: int) -> None:
    for p in model.roberta.parameters():
        p.requires_grad = False
    if unfreeze_last_n <= 0:
        return
    layers = list(model.roberta.encoder.layer)
    for layer in layers[-unfreeze_last_n:]:
        for p in layer.parameters():
            p.requires_grad = True
    pooler = getattr(model.roberta, "pooler", None)
    if pooler is not None:
        for p in pooler.parameters():
            p.requires_grad = True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--data",
        type=str,
        default=str(Path(__file__).resolve().parent / "data" / "synthetic_tesda_welding_5k.jsonl"),
    )
    ap.add_argument("--model", type=str, default="roberta-base")
    ap.add_argument("--text-key", type=str, default="text")
    ap.add_argument("--label-key", type=str, default="primary_archetype")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--train-frac", type=float, default=0.8)
    ap.add_argument("--val-frac", type=float, default=0.1)
    ap.add_argument("--max-length", type=int, default=192)
    ap.add_argument("--epochs", type=int, default=4)
    ap.add_argument("--batch-size", type=int, default=16)
    ap.add_argument("--lr", type=float, default=2e-5)
    ap.add_argument("--weight-decay", type=float, default=0.01)
    ap.add_argument("--warmup-ratio", type=float, default=0.06)
    ap.add_argument("--grad-accum", type=int, default=1)
    ap.add_argument("--unfreeze-last-n", type=int, default=0)
    ap.add_argument("--sweep", action="store_true")
    ap.add_argument("--sweep-epochs", type=int, default=1)
    ap.add_argument("--output-dir", type=str, default=str(Path(__file__).resolve().parent / "models" / "roberta_welding_archetype"))
    args = ap.parse_args()

    import torch
    from torch.utils.data import Dataset
    from transformers import (
        AutoModelForSequenceClassification,
        AutoTokenizer,
        DataCollatorWithPadding,
        EarlyStoppingCallback,
        Trainer,
        TrainingArguments,
    )

    data_path = Path(args.data)
    rows = load_jsonl(data_path)
    train_rows, val_rows, test_rows = stratified_split(
        rows,
        label_key=args.label_key,
        seed=args.seed,
        train_frac=args.train_frac,
        val_frac=args.val_frac,
    )

    label_values = sorted({str(r[args.label_key]) for r in rows if args.label_key in r})
    label2id = {lab: i for i, lab in enumerate(label_values)}
    id2label = {i: lab for lab, i in label2id.items()}

    train_ex = to_examples(train_rows, text_key=args.text_key, label_key=args.label_key, label2id=label2id)
    val_ex = to_examples(val_rows, text_key=args.text_key, label_key=args.label_key, label2id=label2id)
    test_ex = to_examples(test_rows, text_key=args.text_key, label_key=args.label_key, label2id=label2id)

    tokenizer = AutoTokenizer.from_pretrained(args.model, use_fast=True)

    class WeldingDataset(Dataset):
        def __init__(self, examples: list[Example]):
            self.examples = examples

        def __len__(self) -> int:
            return len(self.examples)

        def __getitem__(self, idx: int) -> dict[str, Any]:
            ex = self.examples[idx]
            enc = tokenizer(ex.text, truncation=True, max_length=args.max_length)
            enc["labels"] = ex.label
            return enc

    collator = DataCollatorWithPadding(tokenizer=tokenizer)

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        preds = logits.argmax(axis=-1)
        y_true = labels.tolist() if hasattr(labels, "tolist") else list(labels)
        y_pred = preds.tolist() if hasattr(preds, "tolist") else list(preds)
        acc = sum(int(t == p) for t, p in zip(y_true, y_pred)) / max(1, len(y_true))
        f1 = macro_f1(y_true=y_true, y_pred=y_pred, num_labels=len(label2id))
        return {"accuracy": acc, "macro_f1": f1}

    def run_once(*, lr: float, epochs: int, output_subdir: str) -> dict[str, float]:
        model = AutoModelForSequenceClassification.from_pretrained(
            args.model,
            num_labels=len(label2id),
            id2label=id2label,
            label2id=label2id,
        )

        if args.unfreeze_last_n >= 0:
            freeze_roberta_base(model, unfreeze_last_n=args.unfreeze_last_n)

        steps_per_epoch = math.ceil(len(train_ex) / max(1, args.batch_size))
        total_steps = max(1, steps_per_epoch * epochs)
        warmup_steps = int(round(total_steps * args.warmup_ratio))

        targs = TrainingArguments(
            output_dir=str(Path(args.output_dir) / output_subdir),
            per_device_train_batch_size=args.batch_size,
            per_device_eval_batch_size=args.batch_size,
            learning_rate=lr,
            num_train_epochs=epochs,
            weight_decay=args.weight_decay,
            warmup_steps=warmup_steps,
            gradient_accumulation_steps=max(1, args.grad_accum),
            eval_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            metric_for_best_model="macro_f1",
            greater_is_better=True,
            save_total_limit=1,
            logging_steps=max(10, total_steps // 20),
            report_to=[],
            fp16=bool(torch.cuda.is_available()),
        )

        trainer = Trainer(
            model=model,
            args=targs,
            train_dataset=WeldingDataset(train_ex),
            eval_dataset=WeldingDataset(val_ex),
            data_collator=collator,
            compute_metrics=compute_metrics,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
        )

        trainer.train()
        val_metrics = trainer.evaluate()
        test_metrics = trainer.evaluate(eval_dataset=WeldingDataset(test_ex))
        trainer.save_model(str(Path(args.output_dir) / "best"))

        out = {
            "val_accuracy": float(val_metrics.get("eval_accuracy", 0.0)),
            "val_macro_f1": float(val_metrics.get("eval_macro_f1", 0.0)),
            "test_accuracy": float(test_metrics.get("eval_accuracy", 0.0)),
            "test_macro_f1": float(test_metrics.get("eval_macro_f1", 0.0)),
        }
        return out

    best_lr = args.lr
    if args.sweep:
        candidates = [1e-5, 2e-5, 3e-5, 5e-5]
        scored: list[tuple[float, float]] = []
        for lr in candidates:
            m = run_once(lr=lr, epochs=args.sweep_epochs, output_subdir=f"sweep_lr_{lr:g}")
            scored.append((lr, m["val_macro_f1"]))
            print(json.dumps({"phase": "sweep", "lr": lr, **m}, ensure_ascii=False))
        best_lr, _ = max(scored, key=lambda x: x[1])

    metrics = run_once(lr=best_lr, epochs=args.epochs, output_subdir="final")
    print(json.dumps({"phase": "final", "lr": best_lr, **metrics}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
