// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven source piles leave unusable remainders",
    "input": "{\"candies\":[17,9,24,13,7,31],\"k\":15}"
  },
  {
    "label": "More children than total candies forces zero",
    "input": "{\"candies\":[2,4,1],\"k\":12}"
  },
  {
    "label": "One child can take the largest whole source pile",
    "input": "{\"candies\":[8,19,6,12],\"k\":1}"
  },
  {
    "label": "Equal piles split into equal portions",
    "input": "{\"candies\":[12,12,12,12],\"k\":12}"
  }
];
