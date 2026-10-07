// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated peeks do not advance",
    "input": [
      [
        3,
        7,
        11,
        15
      ],
      [
        "peek",
        "peek",
        "next",
        "peek",
        "next",
        "hasNext",
        "next",
        "next",
        "hasNext"
      ]
    ]
  },
  {
    "label": "One value",
    "input": [
      [
        17
      ],
      [
        "hasNext",
        "peek",
        "next",
        "hasNext"
      ]
    ]
  },
  {
    "label": "Empty iterator",
    "input": [
      [],
      [
        "hasNext"
      ]
    ]
  }
];
