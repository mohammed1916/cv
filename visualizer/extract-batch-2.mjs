#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const problems = [
  { number: '9', name: 'PalindromeNumber', slug: 'palindrome-number', difficulty: 'Easy', tags: ['Math'] },
  { number: '12', name: 'IntegerToRoman', slug: 'integer-to-roman', difficulty: 'Medium', tags: ['String', 'Math'] },
  { number: '13', name: 'RomanToInteger', slug: 'roman-to-integer', difficulty: 'Easy', tags: ['String', 'Hash Map'] },
  { number: '14', name: 'LongestCommonPrefix', slug: 'longest-common-prefix', difficulty: 'Easy', tags: ['String'] },
  { number: '15', name: 'ThreeSum', slug: '3sum', difficulty: 'Medium', tags: ['Array', 'Two Pointers'] },
  { number: '16', name: 'ThreeSumClosest', slug: '3sum-closest', difficulty: 'Medium', tags: ['Array', 'Two Pointers'] },
  { number: '18', name: 'FourSum', slug: '4sum', difficulty: 'Medium', tags: ['Array', 'Two Pointers'] },
  { number: '19', name: 'RemoveNthNode', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium', tags: ['Linked List', 'Two Pointers'] },
  { number: '20', name: 'ValidParentheses', slug: 'valid-parentheses', difficulty: 'Easy', tags: ['Stack', 'String'] },
  { number: '24', name: 'SwapNodesInPairs', slug: 'swap-nodes-in-pairs', difficulty: 'Medium', tags: ['Linked List'] },
]

const workflowDir = path.join(
  process.env.USERPROFILE,
  '.claude',
  'projects',
  'c--Users-BBBS-AI-01-d-cv-visualizer',
  'f78ca0a8-7637-458b-b25a-75ae9885d798',
  'subagents',
  'workflows',
  'wf_63112f65-bf8'
)

function extractJSXFromAgent(jsonlFile) {
  try {
    const content = fs.readFileSync(jsonlFile, 'utf8')
    const lines = content.split('\n').filter(l => l.trim())

    let code = ''
    for (const line of lines) {
      try {
        const obj = JSON.parse(line)
        if (obj.content && Array.isArray(obj.content)) {
          for (const item of obj.content) {
            if (item.type === 'text' && item.text) {
              code = item.text
            }
          }
        }
      } catch (e) {}
    }

    if (code.length > 500 && code.includes('import')) {
      // Extract code blocks
      const jsxMatch = code.match(/```jsx\n?([\s\S]*?)\n?```/) || code.match(/```\n?([\s\S]*?)\n?```/)
      return jsxMatch ? jsxMatch[1] : code
    }
    return null
  } catch (e) {
    return null
  }
}

// Get all agent files sorted
const agentFiles = fs
  .readdirSync(workflowDir)
  .filter(f => f.startsWith('agent-') && f.endsWith('.jsonl'))
  .sort()

console.log(`\n📦 Extracting Batch 2 Visualizers\n`)
console.log(`Found ${agentFiles.length} agent files\n`)

let extracted = 0
const failed = []

for (let i = 0; i < Math.min(10, agentFiles.length); i++) {
  const problem = problems[i]
  const agentFile = agentFiles[i]

  const jsx = extractJSXFromAgent(path.join(workflowDir, agentFile))

  if (!jsx || jsx.length < 500) {
    console.log(`⚠ ${problem.number}. ${problem.name}: No valid code extracted`)
    failed.push(problem)
    continue
  }

  // Create directories
  const problemDir = path.join(__dirname, 'src', 'problems', problem.name)
  fs.mkdirSync(problemDir, { recursive: true })

  // Write visualizer
  const vizFile = path.join(problemDir, `${problem.name}Visualizer.jsx`)
  fs.writeFileSync(vizFile, jsx)

  // Write index.jsx
  const indexContent = `export const meta = {
  number: '${problem.number}',
  title: '${problem.name.replace(/([A-Z])/g, ' $1').trim().replace(/Visualizer$/, '')}',
  slug: '${problem.slug}',
  difficulty: '${problem.difficulty}',
  tags: [${problem.tags.map(t => `'${t}'`).join(', ')}],
}
export { default } from './${problem.name}Visualizer'`

  const indexFile = path.join(problemDir, 'index.jsx')
  fs.writeFileSync(indexFile, indexContent)

  extracted++
  console.log(`✓ ${problem.number}. ${problem.name}`)
}

console.log(`\n✅ Extracted ${extracted}/${problems.length} visualizers`)

if (failed.length > 0) {
  console.log(`\n⚠ Failed: ${failed.map(p => p.name).join(', ')}`)
}

console.log(`\nNext step: Update registry and run sync`)
