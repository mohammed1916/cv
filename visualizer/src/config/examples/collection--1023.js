// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed valid insertions and forbidden extra capitals",
    "input": "{\"queries\":[\"GreenHouse\",\"GreatHall\",\"GreenHotHouse\",\"GHouse\",\"Greenhouse\",\"GardenHut\"],\"pattern\":\"GH\"}"
  },
  {
    "label": "Lowercase pattern characters must also be consumed",
    "input": "{\"queries\":[\"CodeParser\",\"CoolParser\",\"CParser\",\"CoParse\"],\"pattern\":\"CoPa\"}"
  },
  {
    "label": "Extra lowercase letters are allowed",
    "input": "{\"queries\":[\"abc\",\"axbyc\",\"abdc\"],\"pattern\":\"abc\"}"
  },
  {
    "label": "An unmatched capital cannot be inserted",
    "input": "{\"queries\":[\"AbC\",\"ABC\",\"AbCd\"],\"pattern\":\"AC\"}"
  }
];
