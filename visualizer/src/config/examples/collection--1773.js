// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One rule field filters a varied inventory",
    "input": "{\"items\":[[\"lamp\",\"amber\",\"halo\"],[\"chair\",\"blue\",\"cove\"],[\"lamp\",\"blue\",\"beam\"],[\"desk\",\"amber\",\"arc\"],[\"lamp\",\"amber\",\"glow\"],[\"chair\",\"amber\",\"nest\"]],\"ruleKey\":\"color\",\"ruleValue\":\"amber\"}"
  },
  {
    "label": "Matching another field does not count",
    "input": "{\"items\":[[\"lamp\",\"blue\",\"chair\"],[\"chair\",\"green\",\"lamp\"]],\"ruleKey\":\"type\",\"ruleValue\":\"lamp\"}"
  },
  {
    "label": "No matching value",
    "input": "{\"items\":[[\"desk\",\"red\",\"arc\"]],\"ruleKey\":\"color\",\"ruleValue\":\"violet\"}"
  },
  {
    "label": "Match by name",
    "input": "{\"items\":[[\"lamp\",\"gold\",\"halo\"],[\"chair\",\"gold\",\"cove\"]],\"ruleKey\":\"name\",\"ruleValue\":\"cove\"}"
  }
];
