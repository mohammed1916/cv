// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Equal attacks mix with genuinely stronger characters",
    "input": "{\"properties\":[[7,3],[7,9],[4,8],[9,7],[5,2],[9,4],[3,10],[11,6]]}"
  },
  {
    "label": "Equal attack alone never dominates",
    "input": "{\"properties\":[[6,2],[6,5],[6,9]]}"
  },
  {
    "label": "Equal defense alone never dominates",
    "input": "{\"properties\":[[2,7],[5,7],[9,7]]}"
  },
  {
    "label": "One character has no dominator",
    "input": "{\"properties\":[[12,4]]}"
  },
  {
    "label": "Two equal characters",
    "input": "[[1,1],[1,1]]"
  },
  {
    "label": "Extreme attack and defense",
    "input": "[[100000,1],[1,100000]]"
  },
  {
    "label": "Equal attacks",
    "input": "[[5,3],[5,9],[5,6]]"
  },
  {
    "label": "Long run: 20 characters",
    "input": "[[90134,25687],[1918,33625],[69139,73818],[14581,99612],[22293,62993],[71619,10684],[22941,38814],[56697,22064],[16782,94024],[82866,4268],[44432,36186],[98346,48788],[88045,48270],[26567,44140],[7549,83635],[44179,23401],[8941,37795],[14653,24872],[30091,6939],[47857,88446]]"
  }
];
