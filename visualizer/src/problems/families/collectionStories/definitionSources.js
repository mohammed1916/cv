// Build-tool inputs only. Never import this aggregate into a browser component.
import { authoredSpecs, validateAuthored, authoredPython, authoredPythonStages, authoredPseudocodeStages, authoredResultStage, authoredSql, authoredInputState, authoredResultState } from './authoredBatches.js';
import { nextSequenceSpecs, validateNextSequence, nextSequencePython, nextSequencePythonStages } from './nextSequenceBatch.js';
import { graphGridSpecs, validateGraphGrid } from './graphGridSpecs.js';
import { graphGridPython, graphGridPythonStages } from '../python/graphGridPython.js';
import { databaseSpecs, validateDatabase } from './databaseSpecs.js';
import { databaseSchemas, databaseInput } from './databaseAlgorithms.js';
import { databasePython, databasePythonStages, databaseSql } from '../python/databasePython.js';
import { broadSpecs, validateBroad, broadResultStage } from './expansionBroadSpecs.js';
import { broadPython, broadPythonStages } from '../python/broadPython.js';
import { rangeSpecs, validateRange, rangeCodeStage, rangePseudocodeStages } from './expansionRangeSpecs.js';
import { rangePython, rangePythonStages } from '../python/rangePython.js';
import { trieSpecs, validateTrie, triePseudocodeStages } from './trieSpecs.js';
import { triePython, triePythonStages } from '../python/triePython.js';
import { continuedSpecs, validateContinued } from './expansionContinuedSpecs.js';
import { collectionPython } from '../python/collectionPython.js';
import { laterPython } from '../python/laterPython.js';
import { forwardSpecs, validateForward } from './expansionForwardSpecs.js';
import { advanceSpecs, validateAdvance } from './expansionAdvanceSpecs.js';
import { progressSpecs, validateProgress } from './expansionProgressSpecs.js';
import { continuingSpecs, validateContinuing } from './expansionNextSpecs.js';
import { solvers } from './algorithms.js';
import { specs } from './specs.js';
import { collectionStoryMetadata } from './metadata.js';
import { collectionStoryExamples } from '../../../config/collectionStoryExamples.js';
import { nextSpecs, validateNext } from './nextSpecs.js';
import { expansionSpecs, validateExpansion } from './expansionSpecs.js';
import { dpSpecs, validateDP } from './expansionDPSpecs.js';
import { moreSpecs, validateMore } from './expansionMoreSpecs.js';
import { laterSpecs, validateLater } from './expansionLaterSpecs.js';
export const definitionSources = {
  authoredSpecs,
  validateAuthored,
  authoredPython,
  authoredPythonStages,
  authoredPseudocodeStages,
  authoredResultStage,
  authoredSql,
  authoredInputState,
  authoredResultState,
  nextSequenceSpecs,
  validateNextSequence,
  nextSequencePython,
  nextSequencePythonStages,
  graphGridSpecs,
  validateGraphGrid,
  graphGridPython,
  graphGridPythonStages,
  databaseSpecs,
  validateDatabase,
  databaseSchemas,
  databaseInput,
  databasePython,
  databasePythonStages,
  databaseSql,
  broadSpecs,
  validateBroad,
  broadResultStage,
  broadPython,
  broadPythonStages,
  rangeSpecs,
  validateRange,
  rangeCodeStage,
  rangePseudocodeStages,
  rangePython,
  rangePythonStages,
  trieSpecs,
  validateTrie,
  triePseudocodeStages,
  triePython,
  triePythonStages,
  continuedSpecs,
  validateContinued,
  collectionPython,
  laterPython,
  forwardSpecs,
  validateForward,
  advanceSpecs,
  validateAdvance,
  progressSpecs,
  validateProgress,
  continuingSpecs,
  validateContinuing,
  solvers,
  specs,
  collectionStoryMetadata,
  collectionStoryExamples,
  nextSpecs,
  validateNext,
  expansionSpecs,
  validateExpansion,
  dpSpecs,
  validateDP,
  moreSpecs,
  validateMore,
  laterSpecs,
  validateLater,
};
export const definitionOrigins = {
  "authoredSpecs": "./authoredBatches.js",
  "validateAuthored": "./authoredBatches.js",
  "authoredPython": "./authoredBatches.js",
  "authoredPythonStages": "./authoredBatches.js",
  "authoredPseudocodeStages": "./authoredBatches.js",
  "authoredResultStage": "./authoredBatches.js",
  "authoredSql": "./authoredBatches.js",
  "authoredInputState": "./authoredBatches.js",
  "authoredResultState": "./authoredBatches.js",
  "nextSequenceSpecs": "./nextSequenceBatch.js",
  "validateNextSequence": "./nextSequenceBatch.js",
  "nextSequencePython": "./nextSequenceBatch.js",
  "nextSequencePythonStages": "./nextSequenceBatch.js",
  "graphGridSpecs": "./graphGridSpecs.js",
  "validateGraphGrid": "./graphGridSpecs.js",
  "graphGridPython": "../python/graphGridPython.js",
  "graphGridPythonStages": "../python/graphGridPython.js",
  "databaseSpecs": "./databaseSpecs.js",
  "validateDatabase": "./databaseSpecs.js",
  "databaseSchemas": "./databaseAlgorithms.js",
  "databaseInput": "./databaseAlgorithms.js",
  "databasePython": "../python/databasePython.js",
  "databasePythonStages": "../python/databasePython.js",
  "databaseSql": "../python/databasePython.js",
  "broadSpecs": "./expansionBroadSpecs.js",
  "validateBroad": "./expansionBroadSpecs.js",
  "broadResultStage": "./expansionBroadSpecs.js",
  "broadPython": "../python/broadPython.js",
  "broadPythonStages": "../python/broadPython.js",
  "rangeSpecs": "./expansionRangeSpecs.js",
  "validateRange": "./expansionRangeSpecs.js",
  "rangeCodeStage": "./expansionRangeSpecs.js",
  "rangePseudocodeStages": "./expansionRangeSpecs.js",
  "rangePython": "../python/rangePython.js",
  "rangePythonStages": "../python/rangePython.js",
  "trieSpecs": "./trieSpecs.js",
  "validateTrie": "./trieSpecs.js",
  "triePseudocodeStages": "./trieSpecs.js",
  "triePython": "../python/triePython.js",
  "triePythonStages": "../python/triePython.js",
  "continuedSpecs": "./expansionContinuedSpecs.js",
  "validateContinued": "./expansionContinuedSpecs.js",
  "collectionPython": "../python/collectionPython.js",
  "laterPython": "../python/laterPython.js",
  "forwardSpecs": "./expansionForwardSpecs.js",
  "validateForward": "./expansionForwardSpecs.js",
  "advanceSpecs": "./expansionAdvanceSpecs.js",
  "validateAdvance": "./expansionAdvanceSpecs.js",
  "progressSpecs": "./expansionProgressSpecs.js",
  "validateProgress": "./expansionProgressSpecs.js",
  "continuingSpecs": "./expansionNextSpecs.js",
  "validateContinuing": "./expansionNextSpecs.js",
  "solvers": "./algorithms.js",
  "specs": "./specs.js",
  "collectionStoryMetadata": "./metadata.js",
  "collectionStoryExamples": "../../../config/collectionStoryExamples.js",
  "nextSpecs": "./nextSpecs.js",
  "validateNext": "./nextSpecs.js",
  "expansionSpecs": "./expansionSpecs.js",
  "validateExpansion": "./expansionSpecs.js",
  "dpSpecs": "./expansionDPSpecs.js",
  "validateDP": "./expansionDPSpecs.js",
  "moreSpecs": "./expansionMoreSpecs.js",
  "validateMore": "./expansionMoreSpecs.js",
  "laterSpecs": "./expansionLaterSpecs.js",
  "validateLater": "./expansionLaterSpecs.js"
};
