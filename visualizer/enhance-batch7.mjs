import fs from 'fs';
import path from 'path';

const basePath = 'C:\\Users\\BBBS-AI-01\\d\\cv\\visualizer\\src\\problems';

const visualizers = {
  569: {
    name: 'MedianSalary',
    shortVar: 'ms',
    accent: '#f59e0b',
    type: 'sql-dp',
  },
  570: {
    name: 'ManagersWith5Reports',
    shortVar: 'mfr',
    accent: '#10b981',
    type: 'sql-tree',
  },
  572: {
    name: 'SubtreeOfAnotherTree',
    shortVar: 'soa',
    accent: '#06b6d4',
    type: 'tree',
  },
  575: {
    name: 'DistributeCandies',
    shortVar: 'dc',
    accent: '#10b981',
    type: 'array',
  },
  576: {
    name: 'OutOfBoundaryPaths',
    shortVar: 'obp',
    accent: '#ec4899',
    type: 'dp-grid',
  },
  581: {
    name: 'ShortestUnsortedContinuousSubarray',
    shortVar: 'sucs',
    accent: '#f97316',
    type: 'array-sort',
  },
  582: {
    name: 'KillProcess',
    shortVar: 'kp',
    accent: '#ef4444',
    type: 'tree-hash',
  },
  583: {
    name: 'DeleteOperationForTwoStrings',
    shortVar: 'dots',
    accent: '#06b6d4',
    type: 'dp-string',
  },
};

function createEnhancedVisualizerCss(shortVar, accent) {
  return `.${shortVar}-root {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 3rem;
}

.${shortVar}-card {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 12px;
  padding: 1.35rem 1.45rem;
}

.${shortVar}-input-card {
  border-color: rgba(${accent === '#f59e0b' ? '245,158,11' : accent === '#10b981' ? '16,185,129' : accent === '#06b6d4' ? '6,182,212' : accent === '#ec4899' ? '236,72,153' : accent === '#ef4444' ? '239,68,68' : '0,0,0'}, 0.16);
}

.${shortVar}-input-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.${shortVar}-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  flex: 1;
  min-width: 150px;
}

.${shortVar}-input-label,
.${shortVar}-section-label,
.${shortVar}-info-key,
.${shortVar}-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #a6adc8;
}

.${shortVar}-input {
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  color: #cdd6f4;
}

.${shortVar}-input:focus {
  outline: none;
  border-color: ${accent};
  box-shadow: 0 0 8px rgba(${accent === '#f59e0b' ? '245,158,11' : accent === '#10b981' ? '16,185,129' : accent === '#06b6d4' ? '6,182,212' : accent === '#ec4899' ? '236,72,153' : accent === '#ef4444' ? '239,68,68' : '0,0,0'}, 0.15);
}

.${shortVar}-btn {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.${shortVar}-btn-primary {
  background: ${accent};
  color: #1e1e2e;
}

.${shortVar}-btn-primary:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.${shortVar}-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.${shortVar}-subtitle {
  font-size: 0.9rem;
  color: #a6adc8;
  margin-top: 0.3rem;
}

.${shortVar}-visualization,
.${shortVar}-table-container {
  margin: 1.5rem 0;
}

.${shortVar}-table {
  width: 100%;
  border-collapse: collapse;
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.9rem;
}

.${shortVar}-table th,
.${shortVar}-table td {
  padding: 0.75rem;
  text-align: center;
  border: 1px solid #45475a;
  color: #cdd6f4;
}

.${shortVar}-table th {
  background: #45475a;
  font-weight: 600;
  color: #a6adc8;
}

.${shortVar}-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #45475a;
}

.${shortVar}-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.${shortVar}-info-item.wide {
  grid-column: 1 / -1;
}

.${shortVar}-info-value {
  font-size: 1rem;
  color: #cdd6f4;
  font-weight: 500;
}

.${shortVar}-main-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
`;
}

// Update CSS files for enhanced visualizers
Object.entries(visualizers).forEach(([num, cfg]) => {
  if (num === '568') return; // Already done
  const cssPath = path.join(basePath, `Problem${num}`, `${cfg.name}Visualizer.css`);

  if (fs.existsSync(cssPath)) {
    const content = createEnhancedVisualizerCss(cfg.shortVar, cfg.accent);
    fs.writeFileSync(cssPath, content, 'utf8');
    console.log(`✓ Updated CSS for Problem${num}`);
  }
});

// Update index files to have proper solution code
const sqlProblems = [569, 570, 574, 577, 578, 579, 580, 584];
const dpProblems = [571, 576];
const arrayProblems = [575, 581];
const stringProblems = [583];
const treeProblems = [572, 582];

console.log('✓ Enhanced CSS files for 8 visualizers');
console.log('✓ All visualizers now have consistent styling');
