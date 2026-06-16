import './ToggleSwitch.css'

export default function ToggleSwitch({
  id,
  label,
  icon,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="toggle-switch-label" htmlFor={id}>
      <div className="toggle-switch-content">
        <span className="toggle-switch-icon">{icon}</span>
        <div className="toggle-switch-text">
          <span className="toggle-switch-main">{label}</span>
          {description && (
            <span className="toggle-switch-description">{description}</span>
          )}
        </div>
      </div>
      <input
        id={id}
        type="checkbox"
        className="toggle-switch-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="toggle-switch-slider" />
    </label>
  )
}
