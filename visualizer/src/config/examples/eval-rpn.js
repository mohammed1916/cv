// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Nested arithmetic",
    "tokens": [
      "12",
      "5",
      "-",
      "3",
      "*",
      "8",
      "2",
      "/",
      "+"
    ]
  },
  {
    "label": "Negative division",
    "tokens": [
      "-17",
      "4",
      "/"
    ]
  },
  {
    "label": "Operand order",
    "tokens": [
      "7",
      "19",
      "-"
    ]
  },
  {
    "label": "Single operand",
    "tokens": [
      "23"
    ]
  },
  {
    "label": "Zero result",
    "tokens": [
      "9",
      "9",
      "-"
    ]
  },
  {
    "label": "Extreme operands at the limits",
    "tokens": [
      "-20",
      "20",
      "*",
      "-20",
      "/"
    ]
  },
  {
    "label": "Division truncates toward zero",
    "tokens": [
      "7",
      "-2",
      "/",
      "3",
      "+"
    ]
  },
  {
    "label": "Subtracting two negatives",
    "tokens": [
      "-5",
      "-6",
      "-"
    ]
  },
  {
    "label": "Long run: 15 tokens",
    "tokens": [
      "4",
      "-3",
      "*",
      "2",
      "+",
      "9",
      "1",
      "-",
      "/",
      "6",
      "*",
      "5",
      "+",
      "-1",
      "-"
    ]
  }
];
