# Full statement archive recovery — 2026-11-02

The user remembered correctly: this repository previously contained a large full-statement cache. The earlier November inventory looked at current summaries/catalog files and failed to inspect the deleted archive. It was incomplete.

## What was deleted and when

Commit `dc5902ece91a6f29cdc79800d2fdf85a7b0f1a66`, dated September 24, 2026, deleted `public/data/descriptions/` and the description fetching script. Its commit message explicitly describes removing 2,985 downloaded GraphQL HTML files and replacing the app's descriptions with original summaries. This was not a deletion in the recent November review/handoff commits.

The parent revision `95924b608ac5dda25bae57ab19978503de7f592d` retains every file. The even older combined file `public/data/problemDescriptions.json`, before `2a83d1927`, has the same 2,985 slug keys and supplies no additional entries.

## Recovered inventory

| Measure | Count |
| --- | ---: |
| JSON files recovered byte-for-byte | 2,985 |
| Files containing non-empty statement HTML | 2,984 |
| Empty record | 1 (271, Encode and Decode Strings) |
| Matched full statements in stored catalog | 2,984 |
| Stored catalog entries | 4,073 |
| Free entries still missing full text | 304 |
| Paid entries still missing full text | 785 |
| Recovered slugs outside catalog | 0 |

All 2,984 non-empty matches are marked free in the catalog snapshot. The source files total 19,259,990 bytes. Counts describe actual recovered content, not a certification that every historical statement is complete/current. Full statements were not available for every current free problem in this archive.

## Read locally

- [Browsable problem directory](../../local-reference/leetcode/README.md)
- [Machine-readable inventory and SHA-256 hashes](../../local-reference/leetcode/index.json)
- [Exact missing entries](../../local-reference/leetcode/missing.json)
- Raw source: `local-reference/leetcode/raw/<slug>.json`. The `content` field contains the stored full HTML; `exampleTestcases` retains test input text where present.

The local reference folder is ignored by Git and outside `public/`; no runtime imports, public serving, deployment or old description UI was restored. The already committed historical blobs remain the recoverable source. The recovery script and these instructions are tracked. On another checkout, or if the local directory is missing, run:

```sh
python3 scripts/recover-statement-archive.py
```

This requires the historical commit to be present (a shallow clone may need its history fetched). The script refuses to overwrite a recovered raw file if its contents have subsequently changed. It regenerates index/missing files. It verifies JSON parsing and records hashes; it does not fetch new content or certify algorithm implementations.

## Claude continuation correction

1. Resolve number to slug using the catalog or recovered index.
2. Read the local raw statement first. Build a requirements note from the actual rules, examples and constraints, preserving source provenance and snapshot age.
3. If an old access-failure record has recovered text, mark the old network failure as historical rather than treating it as an active absence of requirements. Do not delete the failure history.
4. For the 304 free missing entries, inspect available existing notes and accessible official sources. Store independently written complete requirements with provenance when permitted; keep `full statement missing` separate from `requirements sufficient to implement`. Do not label summaries as full text.
5. Paid entries remain visible and need legitimately available requirements. No paid text was recovered in this archive.
6. Do not tell the user all statements are stored: 1,089 current catalog entries still lack full text. Do not ask them to paste statements already recovered locally.

This recovery corrects the previous source inventory; it does not certify all statements, solve the remaining problems or complete browser acceptance.
