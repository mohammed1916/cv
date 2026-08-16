#!/usr/bin/env node

/**
 * Integrate Visualizers Script
 * Processes generated visualizer code and writes to problem folders
 * Updates registry automatically
 *
 * Usage:
 *   node integrate-visualizers.mjs <folder>
 *   Example: node integrate-visualizers.mjs ./generated-visualizers
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const problemsDir = path.join(__dirname, 'src/problems')
const registryPath = path.join(__dirname, 'src/config/problemVisualizerRegistry.js')

/**
 * Parse visualizer metadata from component
 */
function extractMetadata(jsxCode) {
  // Try to extract meta from comments or hardcoded values
  const numberMatch = jsxCode.match(/number:\s*['"](\d+)['"]/i) || jsxCode.match(/#(\d+)/)
  const slugMatch = jsxCode.match(/slug['":]?\s*['"]([^'"]+)['"]/) || jsxCode.match(/\(([^)]+)\)/)

  return {
    number: numberMatch?.[1] || null,
    slug: slugMatch?.[1] || null,
  }
}

/**
 * Create index.jsx for problem
 */
function createIndexFile(problemName, number, slug, difficulty, tags) {
  const safeName = problemName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/Visualizer$/, '')

  return `export const meta = {
  number: '${number}',
  title: '${safeName}',
  slug: '${slug}',
  difficulty: '${difficulty}',
  tags: [${tags.map(t => `'${t}'`).join(', ')}],
  description: 'Interactive visualization of ${safeName}.',
}
export { default } from './${problemName}Visualizer'
`
}

/**
 * Update registry with new solved problem
 */
function updateRegistry(slug) {
  let registryText = fs.readFileSync(registryPath, 'utf8')

  // Check if already in registry
  if (registryText.includes(`'${slug}'`)) {
    console.log(`  ⚠ ${slug} already in registry`)
    return false
  }

  // Add to SOLVED_SLUGS before the closing bracket
  const pattern = /(\s+'koko-eating-bananas',\s+)/
  registryText = registryText.replace(pattern, `$1  '${slug}',\n  `)

  fs.writeFileSync(registryPath, registryText)
  return true
}

/**
 * Main integration
 */
console.log('📦 Visualizer Integration Tool\n')

// For now, just show what would be integrated
console.log('Usage: Place generated visualizer JSX files in a folder and run:')
console.log('  node integrate-visualizers.mjs ./generated\n')
console.log('This script will:')
console.log('  1. Read JSX visualizer code')
console.log('  2. Create index.jsx with metadata')
console.log('  3. Update problemVisualizerRegistry.js')
console.log('  4. Run sync.mjs to update .dev/ cache\n')

export { extractMetadata, createIndexFile, updateRegistry }
