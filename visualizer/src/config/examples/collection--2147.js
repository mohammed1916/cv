// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several plant-filled gaps multiply independent divider choices",
    "input": "{\"corridor\":\"PSSPPPSPSPPSSPPSSP\"}"
  },
  {
    "label": "No seats cannot make a valid section",
    "input": "{\"corridor\":\"PPPPPP\"}"
  },
  {
    "label": "An odd seat count cannot split into pairs",
    "input": "{\"corridor\":\"SPPSPS\"}"
  },
  {
    "label": "Exactly two seats need no internal divider",
    "input": "{\"corridor\":\"PPPSPPPPSPP\"}"
  }
];
