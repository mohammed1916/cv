// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several competing transformation routes",
    "beginWord": "cold",
    "endWord": "warm",
    "wordList": [
      "cord",
      "card",
      "ward",
      "warm",
      "wold",
      "word",
      "worm",
      "sold"
    ]
  },
  {
    "label": "End word absent",
    "beginWord": "cold",
    "endWord": "warm",
    "wordList": [
      "cord",
      "card",
      "ward"
    ]
  },
  {
    "label": "End present but unreachable",
    "beginWord": "cold",
    "endWord": "warm",
    "wordList": [
      "cord",
      "card",
      "warm"
    ]
  },
  {
    "label": "One transformation",
    "beginWord": "pine",
    "endWord": "wine",
    "wordList": [
      "wine",
      "line",
      "fine"
    ]
  }
];
