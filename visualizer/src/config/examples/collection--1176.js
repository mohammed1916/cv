// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rolling totals cross both thresholds",
    "input": "{\"calories\":[7,3,9,2,6,11,4,8,1,5,10,2],\"k\":3,\"lower\":14,\"upper\":21}"
  },
  {
    "label": "Exact lower and upper totals are neutral",
    "input": "{\"calories\":[4,6,8],\"k\":2,\"lower\":10,\"upper\":14}"
  },
  {
    "label": "Window spans all days",
    "input": "{\"calories\":[3,7,2,8],\"k\":4,\"lower\":15,\"upper\":19}"
  },
  {
    "label": "Single-day scoring",
    "input": "{\"calories\":[0,4,9],\"k\":1,\"lower\":2,\"upper\":7}"
  }
];
