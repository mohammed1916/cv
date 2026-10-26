// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A mixed board contains one compatible bounded slot",
    "input": "{\"board\":[[\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\"],[\"#\",\"r\",\" \",\"v\",\" \",\"r\",\"#\"],[\"#\",\"#\",\" \",\"#\",\" \",\"#\",\"#\"],[\"#\",\" \",\" \",\" \",\" \",\" \",\"#\"],[\"#\",\"#\",\"#\",\"#\",\"#\",\"#\",\"#\"]],\"word\":\"river\"}"
  },
  {
    "label": "Only the reversed direction fits",
    "input": "{\"board\":[[\"#\",\"t\",\" \",\"c\",\"#\"]],\"word\":\"cat\"}"
  },
  {
    "label": "An open slot longer than the word is invalid",
    "input": "{\"board\":[[\" \",\" \",\" \",\" \",\" \"]],\"word\":\"pine\"}"
  },
  {
    "label": "An existing letter conflicts with both directions",
    "input": "{\"board\":[[\"c\",\"x\",\"t\"]],\"word\":\"cat\"}"
  }
];
