// Original walkthroughs and boundary cases authored for this project.
export const sequenceStoryExamples = {
  "605": [
    {
      "label": "Several separated planting opportunities",
      "input": "{\"flowerbed\":[0,0,0,1,0,0,0,0,1,0,0,0,0],\"n\":4}"
    },
    {
      "label": "Both boundaries available",
      "input": "{\"flowerbed\":[0,0,1,0,0],\"n\":2}"
    },
    {
      "label": "No flowers requested",
      "input": "{\"flowerbed\":[1,0,1],\"n\":0}"
    },
    {
      "label": "Only one slot",
      "input": "{\"flowerbed\":[0],\"n\":1}"
    },
    {
      "label": "Not enough space",
      "input": "{\"flowerbed\":[0,0,0,0,0],\"n\":4}"
    }
  ],
  "611": [
    {
      "label": "Repeated sides and several valid ranges",
      "input": "{\"nums\":[9,4,7,2,8,4,6,11,5,3]}"
    },
    {
      "label": "Zeros cannot be sides",
      "input": "{\"nums\":[0,0,3,3,4]}"
    },
    {
      "label": "Equality is not a triangle",
      "input": "{\"nums\":[2,4,6]}"
    },
    {
      "label": "Fewer than three sides",
      "input": "{\"nums\":[5,8]}"
    }
  ],
  "628": [
    {
      "label": "Two negatives challenge positive triple",
      "input": "{\"nums\":[-17,8,-12,4,11,2,-3,9,6]}"
    },
    {
      "label": "Exactly three negative values",
      "input": "{\"nums\":[-9,-5,-2]}"
    },
    {
      "label": "Zero beats negative product",
      "input": "{\"nums\":[-8,-3,0]}"
    },
    {
      "label": "Equal maxima",
      "input": "{\"nums\":[6,6,6,6]}"
    }
  ],
  "633": [
    {
      "label": "Several pointer decisions",
      "input": "{\"c\":325}"
    },
    {
      "label": "No representation",
      "input": "{\"c\":27}"
    },
    {
      "label": "Zero square pair",
      "input": "{\"c\":0}"
    },
    {
      "label": "Equal square pair",
      "input": "{\"c\":98}"
    },
    {
      "label": "One square is zero",
      "input": "{\"c\":169}"
    }
  ],
  "643": [
    {
      "label": "Best window lies inside the array",
      "input": "{\"nums\":[-7,4,9,-2,8,3,-6,10,1,-4,5],\"k\":4}"
    },
    {
      "label": "All negative",
      "input": "{\"nums\":[-12,-4,-9,-6],\"k\":2}"
    },
    {
      "label": "Window is entire input",
      "input": "{\"nums\":[5,-3,7,2],\"k\":4}"
    },
    {
      "label": "Single-value windows",
      "input": "{\"nums\":[-3,8,2],\"k\":1}"
    }
  ],
  "645": [
    {
      "label": "Unsorted input with distant missing slot",
      "input": "{\"nums\":[8,2,5,1,6,4,8,3,10,9]}"
    },
    {
      "label": "Missing first",
      "input": "{\"nums\":[2,2,3,4]}"
    },
    {
      "label": "Missing last",
      "input": "{\"nums\":[1,2,3,3]}"
    },
    {
      "label": "Smallest mismatch",
      "input": "{\"nums\":[1,1]}"
    }
  ],
  "674": [
    {
      "label": "Competing runs with a plateau",
      "input": "{\"nums\":[2,5,8,8,1,3,6,9,12,4,7,10]}"
    },
    {
      "label": "All equal",
      "input": "{\"nums\":[4,4,4,4]}"
    },
    {
      "label": "Strict descent",
      "input": "{\"nums\":[9,7,5,1]}"
    },
    {
      "label": "One value",
      "input": "{\"nums\":[6]}"
    }
  ],
  "697": [
    {
      "label": "Equal frequencies with different spans",
      "input": "{\"nums\":[4,7,4,9,7,7,2,4,8,2,2,6]}"
    },
    {
      "label": "All values distinct",
      "input": "{\"nums\":[8,3,9,1]}"
    },
    {
      "label": "One repeated value",
      "input": "{\"nums\":[5,5,5,5]}"
    },
    {
      "label": "Single element",
      "input": "{\"nums\":[12]}"
    }
  ],
  "724": [
    {
      "label": "Pivot after a long prefix",
      "input": "{\"nums\":[3,-2,5,1,-1,9,4,2]}"
    },
    {
      "label": "Left boundary pivot",
      "input": "{\"nums\":[7,2,-2]}"
    },
    {
      "label": "Several pivots: take first",
      "input": "{\"nums\":[0,0,0,0]}"
    },
    {
      "label": "No pivot",
      "input": "{\"nums\":[2,5,9]}"
    },
    {
      "label": "Negative values",
      "input": "{\"nums\":[-3,1,2,0]}"
    }
  ],
  "747": [
    {
      "label": "Dominant value near the end",
      "input": "{\"nums\":[3,8,2,6,1,19,5,4]}"
    },
    {
      "label": "Exactly twice",
      "input": "{\"nums\":[4,8,1]}"
    },
    {
      "label": "Unique largest but not dominant",
      "input": "{\"nums\":[3,7,5,2]}"
    },
    {
      "label": "Zeros beside maximum",
      "input": "{\"nums\":[0,0,9,0]}"
    }
  ],
  "766": [
    {
      "label": "Several parallel diagonals",
      "input": "{\"matrix\":[[8,3,6,1,9],[4,8,3,6,1],[7,4,8,3,6],[2,7,4,8,3]]}"
    },
    {
      "label": "Late mismatch",
      "input": "{\"matrix\":[[2,5,7],[3,2,5],[4,3,9]]}"
    },
    {
      "label": "Single row",
      "input": "{\"matrix\":[[6,2,8,1]]}"
    },
    {
      "label": "Single column",
      "input": "{\"matrix\":[[6],[2],[8]]}"
    }
  ],
  "832": [
    {
      "label": "Asymmetric image with both bit values",
      "input": "{\"matrix\":[[1,0,0,1,1],[0,1,0,0,1],[1,1,1,0,0],[0,0,1,1,0],[1,0,1,0,1]]}"
    },
    {
      "label": "All zeros",
      "input": "{\"matrix\":[[0,0],[0,0]]}"
    },
    {
      "label": "Single bit",
      "input": "{\"matrix\":[[1]]}"
    },
    {
      "label": "Odd center bit",
      "input": "{\"matrix\":[[0,1,0],[1,1,0],[0,0,1]]}"
    }
  ],
  "867": [
    {
      "label": "Wide rectangle",
      "input": "{\"matrix\":[[8,3,9,1,5],[4,7,2,6,0],[11,13,12,15,14]]}"
    },
    {
      "label": "Single row becomes column",
      "input": "{\"matrix\":[[7,2,9,4]]}"
    },
    {
      "label": "Single column becomes row",
      "input": "{\"matrix\":[[7],[2],[9]]}"
    },
    {
      "label": "Single cell",
      "input": "{\"matrix\":[[-4]]}"
    }
  ],
  "896": [
    {
      "label": "Plateaus inside an increasing sequence",
      "input": "{\"nums\":[-8,-8,-3,0,0,4,7,7,12]}"
    },
    {
      "label": "Direction changes late",
      "input": "{\"nums\":[1,3,5,7,6]}"
    },
    {
      "label": "Only equal values",
      "input": "{\"nums\":[6,6,6]}"
    },
    {
      "label": "Decreasing with equality",
      "input": "{\"nums\":[12,9,9,4,0]}"
    }
  ],
  "905": [
    {
      "label": "Alternating and repeated parity values",
      "input": "{\"nums\":[13,8,7,0,5,12,3,6,9,2,8]}"
    },
    {
      "label": "All odd",
      "input": "{\"nums\":[7,3,9,1]}"
    },
    {
      "label": "All even",
      "input": "{\"nums\":[8,0,4,2]}"
    },
    {
      "label": "Singleton",
      "input": "{\"nums\":[5]}"
    }
  ],
  "922": [
    {
      "label": "Shuffled balanced parity",
      "input": "{\"nums\":[9,2,7,4,11,6,0,13,8,15,3,12]}"
    },
    {
      "label": "Already arranged",
      "input": "{\"nums\":[2,7,4,9]}"
    },
    {
      "label": "All even values first",
      "input": "{\"nums\":[2,4,6,1,3,5]}"
    },
    {
      "label": "Two values reversed",
      "input": "{\"nums\":[7,2]}"
    }
  ],
  "977": [
    {
      "label": "Negative and positive endpoints compete",
      "input": "{\"nums\":[-14,-9,-6,-2,0,1,4,7,11,13]}"
    },
    {
      "label": "All negative",
      "input": "{\"nums\":[-9,-5,-2,-1]}"
    },
    {
      "label": "Equal magnitudes",
      "input": "{\"nums\":[-5,-5,0,5,5]}"
    },
    {
      "label": "Single zero",
      "input": "{\"nums\":[0]}"
    }
  ],
  "1047": [
    {
      "label": "Cascading removals across several groups",
      "input": "{\"s\":\"azxxzyppqrrqybccbd\"}"
    },
    {
      "label": "Whole string disappears",
      "input": "{\"s\":\"abccba\"}"
    },
    {
      "label": "No adjacent duplicates",
      "input": "{\"s\":\"algorithm\"}"
    },
    {
      "label": "Odd run leaves one",
      "input": "{\"s\":\"aaaaa\"}"
    }
  ],
  "1207": [
    {
      "label": "Four distinct frequencies",
      "input": "{\"nums\":[4,7,4,9,7,4,2,2,2,2]}"
    },
    {
      "label": "Two values share frequency",
      "input": "{\"nums\":[3,3,8,8,5]}"
    },
    {
      "label": "One distinct value",
      "input": "{\"nums\":[6,6,6,6]}"
    },
    {
      "label": "Negative and zero values",
      "input": "{\"nums\":[-2,-2,0,5,5,5]}"
    }
  ],
  "1295": [
    {
      "label": "Crossing decimal length boundaries",
      "input": "{\"nums\":[7,18,205,4312,9,60,999,1000,10000,42]}"
    },
    {
      "label": "Powers of ten",
      "input": "{\"nums\":[1,10,100,1000,10000]}"
    },
    {
      "label": "No even digit lengths",
      "input": "{\"nums\":[5,123,999]}"
    },
    {
      "label": "Two digits only",
      "input": "{\"nums\":[12,34,56]}"
    }
  ],
  "1431": [
    {
      "label": "Children below, at, and above threshold",
      "input": "{\"candies\":[4,9,2,7,6,3,10,8,5],\"extraCandies\":3}"
    },
    {
      "label": "All tied initially",
      "input": "{\"candies\":[5,5,5],\"extraCandies\":1}"
    },
    {
      "label": "Exact tie with maximum",
      "input": "{\"candies\":[3,8,6],\"extraCandies\":2}"
    },
    {
      "label": "One child",
      "input": "{\"candies\":[7],\"extraCandies\":4}"
    }
  ],
  "1480": [
    {
      "label": "Positive and negative contributions",
      "input": "{\"nums\":[8,-3,6,0,-5,9,2,-7,4,11]}"
    },
    {
      "label": "All zeros",
      "input": "{\"nums\":[0,0,0,0]}"
    },
    {
      "label": "Negative prefixes",
      "input": "{\"nums\":[-4,-2,-8]}"
    },
    {
      "label": "Single value",
      "input": "{\"nums\":[13]}"
    }
  ],
  "1512": [
    {
      "label": "Interleaved repeated values",
      "input": "{\"nums\":[4,9,4,2,9,4,7,2,9,2,4]}"
    },
    {
      "label": "All equal",
      "input": "{\"nums\":[6,6,6,6,6]}"
    },
    {
      "label": "All distinct",
      "input": "{\"nums\":[8,3,1,9]}"
    },
    {
      "label": "One value",
      "input": "{\"nums\":[2]}"
    }
  ],
  "1672": [
    {
      "label": "Different distributions of wealth",
      "input": "{\"accounts\":[[4,12,3,8],[9,2,15,6],[7,7,7,7],[1,18,4,5],[11,3,9,8]]}"
    },
    {
      "label": "Equal row totals",
      "input": "{\"accounts\":[[2,8],[6,4],[5,5]]}"
    },
    {
      "label": "One customer",
      "input": "{\"accounts\":[[7,3,9]]}"
    },
    {
      "label": "One bank",
      "input": "{\"accounts\":[[4],[12],[8]]}"
    }
  ]
};
