# Teem Treat feature trailer

The trailer uses the running application, with twelve narrated scenes: catalog,
prerequisites and subtopics, concept guides, Two Sum, Network Delay Time, Brace
Expansion II, N-Queens backtracking, Unique Paths dynamic programming, zoom and
panel visibility, docking, Code Playground, and code selection.

## Record

1. Run `npm.cmd run dev`, then open the printed localhost URL with `?trailer=1`.
2. Sign in with an account that can open the advanced problems and playground.
   This workflow does not bypass access checks.
3. Use a clean browser tab, close other guides, and set a comfortable desktop
   viewport (1920 × 1080 recommended). Check that the Code Playground is ready.
4. Click **Record real UI + narration**, then select **this browser tab** in the
   browser's sharing dialog. No video is uploaded.
5. The scenes navigate automatically. On the docking scene, drag a divider and
   move a panel tab. On the playground scene, run your chosen sample. On the
   final scene, select code lines and attach them to chat without sending.
6. Download and review the WebM. The recording is roughly two minutes. To convert:

```powershell
ffmpeg.exe -i teem-treat-feature-trailer.webm -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -movflags +faststart teem-treat-feature-trailer.mp4
```

The studio is only available in the development server, not the production app.
It records the actual selected tab, including anything visible in it. Start from
a clean workspace. Avoid opening account details or private code during recording.

## Narration and edit source

`src/promo/scenes.json` owns the scene order, narration, headings, and interactions.
`audio/scene-0.mp3` through `audio/scene-11.mp3` contain the draft narration.
`narration.mp3` is a continuous preview with pauses matching the scene timings.
These use the local Microsoft Zira synthetic voice. Higgsfield natural-voice
generation was attempted but rejected because the connected account had no
credits. The draft voice is not a professionally produced human recording.

To regenerate the draft after editing the script:

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/build-trailer-narration.ps1
```

To improve the voice, replace the individual MP3 tracks with natural narration;
the recorder measures each track and adjusts scene timing. Keep at least nine
seconds per scene to allow the interactions to finish. Loading transitions are
excluded from the recording. If interrupted, the download is a partial take.

No final browser capture has been rendered or visually checked in this session:
the connected browser inventory was empty. Preview the result before publishing.
