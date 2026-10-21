---
name: create-news-video
description: Tạo video tin tức ngắn 9:16 (~60s) từ URL bài báo hoặc file .txt tiếng Việt. Trigger khi user yêu cầu tạo video tin tức, làm short news, làm bản tin video, render tin thành video, làm TikTok tin tức. Output: video.mp4 + voice.mp3 + script.txt cho CapCut.
---

# Create News Video Skill

Generate a Vietnamese 9:16 motion-graphic news video from a URL or .txt file.

## Input

Single argument: a news article URL (starts with `http://` or `https://`) OR a path to a `.txt` file.

## Workflow (MUST follow these steps in order)

### Step 1: Detect input type

- Starts with `http://` or `https://` → URL mode
- Otherwise → file mode

### Step 2: Fetch content

**URL mode:**
- Use `WebFetch` with prompt:
  ```
  Trích xuất từ trang này:
  - title (string): tiêu đề bài báo
  - content (string): nội dung chính, ~500-1500 từ
  - ogImage (string|null): URL ảnh og:image (meta og:image hoặc ảnh đầu bài)
  - domain (string): domain của URL (vd "github.com")
  Trả về JSON với 4 field trên.
  ```
- If WebFetch fails (paywall, JS-rendered, 4xx) → tell user to save content to a .txt file and pass that instead. Stop.

**File mode:**
- Use `Read` to read the .txt file
- Title = first non-empty line (strip whitespace, max 80 chars)
- Content = remaining lines joined
- ogImage = `null`
- domain = `"local"`

### Step 3: Create slug + output directory

- slug = lowercase ASCII (strip Vietnamese diacritics, đ→d), replace non-alphanumeric with `-`, trim dashes, max 40 chars
- timestamp = current local time as `YYYYMMDD-HHmm`
- outputDir = `output/<slug>-<timestamp>/`
- Use Bash: `mkdir -p <outputDir>`

### Step 4: Generate script.json

Source of truth for the schema is `src/render/script-schema.ts` (the design doc in `docs/` is background only — its old `visual` schema is obsolete). Key rules:

**Script content (Vietnamese):**
- Total voiceText: ~150–200 words → ~55–65s spoken at speed 1.0
- Number of scenes: **5–8** (1 hook + 3–6 body + 1 outro)
- Each scene voiceText is 1-3 short sentences, văn nói (spoken style, not formal)
- No emoji, no markdown in voiceText

### ⚠️ CRITICAL: Vietnamese TTS Phonetic Rules

The `voiceText` field is read aloud by Edge TTS / CIT Voice Studio / LucyLab / ElevenLabs / Vbee. **Numbers and symbols are read literally** — if you write "5.5", TTS may say "năm rưỡi" (five and a half — WRONG for version numbers). **Always spell out numbers in Vietnamese phonetic form** in `voiceText`. The `templateData` fields (visual text on screen) can keep the original "5.5" / "82.7%" formatting.

**Mandatory rules for `voiceText`:**

| Number form | WRONG (TTS misreads) | RIGHT (spell out in Vietnamese) |
|---|---|---|
| Decimal version | `GPT 5.5` → "năm rưỡi" ❌ | `GPT năm chấm năm` ✅ |
| Decimal stat | `82.7%` | `tám mươi hai phẩy bảy phần trăm` |
| Version | `iPhone 17` | `iPhone mười bảy` (or `iPhone 17` works for whole numbers) |
| Version with point | `iOS 18.2` | `iOS mười tám chấm hai` |
| Tech spec | `200MP` | `hai trăm megapixel` |
| Battery | `5000mAh` | `năm nghìn miliampe giờ` |
| Tokens | `1M tokens` / `1000000 tokens` | `một triệu token` |
| Price VND | `21 triệu đồng` | `hai mươi mốt triệu đồng` |
| Price USD | `$5` | `năm đô la` (or `năm đô`) |
| Multiplier | `2x` | `gấp đôi` (more natural than "hai lần") |
| Year | `2026` | `hai nghìn không trăm hai mươi sáu` (or just `năm 2026` reads OK) |
| Percentage with decimal | `30%` | `ba mươi phần trăm` |
| Time | `60 giây` | `sáu mươi giây` |
| Frequency | `5G` | `năm gờ` (be careful — TTS often says "năm-gờ") |
| Channel name | `DuyNQ` / `DuyNQ` | `Cường ai ti` |

