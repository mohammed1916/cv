import "./BitPlaceView.css";

// Place values for a fixed width, so each bit shows the power of two it stands for.
function bitsOf(value, width) {
  return Array.from({ length: width }, (_, i) => (value >> (width - 1 - i)) & 1)
}

export default function BitPlaceView({ parts }) {
  if (!parts.length) return <p className="bp-muted">Each part appears here once it has been converted.</p>
  return (
    <div className="bp-view" aria-label="Binary place values">
      {parts.map(part => {
        const width = Math.max(1, part.binary.length)
        const bits = bitsOf(part.decimal, width)
        return (
          <div key={part.label} className="bp-row">
            <span className="bp-label">{part.label}: {part.decimal} = {part.binary}</span>
            <div className="bp-bits">
              {bits.map((bit, i) => {
                const power = width - 1 - i
                return <span key={i} className={`bp-bit ${bit ? "is-one" : ""}`}>{bit}<span className="bp-place">2^{power}</span></span>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
