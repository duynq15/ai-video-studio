# Attribution

This monorepo is a personal fork/rebrand by **DuyNQ** (2026) of the projects below.
Original copyright notices and licenses are retained.

## Upstream projects

| Project | Author | License | Source |
|---|---|---|---|
| auto-video-gen (now `apps/news-video`) | Ho Quang Hai (original), CuongIT / Cuongyd196 (fork & maintenance) | MIT | https://github.com/Cuongyd196/auto-video-gen · https://github.com/hoquanghai/Auto-Create-Video |
| auto-compare-video (now `apps/compare-video`) | Cuongyd196 | MIT | https://github.com/Cuongyd196/auto-compare-video |
| remotion-cuongit-template (now `apps/remotion-explainer`) | Cuongyd196 | MIT | https://github.com/Cuongyd196/remotion-cuongit-template |
| CIT Voice Studio (reference docs in `integrations/`) | Cường IT | Proprietary (free to use) | https://github.com/Cuongyd196/cit-voice-studio |

## Modifications

- Branding, defaults (`CHANNEL`, TikTok card, handles) changed to **DuyNQ**.
- Added CIT Voice Studio provider to `apps/news-video`.
- Replaced Segoe UI (Microsoft, not redistributable) with Be Vietnam Pro (SIL OFL 1.1).
- Removed machine-specific absolute paths from generated audio manifests.
- Added CI, tests and documentation fixes.

## What was NOT changed

- `integrations/cit-voice-studio/` contains the original third-party documentation, kept for reference only.
  It is not rebranded and is not part of DuyNQ's code.

## Original MIT notices

See `apps/news-video/LICENSE`, `apps/compare-video/LICENSE`, `apps/remotion-explainer/LICENSE`.
