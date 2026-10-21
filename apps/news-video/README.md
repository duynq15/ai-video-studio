<a id="top"></a>

<div align="center">

# 🎬 AI Video Studio — News Video

### 🚀 Biến URL bài báo & Repo GitHub thành Video ngắn 9:16 chuyên nghiệp

**1 câu lệnh với AI Coding· 0đ Voice (Edge TTS) · Không cần edit thủ công · Sẵn sàng đăng TikTok, Reels, Shorts**

[![Stars](https://img.shields.io/github/stars/DuyNQ/ai-video-studio?style=for-the-badge&logo=github&color=yellow)](https://github.com/DuyNQ/ai-video-studio/stargazers)
[![Forks](https://img.shields.io/github/forks/DuyNQ/ai-video-studio?style=for-the-badge&logo=github&color=blue)](https://github.com/DuyNQ/ai-video-studio/network/members)
[![License](https://img.shields.io/github/license/DuyNQ/ai-video-studio?style=for-the-badge&color=green)](LICENSE)
[![Node](https://img.shields.io/badge/node-22%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)


</div>

> 💡 **Bạn cần tài liệu chuyên sâu?**
> Bản README này tóm tắt nhanh để bạn có thể bắt đầu tạo video trong 5 phút. Để xem đầy đủ kiến trúc, JSON Schema kịch bản, bảng tính chi phí và hướng dẫn nâng cao, vui lòng xem [👉 README.full.md](README.full.md).

---

## 🎥 Demo

Repo không kèm video demo mới. Render thử bằng:

```bash
npm run pipeline -- tests/fixtures/sample-script-no-image.json
```

Các demo cũ của bản gốc có thể xem trong repo upstream (xem [`ATTRIBUTION.md`](../../ATTRIBUTION.md)).


---

## ✨ Điểm nổi bật

- ⚡ **Tự động hóa toàn diện**: Từ URL bài báo hoặc file `.txt`/`.md` → Kịch bản → Giọng đọc (TTS) → HTML Motion Graphics → Ghép âm thanh & SFX → Render file MP4 1080x1920 30FPS.
- 🎙️ **Voice miễn phí 100% (Edge TTS / CIT Voice Studio)**: Tích hợp sẵn giọng đọc tiếng Việt của Microsoft Edge, **không tốn tiền, không cần API Key**. Hỗ trợ thêm **CIT Voice Studio** (chạy local/offline), **LucyLab** (voice cloning tiếng Việt kèm SRT), **Vbee** (chuẩn giọng tin tức Việt Nam) và **ElevenLabs** (đa ngôn ngữ cao cấp).
- 🎨 **HTML-to-Video Engine (HyperFrames)**: Layout video được viết bằng HTML + CSS + GSAP animation. Dễ dàng can thiệp, tuỳ biến font chữ, màu sắc thương hiệu như lập trình web.
- 🤖 **Thiết kế riêng cho AI Coding Agents**: Tối ưu sẵn cho **Google Antigravity IDE** (`.agents/skills`) và **Claude Code** (`.claude/skills`) qua lệnh `/create-news-video`. Bạn chỉ cần đưa URL bài báo hoặc file `.txt`, AI sẽ tự đọc hiểu, tóm tắt, chọn template đồ họa và chạy pipeline tạo video trọn gói từ A đến Z.
- 📐 **6 Template dựng sẵn linh hoạt**:
  - 🚨 `hook`: Mở đầu gây chú ý, headline + subhead (hỗ trợ ảnh nền Ken Burns)
  - 🔀 `comparison`: So sánh 2 đối tượng cạnh nhau
  - 🔢 `stat-hero`: Nhấn mạnh số liệu/biểu đồ lớn
  - 📋 `feature-list`: Danh sách tính năng/điểm tin (tối đa 4 bullet)
  - 💬 `callout`: Trích dẫn phát biểu hoặc cảnh báo
  - 📣 `outro`: CTA + tên kênh + nguồn, kèm card follow TikTok

> 💡 **SFX không đi kèm repo.** Chạy một lần `npm run sfx:download && npm run sfx:filter` để tải thư viện SFX vào `assets/sfx/`. Nếu bỏ qua, pipeline vẫn render bình thường nhưng không có hiệu ứng âm thanh.

---

## 🚀 Bắt đầu nhanh (3 bước)

### 1. Yêu cầu & Cài đặt

Dự án sử dụng cơ chế **Agentic Video Generation**:
- **Công cụ bắt buộc**: **Node.js 22+** và **FFmpeg** trên máy.
- **AI Coding Agent (Khuyên dùng để tự động hoá 100%)**:
  - 🪐 **[Antigravity IDE](https://antigravity.google)** — AI IDE của Google DeepMind.
  - 🧠 **[Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)** — Agentic CLI của Anthropic.
  - Hoặc bất kỳ AI tool nào khác (Cursor, Codex, Windsurf) thông qua kịch bản JSON.

```bash
# Clone repository
git clone https://github.com/DuyNQ/ai-video-studio.git
cd ai-video-studio/apps/news-video

# Cài đặt dependencies
npm install
```

> **Cài đặt FFmpeg nếu máy chưa có:**
> - **Windows:** `winget install Gyan.FFmpeg`
> - **macOS:** `brew install ffmpeg`
> - **Linux:** `sudo apt install ffmpeg`

### 2. Thiết lập cấu hình

Tạo file môi trường từ file mẫu:

```bash
cp .env.example .env.local
```

> 💡 **Mặc định dự án cấu hình Edge TTS hoàn toàn miễn phí, không cần bất kỳ API key nào.** Bạn có thể tạo video ngay lập tức!
> 
> *(Nếu muốn dùng LucyLab, Vbee hoặc ElevenLabs, mở file `.env.local` và điền key tương ứng).*

### 3. Tạo video đầu tiên!

#### 🤖 Cách 1: Tự động hoàn toàn bằng AI Agent (Khuyên dùng)

##### 👉 Với Google Antigravity IDE
Mở project trong Antigravity IDE, tại khung chat gõ lệnh:
```text
/create-news-video https://github.com/DuyNQ/ai-video-studio
```

##### 👉 Với Anthropic Claude Code
Mở terminal tại thư mục dự án và chạy:
```bash
claude
# Trong màn hình tương tác Claude Code, gõ:
/create-news-video https://github.com/DuyNQ/ai-video-studio
```

> 💡 **Quy trình AI tự động xử lý:**
> 1. Đọc nội dung từ URL (repo GitHub, bài báo) hoặc file .txt tiếng Việt.
> 2. Viết lời bình tiếng Việt chuẩn ngữ âm, chia cảnh và chọn template motion graphics.
> 3. Tự gọi pipeline: sinh voice (Edge TTS Free) + render HyperFrames + mix nhạc & SFX.
> 4. Xuất video `.mp4` cùng file `caption.txt` có sẵn hashtag đăng TikTok!

#### 🛠️ Cách 2: Render trực tiếp từ file kịch bản (Thủ công)

Nếu không dùng AI, bạn có thể render từ file mẫu hoặc file `script.json` tự viết:

```bash
npm run pipeline -- tests/fixtures/sample-script-no-image.json
```

🎉 **Kết quả**: Video thành phẩm sẽ được lưu tại `output/<slug>/<slug>.mp4`.

---

## 🎙️ Lựa chọn giọng đọc (TTS)

Chuyển đổi provider linh hoạt trong `.env.local` qua biến `TTS_PROVIDER`:

| Nhà cung cấp | Cấu hình | Chi phí | Đặc điểm |
| :--- | :--- | :--- | :--- |
| **Edge TTS** *(Mặc định)* | `TTS_PROVIDER=edge-tts` | **0đ (Miễn phí)** | Không cần API key, hỗ trợ giọng Nam/Nữ tiếng Việt tự nhiên |
| **CIT Voice Studio** | `TTS_PROVIDER=cit` | **0đ (Miễn phí)** | Chạy local/offline, giọng tiếng Việt tự nhiên; cần mở app CIT Voice Studio (cổng 8001) |
| **LucyLab** | `TTS_PROVIDER=lucylab` | Rẻ (~25k/1M ký tự) | Giọng voice cloning tiếng Việt tự nhiên, tự động kèm SRT subtitle |
| **Vbee** | `TTS_PROVIDER=vbee` | Trả phí Vbee API | Giọng đọc truyền cảm, chuẩn phong cách phát thanh viên tin tức |
| **ElevenLabs** | `TTS_PROVIDER=elevenlabs` | Trả phí ElevenLabs | Đa ngôn ngữ, chất lượng phòng thu điện ảnh, tuỳ biến cao |

---

## 🛠️ Các lệnh thường dùng (CLI Cheatsheet)

```bash
# Chạy toàn bộ pipeline (TTS + Render visuals + Audio Mix)
npm run pipeline -- output/<slug>/script.json

# Chỉ render lại hình ảnh (giữ nguyên voice đã tạo, tiết kiệm thời gian)
npm run rerender -- output/<slug>

# (Tuỳ chọn) Tải + lọc thư viện SFX vào assets/sfx/ — chạy 1 lần
npm run sfx:download && npm run sfx:filter

# Chạy test kiểm thử toàn bộ hệ thống
npm test
```

---

## 📂 Cấu trúc thư mục dự án

```text
auto-video-gen/
├── .claude/skills/        # Claude Code skill tạo kịch bản tự động
├── .agents/skills/        # Bản skill cho Google Antigravity
├── src/
│   ├── config.ts          # Đọc & validate biến môi trường (.env.local)
│   ├── pipeline.ts        # Pipeline chính: TTS -> HyperFrames -> FFmpeg
│   ├── render/            # Zod schema, HTML composer, template CSS/JS, HyperFrames runner
│   ├── tts/               # Bộ kết nối TTS (Edge TTS, LucyLab, Vbee, ElevenLabs)
│   ├── assets/            # Ghép audio, SFX selector, tải ảnh
│   └── utils/             # Logger, slug
├── tests/                 # Fixtures cho unit tests
├── assets/                # Avatar, logo, SFX (SFX tải bằng npm run sfx:*)
├── output/                # Thư mục lưu video thành phẩm theo từng slug
├── README.full.md         # 📖 Tài liệu hướng dẫn chi tiết toàn bộ dự án
└── README.en.md           # 🇬🇧 English Documentation
```

---

## 📖 Tài liệu chuyên sâu

Để tìm hiểu chi tiết hơn, vui lòng xem [**README.full.md**](README.full.md):
- [Cấu trúc chi tiết của file kịch bản `script.json`](README.full.md#-cấu-trúc-scriptjson)
- [Hướng dẫn tùy biến màu sắc, font chữ và animation CSS](README.full.md#-tùy-biến-giao-diện-theme--css)
- [Bảng ước tính chi phí chi tiết](README.full.md#-ước-tính-chi-phí)
- [Bảng tra cứu và xử lý sự cố (Troubleshooting)](README.full.md#-xử-lý-sự-cố-thường-gặp)
- [Giải đáp các câu hỏi thường gặp (FAQ)](README.full.md#-faq)

---

## 💬 Cộng đồng & Các mẫu tạo video khác

Xem các mẫu tạo video khác tại:

- Link repo tạo video từ 1 chủ đề với Remotion: 🔗 [github.com/DuyNQ/ai-video-studio/tree/main/apps/remotion-explainer](https://github.com/DuyNQ/ai-video-studio/tree/main/apps/remotion-explainer)
- Link tạo video so sánh kiến thức: 🔗 [github.com/DuyNQ/ai-video-studio](https://github.com/DuyNQ/ai-video-studio)




---

## 📜 License & Lời cảm ơn

- Dự án phát hành theo giấy phép [MIT](LICENSE).
- Dự án là bản fork và phát triển mở rộng từ tác phẩm gốc của tác giả [Ho Quang Hai](https://github.com/hoquanghai/Auto-Create-Video).
- Bản fork trước đây được duy trì bởi **CuongIT / Cuongyd196**; bản rebrand này do **DuyNQ** duy trì. Xem [`ATTRIBUTION.md`](../../ATTRIBUTION.md).
