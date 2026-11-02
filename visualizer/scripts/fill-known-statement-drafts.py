"""Fill empty inbox files with attributed original drafts, never invented source text."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
base = ROOT / 'local-reference/leetcode'
inbox = base / 'manual'
items = json.loads((base / 'missing.json').read_text())
drafts = json.loads((ROOT / 'docs/requirements/drafts/known-problems.json').read_text())
created = []
for item in items:
    number = str(item['number'])
    target = inbox / f'{number}.txt'
    if target.exists() and target.read_text().strip():
        continue
    note = ROOT / f'docs/requirements/{number}.json'
    source = json.loads(note.read_text()) if note.exists() else {}
    draft = drafts.get(number)
    if source.get('summary'):
        status = 'EXISTING REQUIREMENT NOTE — NOT FULL ORIGINAL SOURCE TEXT'
        body = source['summary']
        constraints = str(source.get('officialConstraints', 'Not recorded.'))
        provenance = f"Existing file: docs/requirements/{number}.json\nSource type: {source.get('sourceKind', 'unspecified')}\nSource checked: {source.get('checkedOn', 'unspecified')}\nThis importer has not independently reverified the note."
        examples = 'Reference examples from the note (do not publish):\n'+json.dumps(source.get('examples', []),indent=2)
        pitfalls = str(source.get('semanticPitfalls', source.get('visualizationNotes', 'Review full note for caveats.')))
    elif draft:
        status = 'AI-AUTHORED REQUIREMENTS DRAFT — SOURCE VERIFICATION PENDING'
        body = draft['task']
        constraints = 'The structural/domain rules stated above are part of this remembered draft. Exact current official numeric bounds and omitted interface details are NOT verified. Do not invent them or substitute visualization limits.'
        provenance = 'Independently composed from model knowledge. Not scraped, not a recovered original statement, and not independently verified against the current official page.'
        if draft.get('supportingSources'):
            provenance = 'Independently written draft with partial public-reference review. Not recovered original text or complete official-source verification.\nReferences: ' + ', '.join(draft['supportingSources']) + '\nReview: ' + draft.get('sourceReview', 'Current official bounds and completeness remain pending.')
        examples = draft.get('example', 'No example supplied in this draft; author and independently validate a teaching example before publication.')
        pitfalls = draft.get('pitfalls', 'Verify the domain, API/output format, edge cases and exact bounds before marking requirements complete.')
    else:
        continue
    text = f"{number}. {item['title']}\n{status}\n\nOfficial reference: {item['officialUrl']}\n\nTASK\n{body}\n\nBOUNDS AND GUARANTEES\n{constraints}\n\nEXAMPLES\n{examples}\n\nPROVENANCE\n{provenance}\n\nREVIEW NOTES\n{pitfalls}\n\nREFERENCE/PUBLICATION BOUNDARY\nThis inbox is local reference only. Independently author website explanations and examples. This file does not establish exact-source coverage or certified implementation correctness.\n"
    inbox.mkdir(parents=True,exist_ok=True)
    target.write_text(text)
    created.append({'number':number,'file':str(target.relative_to(ROOT)),'status':status})
if created:
    (base / 'last-ai-draft-fill.json').write_text(json.dumps({'created':created},indent=2)+'\n')
print(json.dumps({'newFilesFilled':len(created),'newFromExistingNotes':sum(x['status'].startswith('EXISTING') for x in created),'newKnowledgeDrafts':sum(x['status'].startswith('AI-') for x in created),'totalNonempty':sum(bool(p.read_text().strip()) for p in inbox.glob('*.txt') if p.stem.isdigit())},indent=2))
