#!/usr/bin/env node

/**
 * Sync Tool
 * Compare catalog against registry and update dev database
 *
 * Usage:
 *   node sync.mjs                - Full sync report
 *   node sync.mjs --clear        - Clear dev database cache
 *   node sync.mjs --list         - List unsolved problems
 *   node sync.mjs --count        - Show counts only
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devDbDir = path.join(__dirname, '.dev')
const catalogPath = path.join(__dirname, 'public/data/leetcodeCatalog.json')
const registryPath = path.join(__dirname, 'src/config/problemVisualizerRegistry.js')

// Ensure .dev directory
fs.mkdirSync(devDbDir, { recursive: true })

// Load catalog
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

// Load registry and extract solved slugs
const registryText = fs.readFileSync(registryPath, 'utf8')
const solvedMatch = registryText.match(/const SOLVED_SLUGS = new Set\(\[([\s\S]*?)\]\)/)
const solvedList = solvedMatch
  ? solvedMatch[1]
      .split('\n')
      .filter(l => l.includes("'"))
      .map(l => l.match(/'([^']+)'/)?.[1])
      .filter(Boolean)
  : []
const solvedSet = new Set(solvedList)

// Find unsolved
const unsolved = catalog.problems
  .filter(p => !solvedSet.has(p.slug))
  .sort((a, b) => Number(a.number) - Number(b.number))

// Metadata
const meta = {
  lastSync: new Date().toISOString(),
  total: catalog.problems.length,
  solved: solvedSet.size,
  unsolved: unsolved.length,
  percentComplete: Math.round((solvedSet.size / catalog.problems.length) * 100),
  catalogVersion: catalog.generatedAt,
}

// Handle commands
const cmd = process.argv[2]

if (cmd === '--clear') {
  if (fs.existsSync(devDbDir)) {
    fs.rmSync(devDbDir, { recursive: true })
  }
  console.log('✓ Dev database cleared')
  process.exit(0)
}

if (cmd === '--list') {
  console.log(`\n📋 Unsolved Problems (${unsolved.length}):\n`)
  unsolved.forEach(p => {
    console.log(`  ${p.number}. ${p.title} (${p.slug})`)
  })
  process.exit(0)
}

if (cmd === '--count') {
  console.log(`\nTotal: ${meta.total} | Solved: ${meta.solved} | Unsolved: ${meta.unsolved} | Complete: ${meta.percentComplete}%\n`)
  process.exit(0)
}

// Default: Full report
console.log(`
╔═══════════════════════════════════════════════════════════╗
║      PROBLEM VISUALIZER REGISTRY SYNC & COMPARISON        ║
╚═══════════════════════════════════════════════════════════╝

📊 CATALOG:
   • Total Problems: ${meta.total}
   • Last Updated: ${meta.catalogVersion}

✓ SOLVED:
   • Visualizers Built: ${meta.solved}
   • Percentage: ${meta.percentComplete}%

✗ UNSOLVED:
   • Missing Visualizers: ${meta.unsolved}
   • Remaining: ${meta.unsolved > 0 ? 'See below' : 'NONE - ALL SOLVED! 🎉'}

${unsolved.length > 0 ? `\nFirst 30 Unsolved:\n${unsolved.slice(0, 30).map(p => `   ${p.number}. ${p.title}`).join('\n')}\n` : ''}
Commands:
   node sync.mjs --list    Show all unsolved
   node sync.mjs --count   Show counts only
   node sync.mjs --clear   Clear cache

`)

// Save metadata
fs.writeFileSync(path.join(devDbDir, 'meta.json'), JSON.stringify(meta, null, 2))
fs.writeFileSync(path.join(devDbDir, 'solved.json'), JSON.stringify(Array.from(solvedSet).sort(), null, 2))
fs.writeFileSync(path.join(devDbDir, 'unsolved.json'), JSON.stringify(unsolved, null, 2))

console.log(`✓ Sync complete - Data saved to .dev/`)
