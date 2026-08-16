import fs from 'fs';
import path from 'path';

const basePath = 'C:\\Users\\BBBS-AI-01\\d\\cv\\visualizer\\src\\problems';

const problems = [
  { num: '565', title: 'Array Nesting', slug: 'array-nesting', diff: 'Medium', tags: 'Array', accent: '#f97316' },
  { num: '566', title: 'Reshape Matrix', slug: 'reshape-matrix', diff: 'Easy', tags: 'Array', accent: '#06b6d4' },
  { num: '567', title: 'Permutation in String', slug: 'permutation-in-string', diff: 'Medium', tags: 'String, Sliding Window', accent: '#8b5cf6' },
  { num: '568', title: 'Maximum Vacation Days', slug: 'maximum-vacation-days', diff: 'Hard', tags: 'DP', accent: '#ec4899' },
  { num: '569', title: 'Median Salary', slug: 'median-salary', diff: 'Medium', tags: 'SQL', accent: '#f59e0b' },
  { num: '570', title: 'Managers with 5+ Reports', slug: 'managers-with-5-reports', diff: 'Medium', tags: 'SQL', accent: '#10b981' },
  { num: '571', title: 'Find Median Given Frequency', slug: 'find-median-given-frequency', diff: 'Hard', tags: 'SQL, Binary Search', accent: '#ef4444' },
  { num: '572', title: 'Subtree of Another Tree', slug: 'subtree-of-another-tree', diff: 'Easy', tags: 'Tree, DFS', accent: '#06b6d4' },
  { num: '573', title: 'Squirrel Distribution', slug: 'squirrel-distribution', diff: 'Medium', tags: 'Array, Greedy', accent: '#8b5cf6' },
  { num: '574', title: 'Winning Candidate', slug: 'winning-candidate', diff: 'Medium', tags: 'SQL', accent: '#f97316' },
  { num: '575', title: 'Distribute Candies', slug: 'distribute-candies', diff: 'Easy', tags: 'Array', accent: '#10b981' },
  { num: '576', title: 'Out of Boundary Paths', slug: 'out-of-boundary-paths', diff: 'Medium', tags: 'DP, DFS', accent: '#ec4899' },
  { num: '577', title: 'Employee Bonus', slug: 'employee-bonus', diff: 'Medium', tags: 'SQL', accent: '#f59e0b' },
  { num: '578', title: 'Get Highest Answer Rate', slug: 'get-highest-answer-rate', diff: 'Medium', tags: 'SQL', accent: '#06b6d4' },
  { num: '579', title: 'Find Cumulative Salary', slug: 'find-cumulative-salary', diff: 'Medium', tags: 'SQL', accent: '#8b5cf6' },
  { num: '580', title: 'Count Student Number', slug: 'count-student-number', diff: 'Medium', tags: 'SQL', accent: '#10b981' },
  { num: '581', title: 'Shortest Unsorted Continuous Subarray', slug: 'shortest-unsorted-continuous-subarray', diff: 'Easy', tags: 'Array', accent: '#f97316' },
  { num: '582', title: 'Kill Process', slug: 'kill-process', diff: 'Medium', tags: 'Tree, Hash', accent: '#ef4444' },
  { num: '583', title: 'Delete Operation for Two Strings', slug: 'delete-operation-for-two-strings', diff: 'Medium', tags: 'DP, String', accent: '#06b6d4' },
  { num: '584', title: 'Find Customer Referee', slug: 'find-customer-referee', diff: 'Easy', tags: 'SQL', accent: '#f59e0b' },
];

problems.forEach(prob => {
  const dir = path.join(basePath, `Problem${prob.num}`);
  const indexPath = path.join(dir, 'index.jsx');

  const content = `export const meta = {
  number: "${prob.num}",
  title: "${prob.title}",
  slug: "${prob.slug}",
  difficulty: "${prob.diff}",
  tags: [${prob.tags.split(',').map(t => `"${t.trim()}"`).join(', ')}],
  description: "Trace the algorithm step-by-step with interactive visualization.",
  accent: "${prob.accent}",
};
export { default } from "./*Visualizer";
`;

  fs.writeFileSync(indexPath, content.replace('*Visualizer',
    prob.num <= 567 ? ['ArrayNestingVisualizer', 'ReshapeMatrixVisualizer', 'PermutationInStringVisualizer'][prob.num - 565]
    : prob.num === 568 ? 'MaximumVacationDaysVisualizer'
    : prob.num === 569 ? 'MedianSalaryVisualizer'
    : prob.num === 570 ? 'ManagersWith5ReportsVisualizer'
    : 'DefaultVisualizer'
  ), 'utf8');

  console.log(`✓ Fixed Problem${prob.num}: ${prob.title}`);
});

console.log('\\n✓ All index.jsx files fixed with proper titles');
