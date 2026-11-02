import fs from 'node:fs'
import path from 'node:path'
const catalogPath = 'public/data/leetcodeCatalog.json'
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
const seen = new Set()
const entries = catalog.problems.map(p => {
  if (seen.has(String(p.number))) throw new Error(`Duplicate problem number: ${p.number}`)
  seen.add(String(p.number))
  if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`Invalid slug: ${p.slug}`)
  const file = `docs/requirements/${p.number}.json`
  const note = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  return {
    number: String(p.number), title: p.title, slug: p.slug, difficulty: p.difficulty,
    paidOnly: p.paidOnly, officialStatement: `https://leetcode.com/problems/${p.slug}/description/`,
    sourceStatus: note?.summary ? 'requirements-summary-cached' : note ? 'source-attempt-only-no-summary' : 'link-only-not-fetched',
    sourceKind: note?.sourceKind ?? null, requirementsVerified: note?.requirementsVerified ?? null,
    requirementsFile: note ? file : null, checkedOn: note?.checkedOn ?? null,
    summary: note?.summary ?? null, constraints: note?.officialConstraints ?? null,
    examples: note?.examples ?? null,
  }
})
const output = {
  catalogPath, catalogGeneratedAt: catalog.generatedAt, count: entries.length,
  cachedRequirements: entries.filter(e => e.sourceStatus === 'requirements-summary-cached').length,
  sourceAttemptsWithoutSummary: entries.filter(e => e.sourceStatus === 'source-attempt-only-no-summary').length,
  warning: 'Source directory, not a full-text statement archive or implementation certification. Catalog membership and paid flags are the stored snapshot, not a live inventory. Cached notes vary in completeness; read the note and official page.',
  entries,
}
fs.mkdirSync('docs/statement-sources', {recursive:true})
fs.writeFileSync('docs/statement-sources/index.json', JSON.stringify(output,null,2)+'\n')
const esc = s => String(s).replaceAll('|','\\|').replaceAll('\n',' ')
const rows = entries.map(e => `| ${e.number} | [${esc(e.title)}](${e.officialStatement}) | ${e.paidOnly ? 'Paid in snapshot' : 'Free in snapshot'} | ${e.requirementsFile ? `[${e.summary ? 'Requirement summary' : 'Attempt only; no statement'}](../requirements/${e.number}.json)` : 'Not cached'} |`)
fs.writeFileSync('docs/statement-sources/INDEX.md', `# LeetCode statement source directory\n\n${entries.length} problems from the repository catalog dated ${catalog.generatedAt}. ${output.cachedRequirements} local requirement summaries; ${output.sourceAttemptsWithoutSummary} source-attempt records without summaries.\n\nThis provides official statement links for every catalog entry, not full statement text for every entry. Unfetched links are not certified accessible. Paid statements may require authorized access. Notes are paraphrased requirements; some older notes omit examples. Implementation and verification remain separate.\n\nRead [the sourcing workflow](README.md). Machine-readable equivalent: [index.json](index.json).\n\n| Number | Official statement | Access metadata | Local requirements |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`)
console.log(JSON.stringify({count:output.count,cachedRequirements:output.cachedRequirements,attemptOnly:output.sourceAttemptsWithoutSummary,linkOnly:entries.filter(e=>!e.requirementsFile).length}))
