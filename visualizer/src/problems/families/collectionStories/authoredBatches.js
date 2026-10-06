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
import windowAndOrder from './windowAndOrderBatch.js';
import dependencyAndRecovery from './dependencyAndRecoveryBatch.js';
import stampAndSchedule from './stampAndScheduleBatch.js';
import corridorAndEvidence from './corridorAndEvidenceBatch.js';
import hashAndPainting from './hashAndPaintingBatch.js';
import selectionAndBitset from './selectionAndBitsetBatch.js';
import capacityAndFrequency from './capacityAndFrequencyBatch.js';
import rankAndConstruction from './rankAndConstructionBatch.js';
import raceAndAncestry from './raceAndAncestryBatch.js';
import pathsAndCoverage from './pathsAndCoverageBatch.js';
import updatesAndChoices from './updatesAndChoicesBatch.js';
import prefixAndEncryption from './prefixAndEncryptionBatch.js';
import gardenAndProduct from './gardenAndProductBatch.js';
import transactionsAndCorners from './transactionsAndCornersBatch.js';
import earlyCanonical from './earlyCanonicalBatch.js';
import structureCanonical from './structureCanonicalBatch.js';
import rollingAndPalindrome from './rollingAndPalindromeBatch.js';
import vacationPlanning from './vacationPlanningBatch.js';
import parentSuccessor from './parentSuccessorBatch.js';
import activityAndBonus from './activityAndBonusBatch.js';
import quadUnion from './quadUnionBatch.js';
import squirrelAndSquare from './squirrelAndSquareBatch.js';
import medianAndGroups from './medianAndGroupsBatch.js';
import naryTraversal from './naryTraversalBatch.js';
import tagAndFraction from './tagAndFractionBatch.js';
import fileSystem from './fileSystemBatch.js';
import bitsAndText from './bitsAndTextBatch.js';
import friendsAndRuns from './friendsAndRunsBatch.js';
import recordSelection from './recordSelectionBatch.js';
import relationalTransforms from './relationalTransformsBatch.js';
import unionRelations from './unionRelationsBatch.js';
import malwareComponents from './malwareComponentsBatch.js';
import unionRegions from './unionRegionsBatch.js';
import unionPaths from './unionPathsBatch.js';

// One registration point for explicit authored modules; no inferred algorithms.
const batches=[sweepAndDp,resourceAndDp,connectivityAndMatrix,stateAndFactor,structuralHard,relational,geneticsAndDesign,gridAndExpression,partitionAndConstraint,streamAndSearch,trafficAndTree,queryAndTraversal,distributionAndRobot,requestsAndFrequency,palindromeAndMeeting,pathAndRanking,windowAndOrder,dependencyAndRecovery,stampAndSchedule,corridorAndEvidence,hashAndPainting,selectionAndBitset,capacityAndFrequency,rankAndConstruction,raceAndAncestry,pathsAndCoverage,updatesAndChoices,prefixAndEncryption,gardenAndProduct,transactionsAndCorners,earlyCanonical,structureCanonical];
batches.push(rollingAndPalindrome,vacationPlanning,parentSuccessor,activityAndBonus,quadUnion,squirrelAndSquare,medianAndGroups,naryTraversal,tagAndFraction,fileSystem,bitsAndText,friendsAndRuns,recordSelection,relationalTransforms,unionRelations,malwareComponents,unionRegions,unionPaths);
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
