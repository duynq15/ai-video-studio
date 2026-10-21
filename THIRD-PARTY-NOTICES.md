# Third-Party Notices

This project uses the following third-party software. Each component keeps its
own copyright and license.

## Runtime dependencies (main)

| Component | License | Notes |
|---|---|---|
| HyperFrames | Apache-2.0 | Video composition/render engine. Keep NOTICE when redistributing. |
| Remotion (`remotion`, `@remotion/*`) | Remotion License (see `node_modules/remotion/LICENSE.md` / https://remotion.dev/license) | Free for individuals; company license may be required. |
| edge-tts-universal | **AGPL-3.0** | Strong copyleft. This repo is private; do not distribute/SaaS without complying with AGPL. |
| edge-tts (Python CLI, optional fallback) | LGPL-3.0 | Only invoked as an external process; not bundled. |
| React / React DOM | MIT | |
| Tailwind CSS | MIT | |
| Zod | MIT | |
| Axios | MIT | |
| p-limit | MIT | |
| dotenv | BSD-2-Clause | |

## TTS / AI models

| Component | License | Notes |
|---|---|---|
| VieNeu-TTS | Apache-2.0 | Used by CIT Voice Studio; keep notices. |
| Supertonic 3 | OpenRAIL-M | Use restrictions: no impersonation, disclose AI-generated content, etc. |
| Microsoft Edge TTS service | Microsoft terms | Unofficial endpoint via third-party clients; use at your own risk. |
| LucyLab / Vbee / ElevenLabs | Provider terms | API usage subject to each provider's terms. |

## Fonts / assets

| Component | License |
|---|---|
| Be Vietnam Pro | SIL Open Font License 1.1 (`apps/remotion-explainer/public/fonts/OFL.txt`) |
| GSAP (CDN in compare-video compositions) | GreenSock standard license (free for most uses; check gsap.com/licensing) |
| Be Vietnam Pro via Google Fonts CDN (compare-video) | SIL OFL 1.1 |

## Reference-only

`integrations/cit-voice-studio/` contains third-party documentation under its own
proprietary license. It is not part of this project's source and must not be
rebranded or redistributed as your own.

If this repository is ever made public or offered as a network service, review
the AGPL-3.0 obligations for `edge-tts-universal` before publishing.