**Notation choices:**
- For decimal point use `chấm` (more spoken/natural) or `phẩy` (formal). Both work; pick consistent.
- For comma separator, use `phẩy` (e.g. "1,000" → "một nghìn")
- For ratio "3:1" → say `ba trên một` or `ba so với một`

**English brand names — keep as-is**, TTS handles them OK:
- `Apple`, `Google`, `OpenAI`, `Microsoft`, `TikTok`, `YouTube` ✅

**English acronyms — write phonetically if TTS misreads:**
- `AI` → write `ây ai`
- `API` → write `ây pi ai`
- `GPT` → usually OK; if not, write `gí pi tí`
- `iOS` → write `ai ô ét` if matter

**Symbols to AVOID in voiceText:**
- `→` `&` `%` `$` `#` `+` `=` (TTS may say literal name or skip)
- `!` `?` at end of sentence is OK — they create natural intonation
- Emoji: NEVER (TTS pronounces or skips inconsistently)
- URLs: NEVER (TTS reads dot/slash literally)

**End each `voiceText` sentence with `.` or `?`** for natural pause/intonation.

**Examples — full scene:**

WRONG (will sound bad):
```json
{ "voiceText": "GPT 5.5 đạt 82.7% trên Terminal-Bench, vượt GPT 5.4 (75.1%)." }
```
→ TTS reads: "GPT năm rưỡi đạt tám mươi hai chấm bảy phần trăm trên Terminal-Bench..."

RIGHT (natural):
```json
{ "voiceText": "GPT năm chấm năm đạt tám mươi hai phẩy bảy phần trăm trên Terminal Bench, vượt phiên bản năm chấm bốn ở mức bảy mươi lăm phẩy một." }
```

**Note**: `templateData` (text on screen) CAN use original formatting — the visual is separate from spoken:
```json
{
  "voiceText": "GPT năm chấm năm đạt tám mươi hai phẩy bảy phần trăm.",
  "templateData": {
    "template": "stat-hero",
    "value": "82.7%",                 ← Visual: keep readable formatting
    "label": "Terminal-Bench"
  }
}
```

**Hook (most important — gets first 3 seconds of viewer attention):**
- Must contain a claim, statistic, or curious question
- NEVER generic ("Hôm nay chúng ta sẽ nói về..." is wrong)
- Visual: `templateData.template = "hook"`, `headline` (≤40 chars), optional `subhead` (≤40)
- If `metadata.source.image` is set, add `"bgSrc": "$source.image"` (literal — pipeline substitutes). Omit it when there is no image.

**Visual schema (source of truth: `src/render/script-schema.ts`)**

Every scene carries `templateData` (NOT `visual`). Pick exactly one template:

| template | Fields (limits) | Use when |
|---|---|---|
| `hook` | `headline` ≤40, `subhead` ≤40 (opt), `bgSrc` (opt), `kenBurns`: `zoom-in`/`zoom-out`/`pan-left`/`pan-right` | First scene |
| `comparison` | `left`/`right`: `{ label ≤30, value ≤20, color: "cyan" or "purple" }`; `right.winner` (opt bool) | X vs Y |
| `stat-hero` | `value` ≤20, `label` ≤40, `context` ≤50 (opt) | Key number / % |
| `feature-list` | `title` ≤40, `bullets` ≤4 items (each ≤50), `icon` (opt) | Feature list |
| `callout` | `statement` ≤80, `tag` ≤20 (opt) | Statement / warning |
| `outro` | `ctaTop` ≤30, `channelName` ≤30, `source` ≤40 | Last scene (required) |

