import fs from 'fs';
import path from 'path';

const BASE_PATH = 'C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems';

const problems = [
  {
    number: '565',
    title: 'Array Nesting',
    slug: 'array-nesting',
    difficulty: 'Medium',
    tags: ['Array'],
    description: 'Trace through cyclic array indices to find the longest cycle.',
    accent: '#f97316'
  },
  {
    number: '566',
    title: 'Reshape Matrix',
    slug: 'reshape-matrix',
    difficulty: 'Easy',
    tags: ['Array'],
    description: 'Reshape an m×n matrix into an r×c matrix using linear indexing.',
    accent: '#06b6d4'
  },
  {
    number: '567',
    title: 'Permutation in String',
    slug: 'permutation-in-string',
    difficulty: 'Medium',
    tags: ['String', 'Sliding Window'],
    description: 'Find if a permutation of one string is a substring using a sliding window.',
    accent: '#8b5cf6'
  },
  {
    number: '568',
    title: 'Maximum Vacation Days',
    slug: 'maximum-vacation-days',
    difficulty: 'Hard',
    tags: ['DP'],
    description: 'Plan vacations across cities maximizing free days using dynamic programming.',
    accent: '#ec4899'
  },
  {
    number: '569',
    title: 'Median Salary',
    slug: 'median-salary',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Calculate median salary by department using SQL window functions.',
    accent: '#f59e0b'
  },
  {
    number: '570',
    title: 'Managers with 5+ Reports',
    slug: 'managers-with-5-reports',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Find managers who supervise 5 or more direct reports.',
    accent: '#10b981'
  },
  {
    number: '571',
    title: 'Find Median Given Frequency',
    slug: 'find-median-given-frequency',
    difficulty: 'Hard',
    tags: ['SQL', 'Binary Search'],
    description: 'Calculate cumulative median from frequency array using binary search.',
    accent: '#ef4444'
  },
  {
    number: '572',
    title: 'Subtree of Another Tree',
    slug: 'subtree-of-another-tree',
    difficulty: 'Easy',
    tags: ['Tree', 'DFS'],
    description: 'Check if one tree is a subtree of another using DFS validation.',
    accent: '#06b6d4'
  },
  {
    number: '573',
    title: 'Squirrel Distribution',
    slug: 'squirrel-distribution',
    difficulty: 'Medium',
    tags: ['Array', 'Greedy'],
    description: 'Place acorns optimally to satisfy squirrel demands using greedy allocation.',
    accent: '#8b5cf6'
  },
  {
    number: '574',
    title: 'Winning Candidate',
    slug: 'winning-candidate',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Find the election winner by counting votes per candidate.',
    accent: '#f97316'
  },
  {
    number: '575',
    title: 'Distribute Candies',
    slug: 'distribute-candies',
    difficulty: 'Easy',
    tags: ['Array'],
    description: 'Distribute minimum candies ensuring constraints are satisfied.',
    accent: '#10b981'
  },
  {
    number: '576',
    title: 'Out of Boundary Paths',
    slug: 'out-of-boundary-paths',
    difficulty: 'Medium',
    tags: ['DP', 'DFS'],
    description: 'Count paths that move a ball out of grid boundaries.',
    accent: '#ec4899'
  },
  {
    number: '577',
    title: 'Employee Bonus',
    slug: 'employee-bonus',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Join employee and bonus tables to find employees without bonuses.',
    accent: '#f59e0b'
  },
  {
    number: '578',
    title: 'Get Highest Answer Rate',
    slug: 'get-highest-answer-rate',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Calculate survey question answer rates and find the highest.',
    accent: '#06b6d4'
  },
  {
    number: '579',
    title: 'Find Cumulative Salary',
    slug: 'find-cumulative-salary',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Calculate cumulative salary using SQL window functions.',
    accent: '#8b5cf6'
  },
  {
    number: '580',
    title: 'Count Student Number',
    slug: 'count-student-number',
    difficulty: 'Medium',
    tags: ['SQL'],
    description: 'Count students per department including those with zero enrollment.',
    accent: '#10b981'
  },
  {
    number: '581',
    title: 'Shortest Unsorted Continuous Subarray',
    slug: 'shortest-unsorted-continuous-subarray',
    difficulty: 'Easy',
    tags: ['Array'],
    description: 'Find minimum length subarray to sort for entire array to be sorted.',
    accent: '#f97316'
  },
  {
    number: '582',
    title: 'Kill Process',
    slug: 'kill-process',
    difficulty: 'Medium',
    tags: ['Tree', 'Hash'],
    description: 'Kill a process and all its children in a process tree.',
    accent: '#ef4444'
  },
  {
    number: '583',
    title: 'Delete Operation for Two Strings',
    slug: 'delete-operation-for-two-strings',
    difficulty: 'Medium',
    tags: ['DP', 'String'],
    description: 'Find minimum character deletions for two strings to match using LCS variant.',
    accent: '#06b6d4'
  },
  {
    number: '584',
    title: 'Find Customer Referee',
    slug: 'find-customer-referee',
    difficulty: 'Easy',
    tags: ['SQL'],
    description: 'Find customers without a referee, handling NULL values correctly.',
    accent: '#f59e0b'
  },
];

// Create directories
problems.forEach(problem => {
  const dir = path.join(BASE_PATH, `Problem${problem.number}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('All directories created successfully!');
