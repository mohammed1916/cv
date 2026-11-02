"""Recover the repository's existing statement archive without changing the app."""
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]
REV = 'dc5902ece91a6f29cdc79800d2fdf85a7b0f1a66^'
PREFIX = 'visualizer/public/data/descriptions/'
DEST = ROOT / 'local-reference/leetcode'
DEST.mkdir(parents=True, exist_ok=True)
revision = subprocess.check_output(['git', 'rev-parse', REV], cwd=ROOT, stderr=subprocess.DEVNULL).decode().strip()
archive = subprocess.check_output(['git', 'archive', revision, PREFIX], cwd=ROOT.parent, stderr=subprocess.DEVNULL)
recovered = {}
with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
    for member in tar:
        if not member.isfile() or not member.name.startswith(PREFIX):
            continue
        name = member.name[len(PREFIX):]
        if '/' in name or not name.endswith('.json'):
            continue
        raw = tar.extractfile(member).read()
        data = json.loads(raw)
        target = DEST / 'raw' / name
        target.parent.mkdir(exist_ok=True)
        if target.exists() and target.read_bytes() != raw:
            raise RuntimeError(f'Refusing to overwrite changed reference: {target}')
        target.write_bytes(raw)
        recovered[name[:-5]] = {'file': f'raw/{name}', 'sha256': hashlib.sha256(raw).hexdigest(), 'hasContent': bool(data.get('content', '').strip()), 'hasExamples': bool(data.get('exampleTestcases', '').strip())}
catalog = json.loads((ROOT / 'public/data/leetcodeCatalog.json').read_text())
entries = []
for problem in catalog['problems']:
    match = recovered.get(problem['slug'])
    entries.append({'number': problem['number'], 'title': problem['title'], 'slug': problem['slug'], 'paidOnlyInCatalog': problem.get('paidOnly'), 'status': 'recovered-statement' if match and match['hasContent'] else 'missing-statement', 'officialUrl': f"https://leetcode.com/problems/{problem['slug']}/description/", **(match or {})})
missing = [e for e in entries if e['status'] == 'missing-statement']
report = {'recoveredFromRevision': revision, 'deletedByCommit': REV[:-1], 'archiveFiles': len(recovered), 'nonemptyStatements': sum(e['hasContent'] for e in recovered.values()), 'catalogEntries': len(entries), 'catalogMatchedStatements': len(entries)-len(missing), 'missingFreeInSnapshot': sum(not e['paidOnlyInCatalog'] for e in missing), 'missingPaidInSnapshot': sum(bool(e['paidOnlyInCatalog']) for e in missing), 'warning': 'Historical source text recovered byte-for-byte from this repository. Not refreshed or certified current. Paid flags are catalog metadata. No app/runtime wiring was changed.', 'entries': entries, 'archiveSlugsOutsideCatalog': sorted(set(recovered)-{e['slug'] for e in entries})}
(DEST / 'index.json').write_text(json.dumps(report, indent=2)+'\n')
(DEST / 'missing.json').write_text(json.dumps(missing, indent=2)+'\n')
lines = ['# Recovered LeetCode statements', '', 'Historical full HTML statements recovered from this repository, not newly authored summaries. Open a raw JSON file and read its `content` field; `exampleTestcases` is retained where present. These files are outside `public/` and are not connected to the app.', '', f'Recovered {len(recovered)} archive files from `{revision}`. Matched {len(entries)-len(missing)} of {len(entries)} current stored catalog entries. Missing: '+str(report['missingFreeInSnapshot'])+' free and '+str(report['missingPaidInSnapshot'])+' paid entries according to the catalog snapshot.', '', 'The archive is historical and may contain outdated rules. Verify uncertain or changed requirements against the official source. [Missing list](missing.json); [machine-readable index and hashes](index.json).', '', '| ID | Problem | Local statement |', '| --- | --- | --- |']
for e in entries:
    title = e['title'].replace('|', '\\|')
    link = f"[Full cached text]({e['file']})" if e['status'] == 'recovered-statement' else 'Missing'
    lines.append(f"| {e['number']} | [{title}]({e['officialUrl']}) | {link} |")
(DEST / 'README.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['entries','archiveSlugsOutsideCatalog']}, indent=2))
