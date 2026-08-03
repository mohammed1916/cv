/**
 * Sync Problems Script
 * Compares leetcodeCatalog.json against problemVisualizerRegistry.js
 * Generates unsolved list automatically
 *
 * Run: node src/config/syncProblems.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load catalog
const catalogPath = path.join(__dirname, '../../public/data/leetcodeCatalog.json')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

// Load current registry (as text to extract SOLVED_SLUGS)
const registryPath = path.join(__dirname, './problemVisualizerRegistry.js')
const registryText = fs.readFileSync(registryPath, 'utf8')

// Extract solved slugs from registry
const solvedMatch = registryText.match(/const SOLVED_SLUGS = new Set\(\[([\s\S]*?)\]\)/)
const solvedList = solvedMatch ? solvedMatch[1].split('\n').filter(l => l.includes("'")).map(l => l.match(/'([^']+)'/)?.[1]).filter(Boolean) : []
const solvedSet = new Set(solvedList)

// Compare with catalog
const unsolved = catalog.problems
  .filter(p => !solvedSet.has(p.slug))
  .sort((a, b) => Number(a.number) - Number(b.number))

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  catalog: {
    total: catalog.problems.length,
    lastUpdated: catalog.generatedAt,
  },
  registry: {
    solved: solvedSet.size,
    unsolved: unsolved.length,
    percentComplete: Math.round((solvedSet.size / catalog.problems.length) * 100),
  },
  unsolved: unsolved.slice(0, 20), // First 20 unsolved
  unsolvedCount: unsolved.length,
}

console.log(`
╔════════════════════════════════════════════════╗
║         PROBLEM VISUALIZER SYNC REPORT         ║
╚════════════════════════════════════════════════╝

📊 Catalog: ${report.catalog.total} total problems
✓ Registry: ${report.registry.solved} solved
✗ Unsolved: ${report.registry.unsolved} problems
📈 Progress: ${report.registry.percentComplete}%

${unsolved.length > 0 ? `First 20 Unsolved Problems:\n${unsolved.slice(0, 20).map(p => `  ${p.number}. ${p.title}`).join('\n')}\n` : '✅ ALL PROBLEMS SOLVED!'}
`)

// Save report for reference
const reportPath = path.join(__dirname, '.sync-report.json')
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

console.log(`Report saved to: ${reportPath}`)

// Generate registry code snippet for copy-paste
if (unsolved.length > 0) {
  const newSlugs = unsolved.slice(0, 20).map(p => `  '${p.slug}',`).join('\n')
  console.log(`
To add to SOLVED_SLUGS, copy these slugs:
${newSlugs}
`)
}

export { report, unsolved }
