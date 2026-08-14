import React from 'react'
import './ManualInputPanel.css'

/**
 * Reusable manual-input panel for visualizers.
 *
 * Renders:
 *  - Example buttons (from EXAMPLES) unless showExamples is false
 *  - One labelled text field per input field in `fields`
 *  - Inline error display
 *
 * Props:
 *  - fields: [{ key, label, type: 'array'|'number'|'string', placeholder?, defaultValue }]
 *  - values: { [key]: string }  current text value of each field
 *  - onChange: (key, text) => void
 *  - examples: array of example objects
 *  - activeLabel: string (label of active example, to highlight)
 *  - applyExample: (example) => void
 *  - inputError: string | null
 *  - compact: bool (smaller spacing, default true)
 *  - showExamples: bool (default true)
 */
export default function ManualInputPanel({
  fields,
  values,
  onChange,
  examples,
  activeLabel,
  applyExample,
  inputError,
  compact = true,
  showExamples = true,
}) {
  return (
    <div className={`mip-root ${compact ? 'mip-compact' : ''}`}>
      {showExamples && examples && examples.length > 0 && (
        <div className="mip-examples">
          {examples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              className={`mip-chip ${activeLabel === ex.label ? 'mip-chip-active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}

      <div className="mip-fields">
        {fields.map((f) => (
          <label key={f.key} className="mip-field">
            <span className="mip-label">{f.label}:</span>
            <input
              className="mip-input"
              type="text"
              value={values[f.key] ?? ''}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.placeholder || ''}
              spellCheck={false}
            />
          </label>
        ))}
      </div>

      {inputError && <div className="mip-error">{inputError}</div>}
    </div>
  )
}
