"""Report text coverage separately from requirement/source verification."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'local-reference/leetcode'
items=json.loads((base/'missing.json').read_text())
drafts=json.loads((ROOT/'docs/requirements/drafts/known-problems.json').read_text())
rows=[]
for item in items:
    n=str(item['number']); p=base/'manual'/f'{n}.txt'
    text=p.read_text() if p.exists() else ''
    if not text.strip(): state='empty-needs-drafting-or-source'
    elif 'AI-AUTHORED REQUIREMENTS DRAFT' in text:
        task=drafts.get(n,{}).get('task','').lower()
        state='draft-explicit-rule-gap' if any(x in task for x in ('verify','not reliably known','incomplete','must be verified')) or drafts.get(n,{}).get('pitfalls') else 'draft-awaiting-source-verification'
    elif 'EXISTING REQUIREMENT NOTE' in text: state='source-note-awaiting-completeness-review'
    else: state='supplied-text-awaiting-review'
    rows.append({'number':n,'title':item['title'],'status':state,'file':f'manual/{n}.txt','officialUrl':item['officialUrl']})
counts={s:sum(r['status']==s for r in rows) for s in sorted({r['status'] for r in rows})}
report={'scope':'Missing full-text inventory only; nonempty does not mean verified','counts':counts,'entries':rows}
(base/'inbox-status.json').write_text(json.dumps(report,indent=2)+'\n')
lines=['# Statement inbox status','','Text drafts and sourced notes are useful progress, but do not change the historical full-text count or certify current rules. The assistant owns continued drafting and sourcing; these are not all mandatory user-transcription tasks.','','| State | Count |','| --- | ---: |']
lines.extend(f'| {s} | {n} |' for s,n in counts.items())
lines.extend(['','| ID | Problem | Status | File |','| --- | --- | --- | --- |'])
for r in rows:
    title=r['title'].replace('|','\\|')
    lines.append(f"| {r['number']} | [{title}]({r['officialUrl']}) | {r['status']} | [{r['number']}.txt]({r['file']}) |")
(base/'INBOX-STATUS.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(counts,indent=2))
