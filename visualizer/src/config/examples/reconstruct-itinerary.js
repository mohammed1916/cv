// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Lexical choices with a necessary return",
    "tickets": [
      [
        "JFK",
        "OSL"
      ],
      [
        "OSL",
        "JFK"
      ],
      [
        "JFK",
        "AMS"
      ],
      [
        "AMS",
        "BER"
      ],
      [
        "BER",
        "JFK"
      ],
      [
        "OSL",
        "ROM"
      ],
      [
        "ROM",
        "OSL"
      ]
    ]
  },
  {
    "label": "Repeated tickets",
    "tickets": [
      [
        "JFK",
        "OSL"
      ],
      [
        "OSL",
        "JFK"
      ],
      [
        "JFK",
        "OSL"
      ]
    ]
  },
  {
    "label": "Single flight",
    "tickets": [
      [
        "JFK",
        "LIS"
      ]
    ]
  }
];
