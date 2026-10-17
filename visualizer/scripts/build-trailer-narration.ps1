$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$scenes = Get-Content -LiteralPath (Join-Path $repoRoot 'src\promo\scenes.json') -Raw | ConvertFrom-Json
$outputDirectory = Join-Path $repoRoot 'docs\promo\audio'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$scratchDirectory = Join-Path ([IO.Path]::GetTempPath()) ('visualizer-narration-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $scratchDirectory | Out-Null
$voice = New-Object -ComObject SAPI.SpVoice
$zira = @($voice.GetVoices() | Where-Object { $_.GetDescription() -like '*Zira*' })
if (!$zira.Count) { throw 'Microsoft Zira is not installed. Install an English Windows voice or supply professionally recorded scene audio.' }
$voice.Voice = $zira[0]
$voice.Rate = 0
$durations = @()
$concat = @()
for ($i = 0; $i -lt $scenes.Count; $i++) {
  $wav = Join-Path $scratchDirectory "scene-$i.wav"
  $file = New-Object -ComObject SAPI.SpFileStream
  $file.Open($wav, 3, $false)
  $voice.AudioOutputStream = $file
  [void]$voice.Speak($scenes[$i].text)
  $file.Close()
  $mp3 = Join-Path $outputDirectory "scene-$i.mp3"
  & ffmpeg.exe -hide_banner -loglevel error -y -i $wav -codec:a libmp3lame -q:a 3 $mp3
  if ($LASTEXITCODE -ne 0) { throw "Could not encode scene $i" }
  $seconds = & ffprobe.exe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $mp3
  $duration = [Math]::Max([double]::Parse($seconds, [Globalization.CultureInfo]::InvariantCulture) + 1.4, 9)
  $durations += $duration
  $padded = Join-Path $scratchDirectory "padded-$i.wav"
  & ffmpeg.exe -hide_banner -loglevel error -y -i $mp3 -af apad -t $duration.ToString([Globalization.CultureInfo]::InvariantCulture) $padded
  if ($LASTEXITCODE -ne 0) { throw "Could not pad scene $i" }
  $concat += "file 'padded-$i.wav'"
}
$durations | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputDirectory 'durations.json')
$concatPath = Join-Path $scratchDirectory 'concat.txt'
[IO.File]::WriteAllLines($concatPath, $concat)
& ffmpeg.exe -hide_banner -loglevel error -y -f concat -safe 0 -i $concatPath -codec:a libmp3lame -q:a 3 (Join-Path $repoRoot 'docs\promo\narration.mp3')
if ($LASTEXITCODE -ne 0) { throw 'Could not assemble the narration preview' }
Write-Output "Created $($scenes.Count) draft voice tracks; trailer duration approximately $([Math]::Round(($durations | Measure-Object -Sum).Sum)) seconds."
