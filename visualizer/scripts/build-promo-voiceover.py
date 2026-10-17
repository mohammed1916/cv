"""Generate a scene-synchronized neural narrator, without music or effects."""
import asyncio
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/promo/export'
sys.path.insert(0, str(OUT / 'tts-runtime'))
import edge_tts

def run(*args):
    subprocess.run(args, check=True)

def timestamp(seconds):
    ms = round(seconds * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

async def main():
    config = json.loads((ROOT / 'docs/promo/voiceover.json').read_text(encoding='utf-8'))
    voice = os.environ.get('PROMO_VOICE', config['voice'])
    voices = await edge_tts.list_voices()
    if voice not in {v['ShortName'] for v in voices}:
        raise RuntimeError(f'Voice is unavailable: {voice}')
    audio = OUT / 'narration'
    audio.mkdir(parents=True, exist_ok=True)
    concat, captions, timing = [], [], []
    for index, shot in enumerate(config['segments']):
        mp3 = audio / f'scene-{index}.mp3'
        signature = json.dumps([voice, config['rate'], config['pitch'], shot['text']])
        stamp = audio / f'scene-{index}.json'
        if not mp3.exists() or not stamp.exists() or stamp.read_text() != signature:
            await edge_tts.Communicate(shot['text'], voice, rate=config['rate'], pitch=config['pitch']).save(str(mp3))
            stamp.write_text(signature)
        length = float(subprocess.check_output(['ffprobe.exe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(mp3)]))
        window = shot['end'] - shot['start']
        speed = max(1, length / (window - .18))
        if speed > 1.22:
            raise RuntimeError(f'Scene {index} is too rushed ({length:.2f}s for {window}s). Shorten the script.')
        wav = audio / f'scene-{index}.wav'
        run('ffmpeg.exe', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(mp3), '-af', f'atempo={speed:.6f},apad', '-t', str(window), '-ar', '48000', '-ac', '1', str(wav))
        concat.append(f"file '{wav.as_posix()}'")
        captions.append(f"{index + 1}\n{timestamp(shot['start'])} --> {timestamp(shot['end'] - .1)}\n{shot['text']}\n")
        timing.append({'scene': index, 'source_seconds': length, 'window_seconds': window, 'speed': speed})
        print(f'Narrated scene {index + 1}: {length:.2f}s / {window}s, tempo {speed:.3f}', flush=True)
    listing = audio / 'concat.txt'
    listing.write_text('\n'.join(concat), encoding='utf-8')
    run('ffmpeg.exe', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(listing), '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9', '-ar', '48000', str(OUT / 'voiceover.wav'))
    run('ffmpeg.exe', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(OUT / 'voiceover.wav'), '-codec:a', 'libmp3lame', '-q:a', '2', str(OUT / 'voiceover.mp3'))
    (OUT / 'teem-treat-promo-voiceover.srt').write_text('\n'.join(captions), encoding='utf-8')
    (audio / 'timing.json').write_text(json.dumps(timing, indent=2))
    print(f'Finished voice-over: {voice}. Narration only; no music.', flush=True)

asyncio.run(main())
