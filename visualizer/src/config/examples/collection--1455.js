// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several later words share the prefix",
    "input": "{\"sentence\":\"quiet cedar groves surround green gardens near granite paths\",\"searchWord\":\"gr\"}"
  },
  {
    "label": "Prefix appears inside a word but not at its start",
    "input": "{\"sentence\":\"cedar shadows wander slowly\",\"searchWord\":\"dar\"}"
  },
  {
    "label": "First word matches",
    "input": "{\"sentence\":\"forest paths curve gently\",\"searchWord\":\"for\"}"
  },
  {
    "label": "No word matches",
    "input": "{\"sentence\":\"oak pine cedar\",\"searchWord\":\"elm\"}"
  }
];
