import './PanelScaleControl.css'

/** A consistent, accessible UI-scale control for compact work panels. */
export default function PanelScaleControl({
  value,
  onChange,
  label = 'Control scale',
  ariaLabel = 'Panel content scale',
  min = 65,
  max = 120,
}) {
  return (
    <label className="panel-scale-control">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={ariaLabel}
      />
    </label>
  )
}
