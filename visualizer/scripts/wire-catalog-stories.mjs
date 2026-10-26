import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';

const { entries } = JSON.parse(fs.readFileSync('docs/catalog-story-inventory.json','utf8'));
let changed = 0;
for (const { folder, kind } of entries) {
  if (kind !== 'catalog-story') continue;
  const file = path.join('src/problems',folder,'index.jsx');
  let source = fs.readFileSync(file,'utf8');
  if (source.includes('withProblemStory(')) continue;
  const tree = parse(source,{sourceType:'module',plugins:['jsx']});
  const node = tree.program.body.find(node => node.type==='ExportDefaultDeclaration'
    || node.type==='ExportNamedDeclaration' && node.specifiers.some(s=>s.exported?.name==='default'));
  if (!node) throw new Error(`${file}: no default export`);
  let component, replacement;
  if (node.type==='ExportNamedDeclaration') {
    if (!node.source || node.specifiers.length!==1) throw new Error(`${file}: review compound export`);
    const imported = node.specifiers[0].local.name;
    component = 'CatalogVisualizer';
    replacement = imported === 'default'
      ? `import CatalogVisualizer from ${JSON.stringify(node.source.value)};`
      : `import { ${imported} as CatalogVisualizer } from ${JSON.stringify(node.source.value)};`;
  } else if (node.declaration.type==='FunctionDeclaration' && node.declaration.id) {
    component = node.declaration.id.name;
    replacement = source.slice(node.declaration.start,node.declaration.end);
  } else {
    component = 'CatalogVisualizer';
    replacement = `const CatalogVisualizer = ${source.slice(node.declaration.start,node.declaration.end)};`;
  }
  source = source.slice(0,node.start)+replacement+source.slice(node.end);
  source = `import withProblemStory from '../../components/shared/withProblemStory';\nimport storyGuide from './storyGuide.json';\n${source}\nexport default withProblemStory(${component}, storyGuide);\n`;
  parse(source,{sourceType:'module',plugins:['jsx']});
  fs.writeFileSync(file,source);
  changed++;
}
console.log(`Connected ${changed} routes; existing authored workspaces were retained.`);
