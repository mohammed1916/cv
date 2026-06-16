/**
 * Global registry of available visualization features
 * Maps feature IDs to their configurations across all visualizers
 *
 * Structure:
 * {
 *   [problemSlug]: {
 *     [featureId]: { icon, label, description, category, enabledByDefault }
 *   }
 * }
 */

export const VISUALIZATION_REGISTRY = {
  'game-on-growing-tree': {
    dpDetails: {
      icon: '🔢',
      label: 'DP Details',
      description: 'Show first/second/third values for each node',
      category: 'dp',
      enabledByDefault: false,
    },
    rankHighlight: {
      icon: '📊',
      label: 'Rank Highlights',
      description: 'Color-code ranking of DP values',
      category: 'dp',
      enabledByDefault: false,
    },
    insertBreakdown: {
      icon: '🔀',
      label: 'InsertTop3 Logic',
      description: 'Step-by-step comparison and insertion logic',
      category: 'dp',
      enabledByDefault: false,
    },
    edgeFlow: {
      icon: '🔗',
      label: 'Edge Flow',
      description: 'Direction and depth value flowing through edges',
      category: 'flow',
      enabledByDefault: false,
    },
    traversalTrail: {
      icon: '🔗',
      label: 'Traversal Trail',
      description: 'Breadcrumb of visited nodes in current pass',
      category: 'flow',
      enabledByDefault: false,
    },
    comparisons: {
      icon: '⚖️',
      label: 'Critical Decisions',
      description: 'When and why different depths are chosen',
      category: 'detail',
      enabledByDefault: false,
    },
    bottomUp: {
      icon: '⬆️',
      label: 'Bottom-Up Details',
      description: "Which children feed each node's triplet",
      category: 'detail',
      enabledByDefault: false,
    },
    valueSource: {
      icon: '🔍',
      label: 'Value Source',
      description: 'Where each depth value comes from',
      category: 'detail',
      enabledByDefault: false,
    },
  },

  'climbing-stairs': {
    stateFlow: {
      icon: '🔄',
      label: 'State Flow',
      description: 'Highlight how one/two values shift each iteration',
      category: 'flow',
      enabledByDefault: false,
    },
    iterationBreakdown: {
      icon: '📝',
      label: 'Iteration Breakdown',
      description: 'Detailed explanation of each loop step',
      category: 'detail',
      enabledByDefault: false,
    },
    fibonacciSequence: {
      icon: '📊',
      label: 'Fibonacci Sequence',
      description: 'Show generated sequence values',
      category: 'dp',
      enabledByDefault: false,
    },
  },

  'house-robber': {
    dpArray: {
      icon: '📊',
      label: 'DP Array State',
      description: 'Show dp[i] values as you solve each house',
      category: 'dp',
      enabledByDefault: false,
    },
    houseHighlight: {
      icon: '🏠',
      label: 'House Highlight',
      description: 'Highlight current house being evaluated',
      category: 'flow',
      enabledByDefault: false,
    },
    decisionFlow: {
      icon: '🔀',
      label: 'Decision Flow',
      description: 'Show rob vs skip decision at each step',
      category: 'detail',
      enabledByDefault: false,
    },
  },

  'course-schedule': {
    graphVisualization: {
      icon: '🔗',
      label: 'Graph Structure',
      description: 'Show course prerequisites graph',
      category: 'flow',
      enabledByDefault: false,
    },
    visitationFlow: {
      icon: '🔄',
      label: 'Visitation Flow',
      description: 'Highlight visited nodes in topological sort',
      category: 'flow',
      enabledByDefault: false,
    },
    cycleDetection: {
      icon: '⚠️',
      label: 'Cycle Detection',
      description: 'Show detected cycles in the graph',
      category: 'detail',
      enabledByDefault: false,
    },
  },

  'max-depth-binary-tree': {
    treeStructure: {
      icon: '🌳',
      label: 'Tree Structure',
      description: 'Show tree layout and node relationships',
      category: 'dp',
      enabledByDefault: false,
    },
    depthTracking: {
      icon: '📏',
      label: 'Depth Tracking',
      description: 'Highlight current depth level',
      category: 'flow',
      enabledByDefault: false,
    },
    recursionBreakdown: {
      icon: '🔀',
      label: 'Recursion Calls',
      description: 'Show recursive function calls',
      category: 'detail',
      enabledByDefault: false,
    },
  },

  // Add more problems here...
  // 'longest-increasing-subsequence': { ... },
  // 'edit-distance': { ... },
  // 'knapsack-problem': { ... },
}

/**
 * Get features for a specific problem
 * @param {string} problemSlug - The problem slug
 * @returns {Object} Features configuration for that problem
 */
export function getVisualizationFeatures(problemSlug) {
  return VISUALIZATION_REGISTRY[problemSlug] || {}
}

/**
 * Get all feature categories across all problems
 * @returns {string[]} Array of unique category names
 */
export function getAllCategories() {
  const categories = new Set()
  Object.values(VISUALIZATION_REGISTRY).forEach((features) => {
    Object.values(features).forEach((feature) => {
      if (feature.category) categories.add(feature.category)
    })
  })
  return Array.from(categories).sort()
}

/**
 * Register features for a new problem
 * @param {string} problemSlug - The problem slug
 * @param {Object} features - Features configuration
 */
export function registerVisualizationFeatures(problemSlug, features) {
  VISUALIZATION_REGISTRY[problemSlug] = features
}
