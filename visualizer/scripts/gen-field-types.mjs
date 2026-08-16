import fs from 'fs'
import path from 'path'

// Regenerate field-types.json from examples-ground-truth.json
const gt = JSON.parse(fs.readFileSync(path.resolve('scripts/examples-ground-truth.json'), 'utf8'))

const out = {}
for (const g of gt) {
  const ex = g.examples?.[0]
  if (!ex) {
    out[g.folder] = { fields: g.fields, types: {}, example: null }
    continue
  }
  const types = {}
  for (const k of Object.keys(ex)) {
    if (k === 'label') continue
    const v = ex[k]
    if (Array.isArray(v)) types[k] = 'array'
    else if (typeof v === 'number') types[k] = 'number'
    else if (typeof v === 'boolean') types[k] = 'boolean'
    else types[k] = 'string'
  }
  out[g.folder] = { fields: g.fields, types, example: ex }
}

fs.writeFileSync('scripts/field-types.json', JSON.stringify(out, null, 2))
const missing = Object.entries(out).filter(([, v]) => Object.keys(v.types).length === 0)
console.log('field-types written. Entries:', Object.keys(out).length, '| missing types:', missing.length)
missing.slice(0, 30).forEach(([f]) => console.log('  missing:', f))
