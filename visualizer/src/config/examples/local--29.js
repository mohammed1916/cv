// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several quotient bits",
    "values": {
      "dividend": "937",
      "divisor": "17"
    }
  },
  {
    "label": "Negative truncates toward zero",
    "values": {
      "dividend": "-83",
      "divisor": "9"
    }
  },
  {
    "label": "Smaller magnitude",
    "values": {
      "dividend": "5",
      "divisor": "19"
    }
  },
  {
    "label": "Zero dividend",
    "values": {
      "dividend": "0",
      "divisor": "7"
    }
  },
  {
    "label": "Overflow clamp",
    "values": {
      "dividend": "-2147483648",
      "divisor": "-1"
    }
  },
  {
    "label": "Minimum signed value",
    "values": {
      "dividend": "-2147483648",
      "divisor": "1"
    }
  }
];
