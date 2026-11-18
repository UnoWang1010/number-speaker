# 健身動作查詢（擬稿）

純靜態網站，直接用瀏覽器開 `index.html` 即可，不需要伺服器。

## 內容

- 6 個部位 × 10 個動作 = 60 個動作，每個部位依 **器械／滑輪、槓鈴、啞鈴** 分類
- 每個動作：主動肌（紅）／協同肌（淺紅）／穩定肌（橘框）、動作步驟、各階段發力、常見錯誤、參考書目
- 三種查詢方式：
  1. 依部位／器材（可搜尋）
  2. 依肌肉查：點人體圖上的肌肉，列出練到它的動作
  3. 動作模式對照：水平推、垂直拉、髖鉸鏈… → 對應肌群 → 代表動作

| 部位 | 器械 | 槓鈴 | 啞鈴 |
|---|---|---|---|
| 胸部 | 4 | 3 | 3 |
| 背部 | 4 | 3 | 3 |
| 肩部 | 3 | 3 | 4 |
| 腿臀 | 4 | 3 | 3 |
| 手臂 | 3 | 3 | 4 |
| 核心 | 4 | 2 | 4 |

## 檔案

```
index.html
css/style.css
js/muscles.js            肌肉清單 + 正背面人體 SVG（紅色標示訓練肌肉）
js/data.js               動作資料庫（JSON 格式，新增動作改這裡）
js/app.js                畫面邏輯
scripts/generate_images.py   GPT 批次生圖
images/                  放 <動作id>.png（姿勢圖）與 <動作id>.mp4（動畫）
```

## 姿勢圖（GPT 生成）

```bash
pip install openai
export OPENAI_API_KEY=sk-...
python scripts/generate_images.py --dry-run bb_bench   # 先看 prompt
python scripts/generate_images.py bb_bench db_fly      # 先試幾張確認畫風
python scripts/generate_images.py                      # 全部 60 張（已存在會跳過）
```

畫風統一寫在腳本的 `STYLE` 常數，調整後用 `--force` 重生。
圖片放進 `images/` 後網站自動顯示；缺圖時以肌肉圖代替。

## 動畫（ComfyUI，之後再做）

網站已預留位置：`images/<動作id>.mp4` 存在就會自動循環播放。建議流程：

1. 以 GPT 生成的姿勢圖當作「起始畫面」，再生一張「結束姿勢」圖（同畫風、同人物）
2. ComfyUI 使用 image-to-video 模型（如 Wan 2.x I2V，或用首尾幀 FLF2V 工作流）由起始圖補間到結束圖
3. 若動作變形，可加 ControlNet OpenPose：以骨架序列控制關節角度，確保動作正確
4. 輸出 2–3 秒、可循環的短片（起始 → 結束 → 起始），轉成 mp4（H.264、無聲）放進 `images/`

## 參考書目

肌肉發力內容整理自以下教科書的通用觀點（未逐頁引用，正式版建議再對照原書校稿）：

- NSCA, *Essentials of Strength Training and Conditioning*, 4th ed. (2016)
- Delavier, *Strength Training Anatomy*, 3rd ed. (2010)
- Schoenfeld, *Science and Development of Muscle Hypertrophy*, 2nd ed. (2020)
- Rippetoe, *Starting Strength*, 3rd ed. (2011)
- Contreras & Cordoza, *Glute Lab* (2019)
- Neumann, *Kinesiology of the Musculoskeletal System*, 3rd ed. (2017)
- McGill, *Low Back Disorders*, 3rd ed. (2016)
