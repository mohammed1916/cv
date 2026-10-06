import sweepAndDp from './sweepAndDpBatch.js';
import resourceAndDp from './resourceAndDpBatch.js';

// One registration point for explicit authored modules; no inferred algorithms.
const batches=[sweepAndDp,resourceAndDp];
const merge=key=>Object.assign({},...batches.map(batch=>batch[key]??{}));
export const authoredSpecs=merge('specs');
export const authoredSolvers=merge('solvers');
export const authoredPython=merge('python');
export const authoredCases=merge('cases');
export const authoredTags=merge('tags');
export const authoredPseudocodeStages=merge('pseudocodeStages');
export const authoredPythonStages=Object.fromEntries(Object.entries(authoredPython).map(([id,source])=>[id,Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];}))]));
export function validateAuthored(id,input){return batches.find(batch=>id in batch.specs).validate(id,input);}
export function authoredResultStage(id,result,input){return batches.find(batch=>id in batch.specs)?.resultStage?.(id,result,input)??'return';}
