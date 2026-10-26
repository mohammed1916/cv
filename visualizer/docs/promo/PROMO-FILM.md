# Make algorithms click — promotional film

Deliverable: `export/teem-treat-promo-voiceover.mp4` (also copied to
`export/teem-treat-promo.mp4`), 72 seconds, 1920 × 1080, 24 fps, H.264 video
and AAC speech audio. Narration only: no music or sound effects.
The narrator is the synthetic neural voice `en-US-AndrewMultilingualNeural`,
selected for its warm, confident delivery. `voiceover.json` owns the script.

The trailer combines actual application captures with animated typography,
camera moves, and a correctly sequenced Two Sum explanation. It is an edited
promotional film; the shots are not a continuous screen recording.

| Time | Feature |
| --- | --- |
| 00–04 | Opening hook |
| 04–12 | Two Sum: scan, remember, find complement, return indices |
| 12–15 | Network Delay Time / advanced graph shortest paths |
| 15–18 | N-Queens / backtracking |
| 18–20 | Unique Paths / dynamic programming |
| 20–28 | Prerequisites, subtopics, concept guide, live tutorial |
| 28–40 | Playback, zoom in/out, hide/restore panels, resize, dock/float |
| 40–48 | Brace Expansion II / recursion and nested choices |
| 48–56 | Code Playground / Python and JavaScript |
| 56–64 | Code selection and attachment to chat |
| 64–72 | Brand, discreet Beta badge, animated visualizer.teemtreat.com |

The Playground capture uses the real `RuntimePlayground` component in an isolated
authoring preview with a fresh example and browser profile. It does not record
an authenticated account, modify the app's access policy, or use private code.
The film includes no fabricated chat answer and sends no chat message.
Other workspace captures use the existing local development app configuration.

## Rebuild

Start the isolated preview server, which uses its own dependency cache:

```powershell
node node_modules/vite/bin/vite.js --config scripts/promo-vite.config.mjs
```

Generate narration, then render and encode the film:

```powershell
python scripts/build-promo-voiceover.py
node scripts/render-promo-trailer.mjs
```

Prerequisites: Chrome, FFmpeg, Python with `edge-tts`, and the Codex bundled Playwright package. The
local copy of `edge-tts` lives under the ignored `export/tts-runtime` folder. Install
it there with `python -m pip install --target docs/promo/export/tts-runtime edge-tts`.
Speech synthesis sends only the public narration script to Microsoft's online
speech service through [edge-tts](https://github.com/rany2/edge-tts).
Override
`CHROME_PATH`, `PLAYWRIGHT_PACKAGE`, and `PROMO_APP_URL` for another machine.
Set `PROMO_RENDER_ONLY=1` to reuse the previously captured shots.

Edit `trailer.html` to change the visual treatment, wording, or timeline. The
renderer owns the export settings. Export files and review images are
local artifacts, excluded from Git. The earlier interactive recorder and draft
narration remain separate from this voiced film. `export/voiceover.mp3` provides
the narration alone, and `export/teem-treat-promo-voiceover.srt` provides captions.

Beta is acknowledged briefly in the closing screen and narration, while benefits
remain the main message. The future ₹300/month price is deliberately excluded
from this reusable promotional film; announce the price and effective date
separately when finalized. This trailer does not change application pricing.
