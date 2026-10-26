// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several words compete with repeated letter requirements",
    "input": "{\"words\":[\"cedar\",\"reed\",\"deer\",\"reader\",\"acre\",\"care\",\"rare\"],\"chars\":\"cedarere\"}"
  },
  {
    "label": "Every word gets a fresh supply",
    "input": "{\"words\":[\"oak\",\"oak\",\"oak\"],\"chars\":\"oak\"}"
  },
  {
    "label": "A repeated letter is missing",
    "input": "{\"words\":[\"moss\",\"soon\"],\"chars\":\"mosn\"}"
  },
  {
    "label": "No word fits",
    "input": "{\"words\":[\"fern\",\"pine\"],\"chars\":\"oak\"}"
  }
];
