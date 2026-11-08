// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Sparse branches need structural parentheses",
    "input": "{\"root\":[9,4,15,null,6,12,18,5,null,null,13]}"
  },
  {
    "label": "Only a right child",
    "input": "{\"root\":[7,null,11]}"
  },
  {
    "label": "Only a left child",
    "input": "{\"root\":[7,3]}"
  },
  {
    "label": "Single node",
    "input": "{\"root\":[-8]}"
  },
  {
    "label": "Equal values in siblings",
    "input": "{\"root\":[3,3,3,null,3]}"
  },
  {
    "label": "Extreme values at the limits",
    "input": "{\"root\":[1000,-1000,1000,-1000,null,null,1000]}"
  },
  {
    "label": "Left and right chains",
    "input": "{\"root\":[1,2,3,null,null,4,5]}"
  },
  {
    "label": "Long run: 40 entries with gaps",
    "input": "{\"root\":[-69,-472,-532,null,-302,852,479,885,338,-903,-156,-378,null,-217,-478,601,-543,686,-335,521,null,663,-420,null,929,980,null,-166,-312,203,null,-987,751,-378,null,null,145,-37,469,null]}"
  }
];