Rules:
- There are no `lines`, `effects`, `animation`, `emphasis`, `background`, or `overlay` fields — do not emit them.
- Vary `hook.kenBurns` across videos; default is `zoom-in`.
- Only the `hook` template supports a background image. Other templates use the theme background.

**Outro (always fixed format):**
```json
{
  "id": "outro",
  "type": "outro",
  "voiceText": "Theo dõi DuyNQ để xem bản tin mới mỗi ngày.",
  "templateData": {
    "template": "outro",
    "ctaTop": "Xem bản tin mới mỗi ngày",
    "channelName": "DuyNQ",
    "source": "<DOMAIN>"
  }
}
```
Replace `<DOMAIN>` with the actual domain string.

**Voice config:** the actual provider comes from `TTS_PROVIDER` in `.env.local`; `voice.provider` is informational (the pipeline warns if they differ). `voice.voiceId` overrides the env default for the active provider. `voice.speed` (0.5–2.0) is passed to the TTS provider.

### Step 5: Self-validate before writing

Check:
- Total voiceText ~150-200 words
- 5-8 scenes; `scenes[0].type === "hook"`; last scene `type === "outro"`
- Every scene has `templateData` with a valid `template` and all required fields
- Every length limit in the table above is respected
- `comparison` colors only `cyan`/`purple`; `hook.kenBurns` is one of the 4 allowed values
- No legacy fields: `visual`, `background`, `text`, `lines`, `effects`, `animation`, `emphasis`

If invalid, fix yourself silently. Up to 2 self-correction passes. After that, write anyway — the CLI's Zod validation will produce a precise error message that the user can act on.

### Step 6: Write script.json

Use the Write tool (not Bash) to write the validated JSON to `<outputDir>/script.json`.

### Step 7: Run the pipeline

Use Bash, **foreground** (not background), stream output:

```bash
npm run pipeline -- <outputDir>/script.json
```

If exit code != 0:
- Report the error message clearly
- Tell user the output dir path so they can inspect intermediate files

### Step 8: Generate TikTok caption + hashtags

Only run this step if Step 7 (the pipeline) succeeded — don't caption a video that wasn't actually produced.

Write a short Vietnamese caption + exactly 4 hashtags for the video, based on `script.metadata.title` and the scenes' content (same topic understanding used to write the script — no new research needed).

**Caption rules:**
- 1 short, punchy line (~10–20 words), Vietnamese, văn nói.
- Reuse or riff on the hook's claim/question — the caption is what gets someone to tap play, so it should carry the same curiosity/stat hook, not restate the title flatly.
- Unlike `voiceText`, the caption is written text (not read by TTS) — 1 emoji is OK if it fits naturally, but don't force one in.
- No markdown, no line breaks inside the caption itself.

