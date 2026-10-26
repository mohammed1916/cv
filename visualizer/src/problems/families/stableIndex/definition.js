import authoredExamples0 from '../../../config/examples/local--stableIndex.js';
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
    examples: authoredExamples0,
  }
}
