// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several descendant levels",
    "pid": [
      10,
      14,
      18,
      22,
      26,
      30,
      34,
      38
    ],
    "ppid": [
      0,
      10,
      10,
      14,
      14,
      22,
      18,
      30
    ],
    "kill": 14
  },
  {
    "label": "Kill root",
    "pid": [
      11,
      17,
      23,
      29
    ],
    "ppid": [
      0,
      11,
      11,
      17
    ],
    "kill": 11
  },
  {
    "label": "Kill leaf",
    "pid": [
      11,
      17,
      23,
      29
    ],
    "ppid": [
      0,
      11,
      11,
      17
    ],
    "kill": 29
  },
  {
    "label": "Single process",
    "pid": [
      41
    ],
    "ppid": [
      0
    ],
    "kill": 41
  }
];
