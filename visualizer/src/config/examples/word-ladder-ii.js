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
  },
  {
    "label": "Single letter words",
    "beginWord": "a",
    "endWord": "b",
    "wordList": [
      "b"
    ]
  },
  {
    "label": "Equal shortest routes",
    "beginWord": "cab",
    "endWord": "dab",
    "wordList": [
      "cob",
      "dob",
      "cat",
      "dat",
      "dab"
    ]
  },
  {
    "label": "Five letter boundary",
    "beginWord": "zzzzz",
    "endWord": "zzzza",
    "wordList": [
      "zzzzy",
      "zzzza"
    ]
  },
  {
    "label": "Long run: chain of six words",
    "beginWord": "aaaaa",
    "endWord": "bbbbb",
    "wordList": [
      "aaaab",
      "aaabb",
      "aabbb",
      "abbbb",
      "bbbbb",
      "aaaba"
    ]
  }
];
