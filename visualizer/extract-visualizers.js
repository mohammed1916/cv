#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const problems = [
  { number: '257', name: 'BinaryTreePaths', slug: 'binary-tree-paths', difficulty: 'Easy', tags: ['Tree', 'DFS'] },
  { number: '399', name: 'EvaluateDivision', slug: 'evaluate-division', difficulty: 'Medium', tags: ['Graph', 'DFS'] },
  { number: '695', name: 'MaxAreaOfIsland', slug: 'max-area-of-island', difficulty: 'Medium', tags: ['Graph', 'BFS/DFS'] },
  { number: '743', name: 'NetworkDelayTime', slug: 'network-delay-time', difficulty: 'Medium', tags: ['Graph', 'Dijkstra'] },
  { number: '547', name: 'NumberOfProvinces', slug: 'number-of-provinces', difficulty: 'Medium', tags: ['Union-Find', 'Graph'] },
  { number: '279', name: 'PerfectSquares', slug: 'perfect-squares', difficulty: 'Medium', tags: ['DP', 'Math'] },
  { number: '371', name: 'SumOfTwoIntegers', slug: 'sum-of-two-integers', difficulty: 'Medium', tags: ['Bit Manipulation'] },
  { number: '621', name: 'TaskScheduler', slug: 'task-scheduler', difficulty: 'Medium', tags: ['Greedy', 'Array'] },
];

const workflowDir = path.join(
  process.env.USERPROFILE,
  '.claude',
  'projects',
  'c--Users-BBBS-AI-01-d-cv-visualizer',
  'f78ca0a8-7637-458b-b25a-75ae9885d798',
  'subagents',
  'workflows',
  'wf_405bac3b-03b'
);

function extractCode(jsonlFile) {
  try {
    const content = fs.readFileSync(jsonlFile, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());

    let fullMessage = '';
    lines.forEach(line => {
      try {
        const json = JSON.parse(line);
        if (json.type === 'text' && json.content) {
          fullMessage += json.content;
        }
      } catch (e) {}
    });

    return fullMessage;
  } catch (e) {
    return null;
  }
}

const agentFiles = fs.readdirSync(workflowDir)
  .filter(f => f.startsWith('agent-') && f.endsWith('.jsonl'))
  .sort();

console.log(`Found ${agentFiles.length} agent files, extracting code for ${problems.length} problems...`);

agentFiles.slice(0, problems.length).forEach((file, idx) => {
  const problem = problems[idx];
  const code = extractCode(path.join(workflowDir, file));

  if (!code || code.length < 100) {
    console.log(`⚠ Problem ${idx + 1}: No valid code extracted from ${file}`);
    return;
  }

  // Extract JSX code block
  const jsxMatch = code.match(/```jsx\n?([\s\S]*?)\n?```/);
  const jsx = jsxMatch ? jsxMatch[1] : code;

  const visualizerFile = path.join(
    __dirname,
    'src',
    'problems',
    problem.name,
    `${problem.name}Visualizer.jsx`
  );

  const indexFile = path.join(
    __dirname,
    'src',
    'problems',
    problem.name,
    'index.jsx'
  );

  // Write visualizer
  fs.mkdirSync(path.dirname(visualizerFile), { recursive: true });
  fs.writeFileSync(visualizerFile, jsx);

  // Write index with meta
  const meta = `export const meta = {
  number: '${problem.number}',
  title: '${problem.name.replace(/([A-Z])/g, ' $1').trim()}',
  slug: '${problem.slug}',
  difficulty: '${problem.difficulty}',
  tags: [${problem.tags.map(t => `'${t}'`).join(', ')}],
  description: '${problem.tags[0].toLowerCase()} solution.',
  accent: '#${Math.floor(Math.random()*16777215).toString(16)}',
}
export { default } from './${problem.name}Visualizer'`;

  fs.writeFileSync(indexFile, meta);

  console.log(`✓ ${problem.number}. ${problem.name} (${jsx.length} chars)`);
});

console.log('\nDone!');
