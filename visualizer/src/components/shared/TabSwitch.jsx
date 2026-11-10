// Shared tab row: one selected option, underlined, used for mode and solution switches.
export default function TabSwitch({ label, options, value, onChange, className = '' }) {
  return (
    <div className={`tab-switch ${className}`.trim()} role="tablist" aria-label={label}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
