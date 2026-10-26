// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Typed prefixes narrow shared suggestion lists",
    "input": "{\"products\":[\"forest\",\"fork\",\"form\",\"format\",\"formal\",\"fern\",\"forge\",\"fort\",\"grove\",\"fir\"],\"searchWord\":\"formal\"}"
  },
  {
    "label": "Absent prefix stays absent",
    "input": "{\"products\":[\"oak\",\"oat\",\"elm\"],\"searchWord\":\"orbit\"}"
  },
  {
    "label": "Fewer than three products",
    "input": "{\"products\":[\"pine\",\"pink\"],\"searchWord\":\"pine\"}"
  },
  {
    "label": "Exact product also prefixes longer products",
    "input": "{\"products\":[\"a\",\"ac\",\"ace\",\"acorn\",\"actor\"],\"searchWord\":\"ace\"}"
  }
];
