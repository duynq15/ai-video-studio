# AI Video Studio (DuyNQ)

Monorepo cá nhân để tạo video ngắn 9:16 bằng AI — gồm 3 app độc lập và tài liệu tích hợp TTS local.

> Đây là project cá nhân, không nhằm mục đích thương mại. Code kế thừa từ các repo MIT của tác giả gốc; xem [`ATTRIBUTION.md`](ATTRIBUTION.md).

## Apps

| App | Mô tả | Công nghệ |
|---|---|---|
| [`apps/news-video`](apps/news-video) | URL bài báo / file `.txt` → video tin tức 9:16 | HyperFrames + Edge/CIT/LucyLab/Vbee/ElevenLabs |
| [`apps/compare-video`](apps/compare-video) | Video so sánh 2 khái niệm theo template cố định | HyperFrames + GSAP |
| [`apps/remotion-explainer`](apps/remotion-explainer) | Video giải thích kiến thức 6 cảnh | Remotion + React + Tailwind |

Tài liệu tích hợp **CIT Voice Studio** (TTS local, dùng làm backend): [`integrations/cit-voice-studio`](integrations/cit-voice-studio). Đây là app của tác giả khác, **không** được rebrand.

## Bắt đầu nhanh

```bash
# News video
cd apps/news-video
npm install
cp .env.example .env.local
npm test
npm run pipeline -- tests/fixtures/sample-script-no-image.json

# Compare video (chạy trong từng video)
cd apps/compare-video
cp .env.example .env
cd videos/dev-vs-devops
npm run check

# Remotion explainer
cd apps/remotion-explainer
npm install
cp .env.example .env
npm run dev
```

Yêu cầu: **Node.js ≥ 22**, FFmpeg/ffprobe trong `PATH`. Riêng Remotion có thể chạy Node ≥ 18 nhưng monorepo khuyến nghị 22.

## Lệnh tiện dụng từ root

```bash
npm run news:test
npm run news:typecheck
npm run compare:check
npm run remotion:lint
npm run remotion:studio
```

## License & lưu ý

- Code trong repo này: MIT cho phần DuyNQ viết/sửa; các app giữ LICENSE gốc của tác giả upstream trong `apps/*/LICENSE`.
- `edge-tts-universal` là **AGPL-3.0** → repo này để **private**, không phân phối binary/SaaS công khai.
- Remotion có license riêng; nếu sau này dùng cho công ty/tổ chức vượt ngưỡng doanh thu, cần Company License.
- Font Be Vietnam Pro: SIL OFL 1.1.
- CIT Voice Studio: proprietary, chỉ dùng qua API local, không redistribute/rebrand.
- Chi tiết: [`ATTRIBUTION.md`](ATTRIBUTION.md), [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
