const fs = require('fs');

// Define the target problem slugs
const targetSlugs = [
  'add-binary',
  'coin-change-2',
  'continuous-subarray-sum',
  'detect-capital',
  'distribute-candies-to-people',
  'fibonacci-number',
  'find-all-anagrams-in-a-string',
  'find-bottom-left-tree-value',
  'find-largest-value-each-row',
  'freedom-trail',
  'game-play-analysis-i',
  'game-play-analysis-ii',
  'inorder-successor-bst',
  'kth-largest-element-in-an-array',
  'longest-palindromic-subsequence',
  'longest-uncommon-subsequence-i',
  'longest-uncommon-subsequence-ii',
  'longest-word-dictionary',
  'minimum-path-sum',
  'most-frequent-subtree-sum',
  'perfect-number',
  'add-strings',
  'partition-equal-subset-sum',
  'pacific-atlantic-water-flow',
  'strong-password-checker',
  'valid-word-square',
  'verbal-arithmetic-puzzle',
  'word-squares',
  'expression-tree-from-tokens',
  'serialize-deserialize-nary-tree',
  'flatten-multilevel-dll',
  'minimum-genetic-mutation'
];

// Read the registry file
const registryPath = 'C:\Users\BBBS-AI-01\d\cv\visualizer\src\config\solutionCodeRegistry.js';
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Parse the registry to extract solutions
const results = {};

// Extract each target slug
for (const slug of targetSlugs) {
  // Find the pattern for this slug in the registry
  const pattern = new RegExp(`'${slug}'\s*:\s*\[(.*?)\]`, 's');
  const match = registryContent.match(pattern);
  
  if (match) {
    // Extract the array content
    const arrayContent = match[1];
    // Parse line objects
    const lineMatches = arrayContent.match(/\{\s*line:\s*(\d+),\s*text:\s*"([^"]*)"\s*\}/g);
    
    if (lineMatches) {
      const lines = lineMatches.map(m => {
        const lineMatch = m.match(/line:\s*(\d+),\s*text:\s*"([^"]*)"/);
        return {
          line: parseInt(lineMatch[1]),
          text: lineMatch[2].replace(/\n/g, '\n').replace(/\t/g, '\t')
        };
      });
      results[slug] = lines;
    }
  }
}

// Output results as JSON
console.log(JSON.stringify(results, null, 2));
