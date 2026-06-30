#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const updates = {
  316: { name: 'RemoveDuplicateLettersVisualizer', className: 'remove-duplicate-letters' },
  317: { name: 'ShortestDistancefromAllBuildingsVisualizer', className: 'shortest-distance-all-buildings' },
  318: { name: 'MaximumProductofWordLengthsVisualizer', className: 'maximum-product-word-lengths' },
  319: { name: 'BulbSwitcherVisualizer', className: 'bulb-switcher' },
  320: { name: 'GeneralizedAbbreviationVisualizer', className: 'generalized-abbreviation' },
};

Object.entries(updates).forEach(([problemNum, config]) => {
  const basePath = `/c/Users/BBBS-AI-01/d/cv/visualizer/src/problems/Problem${problemNum}`;
  const filePath = path.join(basePath, `${config.name}.jsx`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping Problem${problemNum}: file not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update generateSteps function to add relatedLines
  content = content.replace(
    /phase: 'init',\s*activeLine: 1,\s*message:/,
    `phase: 'init',
    activeLine: 1,
    relatedLines: [1],
    message:`
  );
  
  content = content.replace(
    /phase: 'process',\s*activeLine: 3,\s*message:/,
    `phase: 'process',
    activeLine: 3,
    relatedLines: [3],
    message:`
  );
  
  content = content.replace(
    /phase: 'done',\s*activeLine: 5,\s*message:/,
    `phase: 'done',
    activeLine: 5,
    relatedLines: [5],
    message:`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated Problem${problemNum}`);
});
