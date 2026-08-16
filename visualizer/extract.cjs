const fs = require('fs');

const registryPath = 'C:\Users\BBBS-AI-01\d\cv\visualizer\src\config\solutionCodeRegistry.js';
const content = fs.readFileSync(registryPath, 'utf8');

const targets = [
  'find-all-anagrams',  // matches 'find-all-anagrams-in-a-string'
  'coin-change',        // matches 'coin-change-2'
  'partition-equal-subset', // exact or close match
  'perfect-squares',    // matches 'perfect-number'
  'kth-largest-element', // exact
  'longest-palindrome', // close to 'longest-palindromic-subsequence'
  'candy',              // exact for distribute candies
  'minimum-path-sum',   // possibly in registry
  'fibonacci-number',   // possibly in registry
  'path-sum-ii',        // check
  'serialize-deserialize', // for nary tree
];

const result = {};

// Extract each solution
for (const slug of targets) {
  // Look for the slug pattern in the file
  const regex = new RegExp(`'${slug.replace(/[-]/g, '[-\w]*?')}'\s*:\s*\[([\s\S]*?)\]\s*[,}]`, 'm');
  
  // Try exact match first
  let exactRegex = new RegExp(`'${slug}'\s*:\s*\[([\s\S]*?)\]\s*[,}]`);
  let match = content.match(exactRegex);
  
  if (match) {
    console.log(`Found: ${slug}`);
    // Parse the array content - it's already in JSON format
    try {
      const arrayStr = '[' + match[1] + ']';
      const lines = JSON.parse(arrayStr);
      result[slug] = lines;
    } catch (e) {
      console.log(`Failed to parse ${slug}: ${e.message}`);
    }
  }
}

console.log(JSON.stringify(result, null, 2));
