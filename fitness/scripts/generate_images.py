#!/usr/bin/env python3
"""用 OpenAI 圖像模型（GPT）批次生成每個動作的姿勢示意圖。

使用方式：
    pip install openai
    export OPENAI_API_KEY=sk-...
    python scripts/generate_images.py                 # 生成所有缺圖的動作
    python scripts/generate_images.py bb_bench db_fly # 只生成指定動作
    python scripts/generate_images.py --force         # 全部重生
    python scripts/generate_images.py --dry-run       # 只印出 prompt，不呼叫 API

輸出：images/<動作id>.png（網站會自動顯示，缺圖時以肌肉圖代替）
"""
import argparse
import base64
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_JS = ROOT / "js" / "data.js"
MUSCLES_JS = ROOT / "js" / "muscles.js"
OUT_DIR = ROOT / "images"

MODEL = "gpt-image-1"
SIZE = "1024x1024"

# 統一畫風：所有圖片風格一致很重要，修改這段即可整批調整
STYLE = (
    "Clean instructional fitness illustration, flat vector style with soft shading, "
    "a single athletic adult figure in plain dark-gray sportswear, neutral light-gray studio background, "
    "side or three-quarter view chosen so the joint angles are clearly visible, "
    "correct technique and safe posture, anatomically plausible proportions. "
    "The working muscles are shown as semi-transparent anatomical overlays: "
    "primary muscles in saturated red, assisting muscles in light pink. "
    "No text, no labels, no logos, no watermark."
)


def load_data():
    src = DATA_JS.read_text(encoding="utf-8")
    body = src[src.index("{", src.index("window.EXERCISE_DATA")): src.rindex("}") + 1]
    return json.loads(body)


def load_muscle_names():
    src = MUSCLES_JS.read_text(encoding="utf-8")
    return dict(re.findall(r'(\w+):\s*\{\s*zh:\s*"[^"]*",\s*en:\s*"([^"]*)"', src))


def build_prompt(ex, muscles):
    prim = ", ".join(muscles[m] for m in ex["primary"])
    sec = ", ".join(muscles[m] for m in ex["secondary"]) or "none"
    equipment = {"machine": "a gym machine or cable station", "barbell": "a barbell", "dumbbell": "dumbbells"}[ex["eq"]]
    return (
        f"{STYLE}\n\nExercise: {ex['en']} using {equipment}. "
        f"Show the mid-repetition position where the primary muscles are under the most tension. "
        f"Primary muscles highlighted red: {prim}. Assisting muscles light pink: {sec}."
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="只生成這些動作 id")
    ap.add_argument("--force", action="store_true", help="已存在也重生")
    ap.add_argument("--dry-run", action="store_true", help="只印 prompt")
    args = ap.parse_args()

    data = load_data()
    muscles = load_muscle_names()
    exercises = [e for e in data["exercises"] if not args.ids or e["id"] in args.ids]
    OUT_DIR.mkdir(exist_ok=True)

    client = None
    if not args.dry_run:
        from openai import OpenAI
        client = OpenAI()

    for ex in exercises:
        out = OUT_DIR / f"{ex['id']}.png"
        if out.exists() and not args.force:
            print(f"skip  {ex['id']}（已存在）")
            continue
        prompt = build_prompt(ex, muscles)
        if args.dry_run:
            print(f"--- {ex['id']} ---\n{prompt}\n")
            continue
        print(f"gen   {ex['id']} …", flush=True)
        try:
            res = client.images.generate(model=MODEL, prompt=prompt, size=SIZE, n=1)
            out.write_bytes(base64.b64decode(res.data[0].b64_json))
        except Exception as err:  # 單張失敗不中斷整批
            print(f"fail  {ex['id']}: {err}", file=sys.stderr)


if __name__ == "__main__":
    main()
