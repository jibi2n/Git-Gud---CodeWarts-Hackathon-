import sys
from pathlib import Path


SERVICE_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = Path(__file__).resolve().parents[3]

for p in (str(ROOT_DIR), str(SERVICE_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)
