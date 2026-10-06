import sweepAndDp from './sweepAndDpBatch.js';
import resourceAndDp from './resourceAndDpBatch.js';
import connectivityAndMatrix from './connectivityAndMatrixBatch.js';
import stateAndFactor from './stateAndFactorBatch.js';
import structuralHard from './structuralHardBatch.js';
import relational from './relationalBatch.js';
import geneticsAndDesign from './geneticsAndDesignBatch.js';
import gridAndExpression from './gridAndExpressionBatch.js';
import partitionAndConstraint from './partitionAndConstraintBatch.js';
import streamAndSearch from './streamAndSearchBatch.js';
import trafficAndTree from './trafficAndTreeBatch.js';
import queryAndTraversal from './queryAndTraversalBatch.js';
import distributionAndRobot from './distributionAndRobotBatch.js';
import requestsAndFrequency from './requestsAndFrequencyBatch.js';
import palindromeAndMeeting from './palindromeAndMeetingBatch.js';
import pathAndRanking from './pathAndRankingBatch.js';

// One registration point for explicit authored modules; no inferred algorithms.
const batches=[sweepAndDp,resourceAndDp,connectivityAndMatrix,stateAndFactor,structuralHard,relational,geneticsAndDesign,gridAndExpression,partitionAndConstraint,streamAndSearch,trafficAndTree,queryAndTraversal,distributionAndRobot,requestsAndFrequency,palindromeAndMeeting,pathAndRanking];
const merge=key=>Object.assign({},...batches.map(batch=>batch[key]??{}));
export const authoredSpecs=merge('specs');
export const authoredSolvers=merge('solvers');
export const authoredPython=merge('python');
export const authoredSql=merge('sql');
export const authoredCases=merge('cases');
export const authoredTags=merge('tags');
export const authoredPseudocodeStages=merge('pseudocodeStages');
export const authoredPythonStages=Object.fromEntries(Object.entries(authoredPython).map(([id,source])=>[id,Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];}))]));
export function validateAuthored(id,input){return batches.find(batch=>id in batch.specs).validate(id,input);}
export function authoredResultStage(id,result,input){return batches.find(batch=>id in batch.specs)?.resultStage?.(id,result,input)??'return';}
export function authoredInputState(id,input){return batches.find(batch=>id in batch.specs)?.inputState?.(id,input)??{};}
export function authoredResultState(id,result){return batches.find(batch=>id in batch.specs)?.resultState?.(id,result)??{};}