**Hashtag rules — exactly 4, in this order:**
1. One broad tech/niche tag in Vietnamese (e.g. `#congnghe`, `#thutthuat`)
2. One or two tags specific to the video's actual topic/product/company (e.g. `#openai`, `#ai`, `#pdf`, `#codegraph` — derive from the subject, don't reuse the same generic tag twice)
3. One channel/discovery tag: `#duynq` (and `#fyp` or `#xuhuong` if there's room — still capped at 4 total)
- Lowercase, no spaces, no punctuation inside a tag.
- Skip hashtags that don't genuinely fit the topic just to hit the count differently — 4 relevant tags beats 4 generic ones.

Write the result to `<outputDir>/caption.txt` using the Write tool, formatted as:
```
<caption line>

#tag1 #tag2 #tag3 #tag4
```

### Step 9: Report success

If successful, report to user with markdown links:

```markdown
✓ Video:   [video.mp4](output/<slug>-<timestamp>/video.mp4)
✓ Audio:   [voice.mp3](output/<slug>-<timestamp>/voice.mp3) — for CapCut
✓ Script:  [script.txt](output/<slug>-<timestamp>/script.txt) — for CapCut auto-caption
✓ Caption: [caption.txt](output/<slug>-<timestamp>/caption.txt) — for TikTok upload
Tổng thời lượng: XX.Xs

<caption line>
#tag1 #tag2 #tag3 #tag4
```

## Examples

### Example 1: URL with image (GitHub)

User: `/create-news-video https://github.com/DuyNQ/ai-video-studio`

Generated `script.json` (excerpt):
```json
{
  "version": "1.0",
  "metadata": {
    "title": "Apple ra mắt iPhone 17 với camera 200MP",
    "source": {
      "url": "https://github.com/DuyNQ/ai-video-studio",
      "domain": "github.com",
      "image": "https://opengraph.githubassets.com/1/DuyNQ/ai-video-studio"
    },
    "channel": "DuyNQ"
  },
  "voice": { "provider": "lucylab", "voiceId": "${VIETNAMESE_VOICEID}", "speed": 1.0 },
  "scenes": [
    {
      "id": "hook", "type": "hook",
      "voiceText": "Apple vừa ra mắt iPhone 17 với camera hai trăm megapixel.",
      "templateData": {
        "template": "hook",
        "headline": "iPhone 17",
        "subhead": "Camera 200MP!",
        "bgSrc": "$source.image",
        "kenBurns": "zoom-in"
      }
    },
    {
      "id": "body-1", "type": "body",
      "voiceText": "Máy dùng cảm biến hoàn toàn mới với zoom quang gấp mười lần.",
      "templateData": {
        "template": "stat-hero",
        "value": "200MP",
        "label": "Cảm biến mới",
        "context": "Zoom quang 10x"
      }
    }
    /* ... 1-4 more body scenes (comparison / feature-list / callout) + outro ... */
  ]
}
```

### Example 2: .txt file with no image (local)

User: `/create-news-video news/agi-update.txt`

Generated `script.json` (excerpt):
```json
{
  "metadata": {
    "title": "OpenAI công bố mô hình mới với khả năng lập luận",
    "source": { "url": "local", "domain": "local", "image": null },
    "channel": "DuyNQ"
  },
  "scenes": [
    {
      "id": "hook", "type": "hook",
      "voiceText": "OpenAI vừa công bố mô hình mới có khả năng lập luận như con người.",
      "templateData": {
        "template": "hook",
        "headline": "Mô hình mới",
        "subhead": "Lập luận như người"
      }
    }
    /* ... body scenes + outro (source = "local") ... */
  ]
}
```
Note: when `source.image` is null, omit `bgSrc` — the hook falls back to the theme gradient automatically.

## Sound Effects (SFX)

**The SFX library is not bundled.** Populate it once with `npm run sfx:download && npm run sfx:filter` (writes `assets/sfx/`). Without it the pipeline logs a warning per scene and renders without SFX.

**You almost never need to set the `sfx` field.** The pipeline has a smart 3-tier selector that picks the right SFX for each scene automatically:

1. **If `scene.sfx` is set** → use exactly that (override).
2. **Else, scan `voiceText` for semantic keywords**:
   - `cảnh báo / rủi ro / nguy hiểm / warning` → `alert/`
   - `kỷ lục / vượt / xuất sắc / breakthrough / success` → `success/`
   - `thất bại / sai / lỗi / fail / wrong` → `fail/`
   - `ra mắt / công bố / lần đầu / launch / unveil` → `reveal/`
   - `đếm ngược / tích tắc / countdown` → `countdown/`
   - `hùng vĩ / hoành tráng / cinematic / epic` → `cinematic/`
   - `hồi hộp / chờ đợi / drumroll / suspense` → `drumroll/`
3. **Else, fall back to template default category**:
   - `hook` → `transition/` or `cinematic/`
   - `comparison` → `transition/` or `emphasis/`
   - `stat-hero` → `emphasis/` or `success/`
   - `feature-list` → `transition/` or `emphasis/`
   - `callout` → `alert/` or `drumroll/`
   - `outro` → `outro/` or `success/`

Within a category, the actual file is picked **deterministically** by hashing the scene id — same script gives same SFX (idempotent), but different scenes in the same video get different files (variety).

**This means:** in 95% of cases you should OMIT the `sfx` field entirely. Just write good Vietnamese voiceText with natural keywords (warning, breakthrough, launch, etc.) and the pipeline will pick the right sound.

### When to add explicit `sfx` override

Only when you want to FORCE a specific sound that the keyword matcher won't infer:
- Scene needs a particular signature sound (e.g., always a gong on important scenes)
- Disable SFX for a particular scene: `"sfx": { "name": "none" }`
- Use a specific file: `"sfx": { "name": "transition/whoosh-sfx", "volume": 0.4 }`

Example (rarely needed):
```json
{
  "id": "body-3",
  "voiceText": "...",
  "templateData": { ... },
  "sfx": { "name": "drumroll/snare-roll", "volume": 0.5, "startOffsetSec": 0.2 }
}
```

The pipeline auto-mixes a sound effect at each scene start based on the template type:

| Template | Default SFX | Sound character |
|---|---|---|
| `hook` | `transition/whoosh-soft` | Dramatic entrance |
| `comparison` | `transition/swoosh` | Side-by-side reveal |
| `stat-hero` | `emphasis/ding` | Number reveal |
| `feature-list` | `transition/pop` | Bullet appearance |
| `callout` | `alert/notification` | Important info |
| `outro` | `outro/tada` | Ending signature |

**You usually do NOT need to add a `sfx` field** — defaults work for 95% of cases.

**ONLY add an explicit `sfx` override when content STRONGLY suggests a different mood:**

| Content cue (in voiceText) | Override |
|---|---|
| "cảnh báo", "rủi ro", "đáng lo", "nguy hiểm" | `{ "name": "alert/notification", "volume": 0.4 }` |
| "vượt", "kỷ lục", "xuất sắc", "tăng mạnh" (positive stat) | `{ "name": "emphasis/chime", "volume": 0.35 }` |
| Want to disable SFX for this scene | `{ "name": "none" }` |

Place `sfx` at the same level as `voiceText` and `templateData`:

```json
{
  "id": "body-3",
  "type": "body",
  "voiceText": "Cảnh báo: AI tự chủ có thể đặt ra rủi ro về an ninh mạng.",
  "templateData": { "template": "callout", ... },
  "sfx": { "name": "alert/notification", "volume": 0.4 }
}
```

Available SFX categories (any `<name>` subfolder in `assets/sfx/<category>/<name>.mp3`):
- `transition/` — whoosh, swoosh, swish, pop, punch, page-flip, slide, riser
- `emphasis/` — ding, tick, chime, ping, bong, pop, punch
- `alert/` — notification, alert, alarm, warning
- `success/` — applepay, achievement, win, xbox, steam, jet-set
- `fail/` — wrong-answer-buzzer, incorrect, error, dank-meme
- `outro/` — tada, win31, noooo
- `reveal/` — magic-fairy, anime-girl, hey-female-voice
- `drumroll/` — snare, drum-roll, boom
- `countdown/` — beep, timer
- `cinematic/` — rise, impact

Browse `assets/sfx/<category>/` to see exact filenames. Reference WITHOUT the `.mp3` extension. Example:
```json
{ "sfx": { "name": "success/xbox-360-achievement-sound", "volume": 0.4 } }
```

## Edge cases

| Situation | Action |
|---|---|
| URL paywall / JS-rendered → WebFetch returns no content | Tell user: "Không đọc được URL (có thể do paywall hoặc JS). Hãy lưu nội dung vào file .txt rồi gọi lại." Stop. |
| URL content < 200 words | Warn "Tin gốc ngắn, video có thể không đủ chất liệu", continue anyway |
| URL content > 2000 words | Summarize to key points, fit ~150-200 words script |
| File mode + file empty/missing | Error message, don't create output dir |
| Pipeline fails | Report error message + output dir path; user can re-try `npm run pipeline -- <path>` after fixing |
