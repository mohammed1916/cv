import fs from 'fs'
import path from 'path'

const report = JSON.parse(fs.readFileSync(path.resolve('scripts/manual-input-report.json'), 'utf8'))
const without = report.without
const problemsDir = path.resolve('src/problems')

// Load registry
const registrySrc = fs.readFileSync(path.resolve('src/config/examplesRegistry.js'), 'utf8')
const start = registrySrc.indexOf('export const EXAMPLES_REGISTRY = ')
const end = registrySrc.indexOf('export function getExamples')
const objSrc = registrySrc.slice(start + 'export const EXAMPLES_REGISTRY = '.length, end)
// eslint-disable-next-line no-eval
const EXAMPLES_REGISTRY = eval('(' + objSrc + ')')

// Parse the EXAMPLES declaration from each file: getExamples('slug') or getExamplesOr('slug', [fallback])
const rows = []
for (const p of without) {
  const dir = path.join(problemsDir, p.folder)
  const files = fs.readdirSync(dir)
  const jsxFile = files.find(f => f.endsWith('.jsx') && !f.endsWith('.css'))
  if (!jsxFile) continue
  const code = fs.readFileSync(path.join(dir, jsxFile), 'utf8')

  // Find EXAMPLES declaration
  const exDecl = code.match(/const EXAMPLES\s*=\s*(getExamples(?:Or)?\([^;]*?\))\s*;?/s)
  const useOr = /getExamplesOr/.test(code)
  const slugMatch = code.match(/getExamples(?:Or)?\(\s*['"]([^'"]+)['"]/)
  const slug = slugMatch ? slugMatch[1] : (p.slug || '')
  const hasFallback = /getExamplesOr\(/.test(code)

  // Extract fallback example array if present (for getExamplesOr)
  let fallbackFields = []
  let fallbackExamples = []
  let registryFields = []
  let registryExamples = []
  let inlineExamples = []

  // Look up registry by slug
  if (slug && EXAMPLES_REGISTRY[slug]) {
    registryExamples = EXAMPLES_REGISTRY[slug]
    const keys = new Set()
    for (const ex of registryExamples) for (const k of Object.keys(ex)) if (k !== 'label') keys.add(k)
    registryFields = Array.from(keys)
  }

  if (hasFallback) {
    // Get the second argument (array literal)
    const m = code.match(/getExamplesOr\(\s*['"][^'"]+['"]\s*,\s*(\[[\s\S]*?\])\)/)
    if (m) {
      try {
        // eslint-disable-next-line no-eval
        const arr = eval('(' + m[1] + ')')
        if (Array.isArray(arr)) {
          fallbackExamples = arr
          const keys = new Set()
          for (const ex of arr) for (const k of Object.keys(ex)) if (k !== 'label') keys.add(k)
          fallbackFields = Array.from(keys)
        }
      } catch (e) { /* ignore */ }
    }
  }

  // Inline `const EXAMPLES = [ ... ]` (balanced-bracket parse)
  const inlineMatch = code.match(/const EXAMPLES\s*=\s*/)
  if (inlineMatch) {
    const start = inlineMatch.index + inlineMatch[0].length
    if (code[start] === '[') {
      let depth = 0
      let i = start
      while (i < code.length) {
        const c = code[i]
        if (c === '[') depth++
        else if (c === ']') {
          depth--
          if (depth === 0) break
        }
        i++
      }
      if (i < code.length) {
        const arrSrc = code.slice(start, i + 1)
        try {
          // eslint-disable-next-line no-eval
          const arr = eval('(' + arrSrc + ')')
          if (Array.isArray(arr)) {
            inlineExamples = arr
          }
        } catch (e) { /* ignore */ }
      }
    }
  }

  rows.push({
    folder: p.folder,
    number: p.number,
    title: p.title,
    slug,
    useOr: hasFallback,
    hasDecl: !!exDecl,
    fallbackFields,
    fallbackExamples,
    registryFields,
    registryExamples,
    inlineExamples,
  })
}

// Merge: prefer registry fields, else fallback fields, else inline
const merged = rows.map(r => {
  const exs = r.registryExamples.length ? r.registryExamples
    : r.fallbackExamples.length ? r.fallbackExamples
    : r.inlineExamples
  const keys = new Set()
  for (const ex of exs) for (const k of Object.keys(ex)) if (k !== 'label') keys.add(k)
  const fields = r.registryFields.length ? r.registryFields
    : r.fallbackFields.length ? r.fallbackFields
    : Array.from(keys)
  return { ...r, fields, examples: exs }
})
fs.writeFileSync('scripts/examples-ground-truth.json', JSON.stringify(merged, null, 2))

// Summary of field signatures from ground truth
const sigs = {}
for (const r of merged) {
  const key = r.fields.slice().sort().join('|')
  if (!sigs[key]) sigs[key] = []
  sigs[key].push(r.folder)
}
console.log('Total:', merged.length)
console.log('Has EXAMPLES decl:', merged.filter(r => r.hasDecl).length)
console.log('Uses getExamplesOr:', merged.filter(r => r.useOr).length)
console.log('With fields (registry or fallback):', merged.filter(r => r.fields.length).length)
console.log('No fields:', merged.filter(r => r.fields.length === 0).length)
console.log('\n=== Field signatures (merged ground truth) ===')
Object.entries(sigs).sort((a, b) => b[1].length - a[1].length).forEach(([sig, folders]) => {
  console.log(`${folders.length}\t${sig}\t${folders.slice(0, 6).join(',')}`)
})
