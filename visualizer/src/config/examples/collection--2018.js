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
  },
  {
    "label": "Single letter cell",
    "input": "{\"board\":[\"a\"],\"word\":\"a\"}"
  },
  {
    "label": "Word longer than the board",
    "input": "{\"board\":[\"ab\"],\"word\":\"abc\"}"
  },
  {
    "label": "Empty board of blanks",
    "input": "{\"board\":[\"   \"],\"word\":\"a\"}"
  },
  {
    "label": "Long run: 8 by 8 board",
    "input": "{\"board\":[\"b hbffgc\",\"hfha h#c\",\"#adcgdgb\",\"fg###fgb\",\"ee gha h\",\"baga#h d\",\"dbagh bc\",\"c#d#ggg \"],\"word\":\"ohlvmkqz\"}"
  }
];
