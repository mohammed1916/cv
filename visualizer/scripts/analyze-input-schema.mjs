import fs from 'fs'
import path from 'path'

// Extract the EXAMPLES_REGISTRY object from examplesRegistry.js by evaluating
// just that part. Simpler: parse the source with a lightweight approach.
const registrySrc = fs.readFileSync(path.resolve('src/config/examplesRegistry.js'), 'utf8')

// Extract EXAMPLES_REGISTRY object literal
const start = registrySrc.indexOf('export const EXAMPLES_REGISTRY = ')
const end = registrySrc.indexOf('export function getExamples')
const objSrc = registrySrc.slice(start + 'export const EXAMPLES_REGISTRY = '.length, end)
// eslint-disable-next-line no-eval
const EXAMPLES_REGISTRY = eval('(' + objSrc + ')')

const report = JSON.parse(fs.readFileSync(path.resolve('scripts/manual-input-report.json'), 'utf8'))
const without = report.without

function exampleFields(examples) {
  if (!Array.isArray(examples) || examples.length === 0) return []
  // Collect union of keys excluding 'label'
  const keys = new Set()
  for (const ex of examples) {
    for (const k of Object.keys(ex)) {
      if (k !== 'label') keys.add(k)
    }
  }
  return Array.from(keys)
}

const rows = []
for (const p of without) {
  const examples = EXAMPLES_REGISTRY[p.slug] || null
  const fields = examples ? exampleFields(examples) : []
  rows.push({ folder: p.folder, number: p.number, title: p.title, slug: p.slug, fields, hasRegistry: !!examples, exOnly: p.hasExState })
}

rows.sort((a, b) => parseInt(a.folder.replace('Problem', '')) - parseInt(b.folder.replace('Problem', '')))

console.log('folder\t#\texOnly\tregistry\tfields')
for (const r of rows) {
  console.log(`${r.folder}\t${r.number}\t${r.exOnly}\t${r.hasRegistry}\t${r.fields.join(',')}`)
}

fs.writeFileSync('scripts/manual-input-schema.json', JSON.stringify(rows, null, 2))

// Group by field signature
const groups = {}
for (const r of rows) {
  const key = r.fields.slice().sort().join('|') + '|' + (r.exOnly ? 'ex' : 'in')
  if (!groups[key]) groups[key] = []
  groups[key].push(r.folder)
}
console.log('\n=== Distinct field signatures ===')
Object.entries(groups).sort((a, b) => b[1].length - a[1].length).forEach(([sig, folders]) => {
  console.log(`${folders.length}\t${sig}`)
})
