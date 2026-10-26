import styles from './VisualizerDockLayout.module.css';

const classes = (...values) => values.filter(Boolean).join(' ');

// Content layout only: docking, portals and playback remain with their owners.
export default function VisualizerDockLayout({ children, className, ...props }) {
  return <div {...props} className={classes(styles.shell, className)}>{children}</div>;
}

export function VisualizerDockBody({ children, className, code = false, ...props }) {
  return <div {...props} className={classes(styles.body, code && styles.code, className)}>{children}</div>;
}

export function VisualizerDockPanel({ children, className, ...props }) {
  return <section {...props} className={classes(styles.panel, className)}>{children}</section>;
}

export function VisualizerDockPresets({ children, className, ...props }) {
  return <div {...props} className={classes(styles.presets, className)}>{children}</div>;
}
