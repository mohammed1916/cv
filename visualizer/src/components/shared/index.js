/**
 * Shared visualizer components.
 *
 * Usage:
 *   import { usePlayback, CodePanel, ControlsBar, ProgressBand } from '../../components/shared'
 *
 * CSS theming: set these variables on your problem's root element:
 *   --vis-accent    primary accent color (code row highlights, range input, etc.)
 *   --vis-play      play-button gradient start color
 *   --vis-play-d    play-button gradient end color (darker shade)
 */
export { usePlayback }     from './usePlayback'
export { CodePanel }       from './CodePanel'
export { ControlsBar }     from './ControlsBar'
export { ProgressBand }    from './ProgressBand'
// Pan/zoom shell for SVG diagrams (graphs, trees) inside dock panels.
export { default as SvgViewport } from './SvgViewport'
export { StackLane, BitmaskLane, DPTable, GraphFrontierLane } from './AlgorithmStatePrimitives'
// Linked list and binary tree lanes for pointer and structure problems.
export { default as LinkedListLane } from './LinkedListLane'
export { default as BinaryTreeLane } from './BinaryTreeLane'
export { treeFromLevelOrder, treeFromNary, levelOrderFromTree, layoutTree } from './treeLayout'
export { default as TreeOutline } from './TreeOutline'
// Operation log for design-style problems driven by a list of method calls.
export { default as OperationLog } from './OperationLog'
