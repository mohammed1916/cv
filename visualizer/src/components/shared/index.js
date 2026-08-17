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
