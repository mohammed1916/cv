#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  
  // Update generateSteps function
  content = content.replace(
    /steps\.push\(\{\s*phase:\s*'init',\s*activeLine:\s*1,\s*message:/,
    `steps.push({
    phase: 'init',
    activeLine: 1,
    relatedLines: [1],
    message:`
  );
  
  content = content.replace(
    /steps\.push\(\{\s*phase:\s*'process',\s*activeLine:\s*3,\s*message:/,
    `steps.push({
    phase: 'process',
    activeLine: 3,
    relatedLines: [3],
    message:`
  );
  
  content = content.replace(
    /steps\.push\(\{\s*phase:\s*'done',\s*activeLine:\s*5,\s*message:/,
    `steps.push({
    phase: 'done',
    activeLine: 5,
    relatedLines: [5],
    message:`
  );
  
  // Update hook calls
  const oldHooks = /const \{ currentStep, isPlaying, setIsPlaying, setCurrentStep, speed, setSpeed \} = usePlaybackState\(\{[\s\S]*?\}\)/;
  const newHooks = `const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])`;
  
  if (oldHooks.test(content)) {
    content = content.replace(oldHooks, newHooks);
  }
  
  // Update connectivity
  const oldConnectivity = /const connectivity = useCodeVisualConnectivity\(steps, currentStep\)\s*const patternOverlay = usePatternOverlay\(\)/;
  const newConnectivity = `const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })`;
  
  if (oldConnectivity.test(content)) {
    content = content.replace(oldConnectivity, newConnectivity);
  }
  
  // Remove handleStepClick
  content = content.replace(/\s*const handleStepClick = useCallback\(\(index\) => \{[\s\S]*?\}, \[setCurrentStep, setIsPlaying\]\)\s*/m, '\n');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated Problem${problemNum}`);
});
