# Make algorithms click — promotional film

Deliverable: `export/teem-treat-promo.mp4`, 72 seconds, 1920 × 1080, 24 fps,
H.264 video and AAC stereo audio. Music-led, with readable on-screen copy.
The instrumental soundtrack is synthesized by the renderer and uses no third-party music.

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
| 64–72 | Brand and call to action |

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

Then render and encode the film:

```powershell
node scripts/render-promo-trailer.mjs
```

Prerequisites: Chrome, FFmpeg and the Codex bundled Playwright package. Override
`CHROME_PATH`, `PLAYWRIGHT_PACKAGE`, and `PROMO_APP_URL` for another machine.
Set `PROMO_RENDER_ONLY=1` to reuse the previously captured shots.

Edit `trailer.html` to change the visual treatment, wording, or timeline. The
renderer owns the score and export settings. Export files and review images are
local artifacts, excluded from Git. The earlier interactive recorder and draft
narration remain separate from this music-led film.
