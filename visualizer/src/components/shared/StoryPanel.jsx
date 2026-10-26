import './StoryPanel.css';

export default function StoryPanel({ title, description, label, className = '', children }) {
  return <section className={`story-panel ${className}`} aria-label={label ?? title}>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {children}
  </section>;
}
