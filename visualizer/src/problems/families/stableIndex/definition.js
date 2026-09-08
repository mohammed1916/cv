import { buildTrace, parseInput, code } from './algorithm'

const phases = [
  { id: 'start', label: 'Input', description: 'Initialize inclusive suffix minima.' },
  { id: 'suffix', label: 'Suffix minimum ←', description: 'Build minima from right to left.' },
  { id: 'check', label: 'Prefix / threshold →', description: 'Update the prefix maximum and compare the instability score with k.' },
  { id: 'done', label: 'Return', description: 'Return the first passing index, or −1 when all fail.' },
]

export function createDefinition({ maxLength, slug }) {
  return {
    parse: text => parseInput(text, maxLength), build: buildTrace, code, phases,
    inputLabel: `nums and k (JSON object, up to ${maxLength} elements)`,
    url: `https://leetcode.com/problems/${slug}/`,
    complexity: 'O(n) time and O(n) space. The suffix table is built once, and the running prefix maximum avoids rescanning earlier elements.',
    examples: [
      { label: 'Late stable index', input: '{"nums":[5,0,1,4],"k":3}' },
      { label: 'No stable index', input: '{"nums":[3,2,1],"k":1}' },
      { label: 'Singleton zero', input: '{"nums":[0],"k":0}' },
      { label: 'Threshold equality', input: '{"nums":[3,1,2],"k":2}' },
    ],
  }
}
