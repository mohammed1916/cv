// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several backspaces erase intermediate work",
    "input": "{\"s\":\"garden##path###xy\",\"t\":\"gardpxy\"}"
  },
  {
    "label": "Everything erased",
    "input": "{\"s\":\"ab##\",\"t\":\"c#\"}"
  },
  {
    "label": "Backspace on empty buffer",
    "input": "{\"s\":\"###fern\",\"t\":\"fern\"}"
  },
  {
    "label": "Same length different survivors",
    "input": "{\"s\":\"ab#d\",\"t\":\"ac#e\"}"
  }
];
