"""Create empty reference-only paste targets; never overwrite user content."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
base = ROOT / 'local-reference/leetcode'
items = sorted(json.loads((base / 'missing.json').read_text()), key=lambda x: int(x['number']))
inbox = base / 'manual'
inbox.mkdir(parents=True, exist_ok=True)
created = 0
for item in items:
    target = inbox / f"{item['number']}.txt"
    if not target.exists():
        target.touch()
        created += 1

def write_list(name, subset, title):
    lines = [f'# {title}', '', 'Click the official page, copy its statement and paste into the matching numbered text file. Whole-page pastes are accepted. Files are local reference only, not website content.', '', 'A non-empty file only means text was supplied; it has not yet been checked for completeness. Premium access is not assumed. Leave inaccessible pages empty.', '', '| ID | Official problem page | Paste into | Text present |', '| --- | --- | --- | --- |']
    for item in subset:
        number = item['number']
        label = item['title'].replace('|', '\\|')
        present = bool((inbox / f'{number}.txt').read_text().strip())
        lines.append(f"| {number} | [{label}]({item['officialUrl']}) | [{number}.txt]({number}.txt) | {'Yes; unreviewed' if present else 'No'} |")
    (inbox / name).write_text('\n'.join(lines)+'\n')
free = [i for i in items if not i['paidOnlyInCatalog']]
paid = [i for i in items if i['paidOnlyInCatalog']]
write_list('FREE.md', free, 'Free problems missing full statements')
write_list('PAID.md', paid, 'Paid problems missing full statements')
(inbox / 'README.md').write_text(f'''# Paste missing problem statements here

Start with [FREE.md](FREE.md): **{len(free)} free problems**. [PAID.md](PAID.md) lists **{len(paid)} paid problems**; only paste those you can legitimately access.

There are **{len(items)} numbered `.txt` files**, one for each missing statement in the recovered archive inventory. Each list links both the official page and the matching file.

1. Open the official problem page from the list.
2. Copy the full description, examples, constraints and any follow-up. Copying the whole page is also fine; unrelated navigation can be removed during review. Do not include passwords, cookies or other private account information.
3. Paste into `<problem-number>.txt` and save. For example, problem 156 goes in `156.txt`.
4. Work in any batch size. Tell the assistant which files you filled, or simply say “review the pasted statements.” Existing content will never be overwritten by the setup script.

Diagrams may not survive text copying. If a statement depends on one, save its image alongside the text (for example `156-diagram.png`) and mention that filename in the text file. Do not fill inaccessible files with login or error pages.

These files are ignored by Git, outside the published app, and for reference only. The website must use independently authored explanations and examples. Non-empty files are not automatically verified or imported into the recovered archive. The assistant must match the ID/title, check completeness and provenance, and update the source ledger after reviewing each paste.

The free/paid labels come from the stored catalog and may differ from current access. The lists describe missing full text, not missing implementations; some problems already have requirement summaries.

To refresh text-present indicators or recreate missing empty files without overwriting your pastes:

```sh
python3 scripts/prepare-manual-statement-inbox.py
```
''')
print(json.dumps({'created': created, 'total': len(items), 'free': len(free), 'paid': len(paid), 'nonempty': sum(bool((inbox / f"{i['number']}.txt").read_text().strip()) for i in items)}))
