/**
 * Central registry for example inputs across all problems
 * Each problem has its own examples array with label and problem-specific fields
 * 
 * Replaces hardcoded EXAMPLES arrays in individual visualizers
 * Usage: const EXAMPLES = getExamples('problem-slug')
 */

export const EXAMPLES_REGISTRY = {
  "add-two-numbers": [
    {
      "label": "Equal Length",
      "l1": [
        2,
        4,
        3
      ],
      "l2": [
        5,
        6,
        4
      ]
    },
    {
      "label": "Carry",
      "l1": [
        2,
        4,
        9
      ],
      "l2": [
        5,
        6,
        4
      ]
    },
    {
      "label": "Zeroes",
      "l1": [
        0
      ],
      "l2": [
        0
      ]
    },
    {
      "label": "Different Length",
      "l1": [
        9,
        9,
        9,
        9,
        9,
        9,
        9
      ],
      "l2": [
        9,
        9,
        9,
        9
      ]
    }
  ],
  "add-binary": [
    {
      "label": "11 + 1",
      "a": "11",
      "b": "1"
    },
    {
      "label": "1010 + 1011",
      "a": "1010",
      "b": "1011"
    },
    {
      "label": "0 + 0",
      "a": "0",
      "b": "0"
    },
    {
      "label": "1111 + 1111",
      "a": "1111",
      "b": "1111"
    },
    {
      "label": "1 + 111",
      "a": "1",
      "b": "111"
    }
  ],
  "balanced-binary-tree": [
    {
      "label": "Balanced",
      "arr": [
        3,
        9,
        20,
        null,
        null,
        15,
        7
      ]
    },
    {
      "label": "Unbalanced",
      "arr": [
        1,
        2,
        2,
        3,
        3,
        null,
        null,
        4,
        4
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    },
    {
      "label": "Full",
      "arr": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    }
  ],
  "basic-calculator": [
    {
      "label": "1+1",
      "s": "1 + 1"
    },
    {
      "label": "2-1+2",
      "s": " 2-1 + 2 "
    },
    {
      "label": "Nested",
      "s": "(1+(4+5+2)-3)+(6+8)"
    }
  ],
  "best-time-buy-sell-stock": [
    {
      "label": "Classic",
      "prices": [
        7,
        1,
        5,
        3,
        6,
        4
      ]
    },
    {
      "label": "No profit",
      "prices": [
        7,
        6,
        4,
        3,
        1
      ]
    },
    {
      "label": "Best last",
      "prices": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "Two dips",
      "prices": [
        3,
        1,
        4,
        1,
        5,
        9,
        2,
        6
      ]
    }
  ],
  "best-time-buy-sell-stock-iii": [
    {
      "label": "[3,3,5,0,0,3,1,4]",
      "prices": [
        3,
        3,
        5,
        0,
        0,
        3,
        1,
        4
      ]
    },
    {
      "label": "[1,2,3,4,5]",
      "prices": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "[7,6,4,3,1]",
      "prices": [
        7,
        6,
        4,
        3,
        1
      ]
    }
  ],
  "best-time-buy-sell-stock-iv": [
    {
      "label": "k=2 [3,2,6,5,0,3]",
      "k": 2,
      "prices": [
        3,
        2,
        6,
        5,
        0,
        3
      ]
    },
    {
      "label": "k=2 [3,3,5,0,0,3,1,4]",
      "k": 2,
      "prices": [
        3,
        3,
        5,
        0,
        0,
        3,
        1,
        4
      ]
    },
    {
      "label": "k=1 [1,2,3,4,5]",
      "k": 1,
      "prices": [
        1,
        2,
        3,
        4,
        5
      ]
    }
  ],
  "binary-search": [
    {
      "label": "Standard",
      "nums": [
        -1,
        0,
        3,
        5,
        9,
        12
      ],
      "target": 9
    },
    {
      "label": "First Element",
      "nums": [
        -1,
        0,
        3,
        5,
        9,
        12
      ],
      "target": -1
    },
    {
      "label": "Not Found",
      "nums": [
        -1,
        0,
        3,
        5,
        9,
        12
      ],
      "target": 2
    },
    {
      "label": "Single Element",
      "nums": [
        5
      ],
      "target": 5
    }
  ],
  "binary-tree-level-order": [
    {
      "label": "LeetCode",
      "arr": [
        3,
        9,
        20,
        null,
        null,
        15,
        7
      ]
    },
    {
      "label": "Full",
      "arr": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "label": "Skewed",
      "arr": [
        1,
        2,
        null,
        3,
        null,
        4
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    }
  ],
  "binary-tree-max-path": [
    {
      "label": "[1,2,3]",
      "input": "1,2,3"
    },
    {
      "label": "[-10,9,20,null,null,15,7]",
      "input": "-10,9,20,null,null,15,7"
    },
    {
      "label": "[2,-1]",
      "input": "2,-1"
    }
  ],
  "burst-balloons": [
    {
      "label": "Ex 1",
      "nums": [
        3,
        1,
        5,
        8
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        1,
        5
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        2,
        4,
        3
      ]
    }
  ],
  "candy": [
    {
      "label": "Ex 1",
      "ratings": [
        1,
        0,
        2
      ]
    },
    {
      "label": "Ex 2",
      "ratings": [
        1,
        2,
        2
      ]
    },
    {
      "label": "Ex 3",
      "ratings": [
        1,
        3,
        2,
        2,
        1
      ]
    },
    {
      "label": "Ex 4",
      "ratings": [
        1,
        2,
        3,
        4,
        5
      ]
    }
  ],
  "climbing-stairs": [
    {
      "label": "n = 2",
      "n": 2
    },
    {
      "label": "n = 3",
      "n": 3
    },
    {
      "label": "n = 5",
      "n": 5
    },
    {
      "label": "n = 8",
      "n": 8
    }
  ],
  "coin-change": [
    {
      "label": "Classic",
      "coins": [
        1,
        5,
        10,
        25
      ],
      "amount": 30
    },
    {
      "label": "LeetCode 1",
      "coins": [
        1,
        5,
        6,
        9
      ],
      "amount": 11
    },
    {
      "label": "Impossible",
      "coins": [
        2
      ],
      "amount": 3
    },
    {
      "label": "Amount 0",
      "coins": [
        1,
        2,
        5
      ],
      "amount": 0
    },
    {
      "label": "Big coins",
      "coins": [
        186,
        419,
        83,
        408
      ],
      "amount": 6249
    }
  ],
  "combination-sum": [
    {
      "label": "Classic",
      "candidates": [
        2,
        3,
        6,
        7
      ],
      "target": 7
    },
    {
      "label": "Multiple",
      "candidates": [
        2,
        3,
        5
      ],
      "target": 8
    },
    {
      "label": "No Answer",
      "candidates": [
        4,
        5
      ],
      "target": 3
    },
    {
      "label": "Single",
      "candidates": [
        2
      ],
      "target": 4
    }
  ],
  "construct-binary-tree": [
    {
      "label": "Ex1",
      "pre": [
        3,
        9,
        20,
        15,
        7
      ],
      "ino": [
        9,
        3,
        15,
        20,
        7
      ]
    },
    {
      "label": "Ex2",
      "pre": [
        -1
      ],
      "ino": [
        -1
      ]
    },
    {
      "label": "Ex3",
      "pre": [
        1,
        2,
        4,
        5,
        3,
        6
      ],
      "ino": [
        4,
        2,
        5,
        1,
        6,
        3
      ]
    }
  ],
  "container-with-most-water": [
    {
      "label": "Classic",
      "height": [
        1,
        8,
        6,
        2,
        5,
        4,
        8,
        3,
        7
      ]
    },
    {
      "label": "Simple",
      "height": [
        1,
        1
      ]
    },
    {
      "label": "Mountain",
      "height": [
        2,
        3,
        4,
        5,
        18,
        17,
        6
      ]
    },
    {
      "label": "Valley",
      "height": [
        10,
        2,
        1,
        3,
        9
      ]
    }
  ],
  "contains-duplicate": [
    {
      "label": "Has Dup",
      "nums": [
        1,
        2,
        3,
        1
      ]
    },
    {
      "label": "No Dup",
      "nums": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "label": "Multi",
      "nums": [
        1,
        1,
        1,
        3,
        3,
        4,
        3,
        2,
        4,
        2
      ]
    }
  ],
  "copy-list-random": [
    {
      "label": "Ex1",
      "nodes": [
        {
          "val": 7,
          "random": null
        },
        {
          "val": 13,
          "random": 0
        },
        {
          "val": 11,
          "random": 4
        },
        {
          "val": 10,
          "random": 2
        },
        {
          "val": 1,
          "random": 0
        }
      ]
    },
    {
      "label": "Ex2",
      "nodes": [
        {
          "val": 1,
          "random": 1
        },
        {
          "val": 2,
          "random": 1
        }
      ]
    },
    {
      "label": "Ex3",
      "nodes": [
        {
          "val": 3,
          "random": null
        },
        {
          "val": 3,
          "random": 0
        },
        {
          "val": 3,
          "random": null
        }
      ]
    }
  ],
  "counting-bits": [
    {
      "label": "n=5",
      "n": 5
    },
    {
      "label": "n=8",
      "n": 8
    },
    {
      "label": "n=12",
      "n": 12
    },
    {
      "label": "n=2",
      "n": 2
    }
  ],
  "course-schedule": [
    {
      "label": "Simple Path",
      "numCourses": 2,
      "prerequisites": [
        [
          1,
          0
        ]
      ]
    },
    {
      "label": "Cycle (Fail)",
      "numCourses": 2,
      "prerequisites": [
        [
          1,
          0
        ],
        [
          0,
          1
        ]
      ]
    },
    {
      "label": "Complex DAG",
      "numCourses": 6,
      "prerequisites": [
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          1
        ],
        [
          3,
          2
        ],
        [
          5,
          3
        ],
        [
          4,
          3
        ]
      ]
    },
    {
      "label": "Disconnected",
      "numCourses": 4,
      "prerequisites": [
        [
          1,
          0
        ],
        [
          3,
          2
        ]
      ]
    }
  ],
  "course-schedule-ii": [
    {
      "label": "DAG",
      "n": 4,
      "p": [
        [
          1,
          0
        ],
        [
          2,
          0
        ],
        [
          3,
          1
        ],
        [
          3,
          2
        ]
      ]
    },
    {
      "label": "Linear",
      "n": 4,
      "p": [
        [
          1,
          0
        ],
        [
          2,
          1
        ],
        [
          3,
          2
        ]
      ]
    },
    {
      "label": "Cycle",
      "n": 2,
      "p": [
        [
          1,
          0
        ],
        [
          0,
          1
        ]
      ]
    },
    {
      "label": "Disconnected",
      "n": 5,
      "p": [
        [
          1,
          0
        ],
        [
          3,
          2
        ]
      ]
    }
  ],
  "daily-temperatures": [
    {
      "label": "Classic",
      "temps": [
        73,
        74,
        75,
        71,
        69,
        72,
        76,
        73
      ]
    },
    {
      "label": "Increasing",
      "temps": [
        30,
        40,
        50,
        60
      ]
    },
    {
      "label": "Decreasing",
      "temps": [
        90,
        80,
        70,
        60
      ]
    }
  ],
  "decode-string": [
    {
      "label": "\"3[a]2[bc]\"",
      "s": "3[a]2[bc]"
    },
    {
      "label": "\"3[a2[c]]\"",
      "s": "3[a2[c]]"
    },
    {
      "label": "\"2[abc]3[cd]ef\"",
      "s": "2[abc]3[cd]ef"
    }
  ],
  "decode-ways": [
    {
      "label": "\"12\"",
      "s": "12"
    },
    {
      "label": "\"226\"",
      "s": "226"
    },
    {
      "label": "\"06\"",
      "s": "06"
    },
    {
      "label": "\"11106\"",
      "s": "11106"
    },
    {
      "label": "\"1234\"",
      "s": "1234"
    }
  ],
  "diameter-binary-tree": [
    {
      "label": "LeetCode",
      "arr": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "Full",
      "arr": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    },
    {
      "label": "Linear",
      "arr": [
        1,
        2,
        null,
        3,
        null,
        4
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    }
  ],
  "distinct-subsequences": [
    {
      "label": "rabbbit/rabbit",
      "s": "rabbbit",
      "t": "rabbit"
    },
    {
      "label": "babgbag/bag",
      "s": "babgbag",
      "t": "bag"
    },
    {
      "label": "abc/ac",
      "s": "abc",
      "t": "ac"
    }
  ],
  "dungeon-game": [
    {
      "label": "Ex 1",
      "dungeon": [
        [
          -2,
          -3,
          3
        ],
        [
          -5,
          -10,
          1
        ],
        [
          10,
          30,
          -5
        ]
      ]
    },
    {
      "label": "Ex 2",
      "dungeon": [
        [
          0
        ]
      ]
    },
    {
      "label": "Ex 3",
      "dungeon": [
        [
          1,
          -3,
          3,
          -2
        ],
        [
          0,
          -2,
          0,
          -2
        ],
        [
          -3,
          -1,
          2,
          -1
        ]
      ]
    }
  ],
  "edit-distance": [
    {
      "label": "\"horse\"→\"ros\"",
      "w1": "horse",
      "w2": "ros"
    },
    {
      "label": "\"intention\"→\"execution\"",
      "w1": "intention",
      "w2": "execution"
    },
    {
      "label": "\"abc\"→\"abc\"",
      "w1": "abc",
      "w2": "abc"
    },
    {
      "label": "\"abc\"→\"\"",
      "w1": "abc",
      "w2": ""
    }
  ],
  "encode-decode-strings": [
    {
      "label": "[\"lint\",\"code\",\"love\",\"you\"]",
      "strs": [
        "lint",
        "code",
        "love",
        "you"
      ]
    },
    {
      "label": "[\"we\",\"say\",\":\",\"yes\"]",
      "strs": [
        "we",
        "say",
        ":",
        "yes"
      ]
    },
    {
      "label": "[\"\"]",
      "strs": [
        ""
      ]
    },
    {
      "label": "[\"a\",\"b\"]",
      "strs": [
        "a",
        "b"
      ]
    }
  ],
  "eval-rpn": [
    {
      "label": "[\"2\",\"1\",\"+\",\"3\",\"*\"]",
      "tokens": [
        "2",
        "1",
        "+",
        "3",
        "*"
      ]
    },
    {
      "label": "[\"4\",\"13\",\"5\",\"/\",\"+\"]",
      "tokens": [
        "4",
        "13",
        "5",
        "/",
        "+"
      ]
    },
    {
      "label": "[\"10\",\"6\",\"9\",\"3\",\"+\",\"-11\",\"*\",\"/\",\"*\",\"17\",\"+\",\"5\",\"+\"]",
      "tokens": [
        "10",
        "6",
        "9",
        "3",
        "+",
        "-11",
        "*",
        "/",
        "*",
        "17",
        "+",
        "5",
        "+"
      ]
    }
  ],
  "find-all-anagrams": [
    {
      "label": "s=\"cbaebabacd\" p=\"abc\"",
      "s": "cbaebabacd",
      "p": "abc"
    },
    {
      "label": "s=\"abab\" p=\"ab\"",
      "s": "abab",
      "p": "ab"
    },
    {
      "label": "s=\"aaaaaaa\" p=\"aa\"",
      "s": "aaaaaaa",
      "p": "aa"
    }
  ],
  "find-disappeared-numbers": [
    {
      "label": "[4,3,2,7,8,2,3,1]",
      "input": [
        4,
        3,
        2,
        7,
        8,
        2,
        3,
        1
      ]
    },
    {
      "label": "[1,1]",
      "input": [
        1,
        1
      ]
    }
  ],
  "find-duplicate": [
    {
      "label": "LeetCode",
      "nums": [
        1,
        3,
        4,
        2,
        2
      ]
    },
    {
      "label": "Example 2",
      "nums": [
        3,
        1,
        3,
        4,
        2
      ]
    },
    {
      "label": "Simple",
      "nums": [
        1,
        1
      ]
    },
    {
      "label": "Longer",
      "nums": [
        2,
        5,
        9,
        6,
        9,
        3,
        8,
        9,
        7,
        1
      ]
    }
  ],
  "find-median-data-stream": [
    {
      "label": "[1,2,3]",
      "nums": [
        1,
        2,
        3
      ]
    },
    {
      "label": "[6,5,4,3,2,1]",
      "nums": [
        6,
        5,
        4,
        3,
        2,
        1
      ]
    },
    {
      "label": "[2,3,4,7,8]",
      "nums": [
        2,
        3,
        4,
        7,
        8
      ]
    }
  ],
  "find-min-rotated-sorted-array": [
    {
      "label": "Classic",
      "nums": [
        3,
        4,
        5,
        1,
        2
      ]
    },
    {
      "label": "More",
      "nums": [
        4,
        5,
        6,
        7,
        0,
        1,
        2
      ]
    },
    {
      "label": "Not rotated",
      "nums": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "Two elems",
      "nums": [
        2,
        1
      ]
    },
    {
      "label": "Large",
      "nums": [
        7,
        8,
        9,
        10,
        11,
        1,
        2,
        3,
        4,
        5,
        6
      ]
    }
  ],
  "find-peak-element": [
    {
      "label": "Ex 1",
      "nums": [
        1,
        2,
        3,
        1
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        1,
        2,
        1,
        3,
        5,
        6,
        4
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        3,
        1,
        2
      ]
    }
  ],
  "first-bad-version": [
    {
      "label": "n=5, bad=4",
      "n": 5,
      "bad": 4
    },
    {
      "label": "n=10, bad=7",
      "n": 10,
      "bad": 7
    },
    {
      "label": "n=1, bad=1",
      "n": 1,
      "bad": 1
    },
    {
      "label": "n=8, bad=2",
      "n": 8,
      "bad": 2
    }
  ],
  "first-missing-positive": [
    {
      "label": "Ex 1",
      "nums": [
        1,
        2,
        0
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        3,
        4,
        -1,
        1
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        7,
        8,
        9,
        11,
        12
      ]
    },
    {
      "label": "Ex 4",
      "nums": [
        2,
        1
      ]
    }
  ],
  "game-on-growing-tree": [
    {
      "label": "Sample",
      "q": "9",
      "parents": "1 1 3 3 1 2 1 2 8"
    },
    {
      "label": "Chain",
      "q": "8",
      "parents": "1 2 3 4 5 6 7 8"
    },
    {
      "label": "Star",
      "q": "8",
      "parents": "1 1 1 1 1 1 1 1"
    }
  ],
  "gas-station": [
    {
      "label": "Ex 1",
      "gas": [
        1,
        2,
        3,
        4,
        5
      ],
      "cost": [
        3,
        4,
        5,
        1,
        2
      ]
    },
    {
      "label": "Ex 2",
      "gas": [
        2,
        3,
        4
      ],
      "cost": [
        3,
        4,
        3
      ]
    },
    {
      "label": "Ex 3",
      "gas": [
        5,
        1,
        2,
        3,
        4
      ],
      "cost": [
        4,
        4,
        1,
        5,
        1
      ]
    }
  ],
  "generate-parentheses": [
    {
      "label": "n=1",
      "n": 1
    },
    {
      "label": "n=2",
      "n": 2
    },
    {
      "label": "n=3",
      "n": 3
    },
    {
      "label": "n=4",
      "n": 4
    }
  ],
  "gray-code": [
    {
      "label": "n=1",
      "n": 1
    },
    {
      "label": "n=2",
      "n": 2
    },
    {
      "label": "n=3",
      "n": 3
    },
    {
      "label": "n=4",
      "n": 4
    }
  ],
  "group-anagrams": [
    {
      "label": "Classic",
      "strs": [
        "eat",
        "tea",
        "tan",
        "ate",
        "nat",
        "bat"
      ]
    },
    {
      "label": "Single",
      "strs": [
        "a"
      ]
    },
    {
      "label": "Mixed",
      "strs": [
        "abc",
        "bca",
        "xyz",
        "zyx",
        "foo",
        "oof",
        "bar"
      ]
    },
    {
      "label": "Same key",
      "strs": [
        "abc",
        "acb",
        "bac",
        "bca",
        "cab",
        "cba"
      ]
    }
  ],
  "guess-number": [
    {
      "label": "n=10, pick=6",
      "n": 10,
      "pick": 6
    },
    {
      "label": "n=16, pick=1",
      "n": 16,
      "pick": 1
    },
    {
      "label": "n=20, pick=20",
      "n": 20,
      "pick": 20
    },
    {
      "label": "n=100, pick=73",
      "n": 100,
      "pick": 73
    }
  ],
  "guess-number-higher-or-lower": [
    {
      "label": "n=10, pick=6",
      "n": 10,
      "pick": 6
    },
    {
      "label": "n=1, pick=1",
      "n": 1,
      "pick": 1
    },
    {
      "label": "n=2, pick=1",
      "n": 2,
      "pick": 1
    }
  ],
  "happy-number": [
    {
      "label": "19 (Happy)",
      "n": 19
    },
    {
      "label": "7 (Happy)",
      "n": 7
    },
    {
      "label": "2 (Sad)",
      "n": 2
    },
    {
      "label": "4 (Sad)",
      "n": 4
    }
  ],
  "house-robber": [
    {
      "label": "Basic",
      "nums": [
        1,
        2,
        3,
        1
      ]
    },
    {
      "label": "LeetCode",
      "nums": [
        2,
        7,
        9,
        3,
        1
      ]
    },
    {
      "label": "Alternating",
      "nums": [
        6,
        1,
        6,
        1,
        6
      ]
    },
    {
      "label": "Large Peaks",
      "nums": [
        2,
        1,
        1,
        9,
        1,
        1,
        8
      ]
    }
  ],
  "house-robber-ii": [
    {
      "label": "LeetCode",
      "nums": [
        2,
        3,
        2
      ]
    },
    {
      "label": "Example 2",
      "nums": [
        1,
        2,
        3,
        1
      ]
    },
    {
      "label": "All Same",
      "nums": [
        5,
        5,
        5,
        5,
        5
      ]
    },
    {
      "label": "Long",
      "nums": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    }
  ],
  "ipo": [
    {
      "label": "Ex 1",
      "k": 2,
      "w": 0,
      "profits": [
        1,
        2,
        3
      ],
      "capital": [
        0,
        1,
        1
      ]
    },
    {
      "label": "Ex 2",
      "k": 3,
      "w": 0,
      "profits": [
        1,
        2,
        3
      ],
      "capital": [
        0,
        1,
        2
      ]
    },
    {
      "label": "Ex 3",
      "k": 2,
      "w": 1,
      "profits": [
        5,
        3,
        4,
        2
      ],
      "capital": [
        0,
        2,
        1,
        3
      ]
    }
  ],
  "implement-trie": [
    {
      "label": "Core",
      "ops": [
        [
          "insert",
          "apple"
        ],
        [
          "search",
          "apple"
        ],
        [
          "search",
          "app"
        ],
        [
          "startsWith",
          "app"
        ],
        [
          "insert",
          "app"
        ],
        [
          "search",
          "app"
        ]
      ]
    },
    {
      "label": "Simple",
      "ops": [
        [
          "insert",
          "cat"
        ],
        [
          "insert",
          "car"
        ],
        [
          "startsWith",
          "ca"
        ],
        [
          "search",
          "cab"
        ]
      ]
    }
  ],
  "insert-interval": [
    {
      "label": "Ex1",
      "intervals": [
        [
          1,
          3
        ],
        [
          6,
          9
        ]
      ],
      "newInterval": [
        2,
        5
      ]
    },
    {
      "label": "Ex2",
      "intervals": [
        [
          1,
          2
        ],
        [
          3,
          5
        ],
        [
          6,
          7
        ],
        [
          8,
          10
        ],
        [
          12,
          16
        ]
      ],
      "newInterval": [
        4,
        8
      ]
    },
    {
      "label": "Ex3",
      "intervals": [
        [
          1,
          5
        ]
      ],
      "newInterval": [
        2,
        3
      ]
    },
    {
      "label": "Ex4",
      "intervals": [
        [
          1,
          5
        ]
      ],
      "newInterval": [
        6,
        8
      ]
    }
  ],
  "interleaving-string": [
    {
      "label": "s1=aab s2=axy s3=aaxaby",
      "s1": "aab",
      "s2": "axy",
      "s3": "aaxaby"
    },
    {
      "label": "s1=aab s2=axy s3=aayxab",
      "s1": "aab",
      "s2": "axy",
      "s3": "aayxab"
    },
    {
      "label": "s1=ab s2=bc s3=bbac",
      "s1": "ab",
      "s2": "bc",
      "s3": "bbac"
    }
  ],
  "intersection-two-linked-lists": [
    {
      "label": "Ex 1",
      "listA": [
        4,
        1
      ],
      "listB": [
        5,
        6,
        1
      ],
      "shared": [
        8,
        4,
        5
      ],
      "intersectVal": 8
    },
    {
      "label": "Ex 2",
      "listA": [
        1,
        9,
        1
      ],
      "listB": [
        3
      ],
      "shared": [
        2,
        4
      ],
      "intersectVal": 2
    },
    {
      "label": "No Intersect",
      "listA": [
        2,
        6,
        4
      ],
      "listB": [
        1,
        5
      ],
      "shared": [],
      "intersectVal": null
    }
  ],
  "invert-binary-tree": [
    {
      "label": "LeetCode",
      "arr": [
        4,
        2,
        7,
        1,
        3,
        6,
        9
      ]
    },
    {
      "label": "Simple",
      "arr": [
        2,
        1,
        3
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    },
    {
      "label": "Left Heavy",
      "arr": [
        1,
        2,
        null,
        3,
        4
      ]
    }
  ],
  "jump-game": [
    {
      "label": "Reachable",
      "nums": [
        2,
        3,
        1,
        1,
        4
      ]
    },
    {
      "label": "Stuck",
      "nums": [
        3,
        2,
        1,
        0,
        4
      ]
    },
    {
      "label": "Single",
      "nums": [
        0
      ]
    },
    {
      "label": "Big jumps",
      "nums": [
        5,
        0,
        0,
        0,
        0,
        1
      ]
    },
    {
      "label": "Tight",
      "nums": [
        1,
        1,
        1,
        1,
        0
      ]
    }
  ],
  "jump-game-ii": [
    {
      "label": "[2,3,1,1,4]",
      "nums": [
        2,
        3,
        1,
        1,
        4
      ]
    },
    {
      "label": "[2,3,0,1,4]",
      "nums": [
        2,
        3,
        0,
        1,
        4
      ]
    },
    {
      "label": "[1,1,1,1]",
      "nums": [
        1,
        1,
        1,
        1
      ]
    },
    {
      "label": "[3,2,1,0,4]",
      "nums": [
        3,
        2,
        1,
        0,
        4
      ]
    }
  ],
  "kth-largest-element": [
    {
      "label": "Example 1",
      "nums": [
        3,
        2,
        1,
        5,
        6,
        4
      ],
      "k": 2
    },
    {
      "label": "Example 2",
      "nums": [
        3,
        2,
        3,
        1,
        2,
        4,
        5,
        5,
        6
      ],
      "k": 4
    },
    {
      "label": "Small",
      "nums": [
        7,
        10,
        4,
        3,
        20,
        15
      ],
      "k": 3
    }
  ],
  "kth-smallest": [
    {
      "label": "LeetCode",
      "arr": [
        3,
        1,
        4,
        null,
        2
      ],
      "k": 1
    },
    {
      "label": "Example 2",
      "arr": [
        5,
        3,
        6,
        2,
        4,
        null,
        null,
        1
      ],
      "k": 3
    },
    {
      "label": "k=4",
      "arr": [
        5,
        3,
        7,
        1,
        4,
        6,
        8
      ],
      "k": 4
    },
    {
      "label": "Root",
      "arr": [
        2,
        1,
        3
      ],
      "k": 2
    }
  ],
  "lcabst": [
    {
      "label": "LeetCode 1",
      "arrInput": "[6,2,8,0,4,7,9,null,null,3,5]",
      "p": 2,
      "q": 8
    },
    {
      "label": "LeetCode 2",
      "arrInput": "[6,2,8,0,4,7,9,null,null,3,5]",
      "p": 2,
      "q": 4
    },
    {
      "label": "Simple",
      "arrInput": "[4,2,6,1,3,5,7]",
      "p": 1,
      "q": 3
    },
    {
      "label": "Deep",
      "arrInput": "[4,2,6,1,3,5,7]",
      "p": 1,
      "q": 7
    }
  ],
  "lcabinary-tree": [
    {
      "label": "LeetCode",
      "arr": [
        3,
        5,
        1,
        6,
        2,
        0,
        8,
        null,
        null,
        7,
        4
      ],
      "p": 5,
      "q": 1
    },
    {
      "label": "p=5,q=4",
      "arr": [
        3,
        5,
        1,
        6,
        2,
        0,
        8,
        null,
        null,
        7,
        4
      ],
      "p": 5,
      "q": 4
    },
    {
      "label": "Small",
      "arr": [
        1,
        2,
        3
      ],
      "p": 2,
      "q": 3
    },
    {
      "label": "Deep",
      "arr": [
        6,
        2,
        8,
        0,
        4,
        7,
        9,
        null,
        null,
        3,
        5
      ],
      "p": 0,
      "q": 5
    }
  ],
  "lcs": [
    {
      "label": "LeetCode",
      "t1": "abcde",
      "t2": "ace"
    },
    {
      "label": "Identical",
      "t1": "abc",
      "t2": "abc"
    },
    {
      "label": "No LCS",
      "t1": "abc",
      "t2": "def"
    },
    {
      "label": "Long",
      "t1": "abcba",
      "t2": "abcbcba"
    }
  ],
  "lfucache": [
    {
      "label": "LFU(2)",
      "capacity": 2,
      "ops": [
        {
          "type": "put",
          "key": 1,
          "val": 1
        },
        {
          "type": "put",
          "key": 2,
          "val": 2
        },
        {
          "type": "get",
          "key": 1
        },
        {
          "type": "put",
          "key": 3,
          "val": 3
        },
        {
          "type": "get",
          "key": 2
        },
        {
          "type": "get",
          "key": 3
        },
        {
          "type": "put",
          "key": 4,
          "val": 4
        },
        {
          "type": "get",
          "key": 1
        },
        {
          "type": "get",
          "key": 3
        },
        {
          "type": "get",
          "key": 4
        }
      ]
    },
    {
      "label": "LFU(3)",
      "capacity": 3,
      "ops": [
        {
          "type": "put",
          "key": 1,
          "val": 1
        },
        {
          "type": "put",
          "key": 2,
          "val": 2
        },
        {
          "type": "put",
          "key": 3,
          "val": 3
        },
        {
          "type": "get",
          "key": 1
        },
        {
          "type": "get",
          "key": 2
        },
        {
          "type": "put",
          "key": 4,
          "val": 4
        },
        {
          "type": "get",
          "key": 3
        },
        {
          "type": "get",
          "key": 4
        }
      ]
    }
  ],
  "lrucache": [
    {
      "label": "Classic 146",
      "commands": [
        "LRUCache",
        "put",
        "put",
        "get",
        "put",
        "get",
        "put",
        "get",
        "get",
        "get"
      ],
      "argsList": [
        [
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          2
        ],
        [
          1
        ],
        [
          3,
          3
        ],
        [
          2
        ],
        [
          4,
          4
        ],
        [
          1
        ],
        [
          3
        ],
        [
          4
        ]
      ]
    },
    {
      "label": "Overwrite",
      "commands": [
        "LRUCache",
        "put",
        "put",
        "put",
        "get"
      ],
      "argsList": [
        [
          2
        ],
        [
          2,
          1
        ],
        [
          2,
          2
        ],
        [
          2,
          3
        ],
        [
          2
        ]
      ]
    },
    {
      "label": "Capacity 1",
      "commands": [
        "LRUCache",
        "put",
        "get",
        "put",
        "get",
        "get"
      ],
      "argsList": [
        [
          1
        ],
        [
          2,
          1
        ],
        [
          2
        ],
        [
          3,
          2
        ],
        [
          2
        ],
        [
          3
        ]
      ]
    }
  ],
  "largest-rectangle-in-histogram": [
    {
      "label": "Classic",
      "heights": [
        2,
        1,
        5,
        6,
        2,
        3
      ]
    },
    {
      "label": "Simple",
      "heights": [
        2,
        4
      ]
    },
    {
      "label": "Plateau",
      "heights": [
        2,
        2,
        2,
        2
      ]
    }
  ],
  "length-of-last-word": [
    {
      "label": "Ex 1",
      "s": "Hello World"
    },
    {
      "label": "Ex 2",
      "s": "   fly me   to   the moon  "
    },
    {
      "label": "Ex 3",
      "s": "luffy is still joyboy"
    }
  ],
  "letter-combinations": [
    {
      "label": "\"23\"",
      "digits": "23"
    },
    {
      "label": "\"\"",
      "digits": ""
    },
    {
      "label": "\"2\"",
      "digits": "2"
    },
    {
      "label": "\"234\"",
      "digits": "234"
    }
  ],
  "linked-list-cycle": [
    {
      "label": "Cycle 0",
      "nodeCount": 5,
      "tail": 0,
      "desc": "[3,2,0,-4] tail→pos 0"
    },
    {
      "label": "Cycle 1",
      "nodeCount": 3,
      "tail": 1,
      "desc": "[1,2] tail→pos 1"
    },
    {
      "label": "No cycle",
      "nodeCount": 4,
      "tail": -1,
      "desc": "[1,2,3,4] no cycle"
    },
    {
      "label": "Single",
      "nodeCount": 1,
      "tail": -1,
      "desc": "[1] single node, no cycle"
    },
    {
      "label": "Self loop",
      "nodeCount": 1,
      "tail": 0,
      "desc": "[1] self loop"
    }
  ],
  "longest-consecutive-sequence": [
    {
      "label": "Classic",
      "nums": [
        100,
        4,
        200,
        1,
        3,
        2
      ]
    },
    {
      "label": "Long run",
      "nums": [
        0,
        3,
        7,
        2,
        5,
        8,
        4,
        6,
        0,
        1
      ]
    },
    {
      "label": "Negatives",
      "nums": [
        -4,
        -1,
        -2,
        0,
        1,
        2
      ]
    },
    {
      "label": "Singles",
      "nums": [
        5,
        1,
        9,
        3
      ]
    }
  ],
  "longest-increasing-path": [
    {
      "label": "Ex 1",
      "matrix": [
        [
          9,
          9,
          4
        ],
        [
          6,
          6,
          8
        ],
        [
          2,
          1,
          1
        ]
      ]
    },
    {
      "label": "Ex 2",
      "matrix": [
        [
          3,
          4,
          5
        ],
        [
          3,
          2,
          6
        ],
        [
          2,
          2,
          1
        ]
      ]
    },
    {
      "label": "Ex 3",
      "matrix": [
        [
          1,
          2
        ],
        [
          4,
          3
        ]
      ]
    }
  ],
  "longest-increasing-subsequence": [
    {
      "label": "Classic",
      "nums": [
        10,
        9,
        2,
        5,
        3,
        7,
        101,
        18
      ]
    },
    {
      "label": "All same",
      "nums": [
        1,
        1,
        1,
        1
      ]
    },
    {
      "label": "Sorted",
      "nums": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "Reversed",
      "nums": [
        5,
        4,
        3,
        2,
        1
      ]
    },
    {
      "label": "LeetCode",
      "nums": [
        0,
        1,
        0,
        3,
        2,
        3
      ]
    }
  ],
  "longest-common-prefix": [
    {
      "label": "flower/flow/flight",
      "strs": [
        "flower",
        "flow",
        "flight"
      ]
    },
    {
      "label": "Single char",
      "strs": [
        "a"
      ]
    },
    {
      "label": "No prefix",
      "strs": [
        "dog",
        "racecar",
        "car"
      ]
    },
    {
      "label": "Same strings",
      "strs": [
        "abc",
        "abc",
        "abc"
      ]
    },
    {
      "label": "Common 'in'",
      "strs": [
        "interact",
        "international",
        "intent"
      ]
    }
  ],
  "longest-palindrome": [
    {
      "label": "Example 1",
      "s": "babad"
    },
    {
      "label": "Example 2",
      "s": "cbbd"
    },
    {
      "label": "All Same",
      "s": "aaaa"
    },
    {
      "label": "Single",
      "s": "a"
    }
  ],
  "longest-repeating-char-replace": [
    {
      "label": "ABAB k=2",
      "s": "ABAB",
      "k": 2
    },
    {
      "label": "AABABBA k=1",
      "s": "AABABBA",
      "k": 1
    },
    {
      "label": "AAAA k=0",
      "s": "AAAA",
      "k": 0
    }
  ],
  "longest-substring-without-repeating": [
    {
      "label": "Classic",
      "s": "abcabcbb"
    },
    {
      "label": "All Same",
      "s": "bbbbb"
    },
    {
      "label": "Pwwkew",
      "s": "pwwkew"
    },
    {
      "label": "No Repeats",
      "s": "abcdef"
    },
    {
      "label": "Empty",
      "s": ""
    }
  ],
  "majority-element": [
    {
      "label": "Basic",
      "nums": [
        3,
        2,
        3
      ]
    },
    {
      "label": "LeetCode",
      "nums": [
        2,
        2,
        1,
        1,
        1,
        2,
        2
      ]
    },
    {
      "label": "All Same",
      "nums": [
        5,
        5,
        5,
        5
      ]
    },
    {
      "label": "Longer",
      "nums": [
        1,
        3,
        1,
        3,
        1,
        3,
        1
      ]
    }
  ],
  "matrix-iteration-basics": [
    3,
    4,
    5,
    6
  ],
  "max-depth-binary-tree": [
    {
      "label": "LeetCode",
      "arr": [
        3,
        9,
        20,
        null,
        null,
        15,
        7
      ]
    },
    {
      "label": "Skewed",
      "arr": [
        1,
        2,
        null,
        3,
        null,
        4
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    },
    {
      "label": "Full",
      "arr": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    }
  ],
  "max-points-on-aline": [
    {
      "label": "Ex 1",
      "points": [
        [
          1,
          1
        ],
        [
          2,
          2
        ],
        [
          3,
          3
        ]
      ]
    },
    {
      "label": "Ex 2",
      "points": [
        [
          1,
          1
        ],
        [
          3,
          2
        ],
        [
          5,
          3
        ],
        [
          4,
          1
        ],
        [
          2,
          3
        ],
        [
          1,
          4
        ]
      ]
    },
    {
      "label": "Ex 3",
      "points": [
        [
          0,
          0
        ],
        [
          1,
          1
        ],
        [
          1,
          -1
        ]
      ]
    }
  ],
  "max-product-subarray": [
    {
      "label": "Basic",
      "nums": [
        2,
        3,
        -2,
        4
      ]
    },
    {
      "label": "Negatives",
      "nums": [
        -2,
        0,
        -1
      ]
    },
    {
      "label": "LeetCode",
      "nums": [
        2,
        -5,
        -2,
        -4,
        3
      ]
    },
    {
      "label": "All Neg",
      "nums": [
        -3,
        -1,
        -1
      ]
    }
  ],
  "maximum-gap": [
    {
      "label": "Ex 1",
      "nums": [
        3,
        6,
        9,
        1
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        10
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        1,
        10000000
      ]
    },
    {
      "label": "Ex 4",
      "nums": [
        1,
        3,
        6,
        2,
        8,
        12
      ]
    }
  ],
  "maximum-subarray": [
    {
      "label": "Standard",
      "nums": [
        -2,
        1,
        -3,
        4,
        -1,
        2,
        1,
        -5,
        4
      ]
    },
    {
      "label": "All Negative",
      "nums": [
        -5,
        -2,
        -9,
        -1
      ]
    },
    {
      "label": "All Positive",
      "nums": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "Single Element",
      "nums": [
        1
      ]
    }
  ],
  "median-of-two-sorted-arrays": [
    {
      "label": "Classic",
      "nums1": [
        1,
        3
      ],
      "nums2": [
        2
      ]
    },
    {
      "label": "Even Total",
      "nums1": [
        1,
        2
      ],
      "nums2": [
        3,
        4
      ]
    },
    {
      "label": "Different Sizes",
      "nums1": [
        1,
        2,
        5,
        9
      ],
      "nums2": [
        3,
        4,
        6,
        7,
        8
      ]
    },
    {
      "label": "One Empty",
      "nums1": [],
      "nums2": [
        1
      ]
    },
    {
      "label": "Duplicates",
      "nums1": [
        0,
        0
      ],
      "nums2": [
        0,
        0
      ]
    },
    {
      "label": "Swap Needed",
      "nums1": [
        8,
        9,
        10,
        11
      ],
      "nums2": [
        1,
        2,
        3
      ]
    },
    {
      "label": "Large Input",
      "nums1": [
        1,
        3,
        5,
        7,
        9,
        11,
        13,
        15,
        17,
        19
      ],
      "nums2": [
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        4,
        6,
        8,
        10,
        12,
        14,
        16,
        18,
        20
      ]
    }
  ],
  "merge-intervals": [
    {
      "label": "Classic",
      "intervals": [
        [
          1,
          3
        ],
        [
          2,
          6
        ],
        [
          8,
          10
        ],
        [
          15,
          18
        ]
      ]
    },
    {
      "label": "Enclosed",
      "intervals": [
        [
          1,
          4
        ],
        [
          2,
          3
        ]
      ]
    },
    {
      "label": "Contiguous",
      "intervals": [
        [
          1,
          4
        ],
        [
          4,
          5
        ]
      ]
    },
    {
      "label": "All Overlap",
      "intervals": [
        [
          1,
          10
        ],
        [
          2,
          9
        ],
        [
          3,
          8
        ],
        [
          4,
          7
        ]
      ]
    },
    {
      "label": "Unsorted",
      "intervals": [
        [
          15,
          18
        ],
        [
          1,
          3
        ],
        [
          8,
          10
        ],
        [
          2,
          6
        ]
      ]
    }
  ],
  "merge-ksorted-lists": [
    {
      "label": "Classic",
      "lists": [
        [
          1,
          4,
          5
        ],
        [
          1,
          3,
          4
        ],
        [
          2,
          6
        ]
      ]
    },
    {
      "label": "Uneven",
      "lists": [
        [
          1,
          10
        ],
        [
          2,
          3,
          4
        ],
        [
          5
        ],
        [
          6,
          7,
          8,
          9
        ]
      ]
    }
  ],
  "merge-sorted-array": [
    {
      "label": "Ex 1",
      "nums1": [
        1,
        2,
        3,
        0,
        0,
        0
      ],
      "m": 3,
      "nums2": [
        2,
        5,
        6
      ],
      "n": 3
    },
    {
      "label": "Ex 2",
      "nums1": [
        1,
        0
      ],
      "m": 1,
      "nums2": [
        2
      ],
      "n": 1
    },
    {
      "label": "Ex 3",
      "nums1": [
        4,
        5,
        6,
        0,
        0,
        0
      ],
      "m": 3,
      "nums2": [
        1,
        2,
        3
      ],
      "n": 3
    }
  ],
  "merge-two-sorted-lists": [
    {
      "label": "Standard",
      "list1": [
        1,
        2,
        4
      ],
      "list2": [
        1,
        3,
        4
      ]
    },
    {
      "label": "Different Sizes",
      "list1": [
        1,
        2,
        4,
        8,
        9
      ],
      "list2": [
        3,
        5
      ]
    },
    {
      "label": "Empty List1",
      "list1": [],
      "list2": [
        0
      ]
    },
    {
      "label": "Both Empty",
      "list1": [],
      "list2": []
    },
    {
      "label": "Large Lists",
      "list1": [
        1,
        3,
        5,
        7,
        9,
        11,
        13,
        15,
        17,
        19
      ],
      "list2": [
        1,
        1,
        1,
        1,
        1,
        2,
        4,
        6,
        8,
        10,
        12,
        14,
        16,
        18,
        20
      ]
    }
  ],
  "min-cost-climbing-stairs": [
    {
      "label": "[10,15,20]",
      "input": [
        10,
        15,
        20
      ]
    },
    {
      "label": "[1,100,1,1,1,100,1,1,100,1]",
      "input": [
        1,
        100,
        1,
        1,
        1,
        100,
        1,
        1,
        100,
        1
      ]
    }
  ],
  "min-size-subarray-sum": [
    {
      "label": "Ex 1",
      "target": 7,
      "nums": [
        2,
        3,
        1,
        2,
        4,
        3
      ]
    },
    {
      "label": "Ex 2",
      "target": 4,
      "nums": [
        1,
        4,
        4
      ]
    },
    {
      "label": "Ex 3",
      "target": 11,
      "nums": [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ]
    }
  ],
  "min-stack": [
    {
      "label": "LC Example",
      "ops": [
        {
          "type": "push",
          "val": -2
        },
        {
          "type": "push",
          "val": 0
        },
        {
          "type": "push",
          "val": -3
        },
        {
          "type": "getMin"
        },
        {
          "type": "pop"
        },
        {
          "type": "top"
        },
        {
          "type": "getMin"
        }
      ]
    },
    {
      "label": "Simple",
      "ops": [
        {
          "type": "push",
          "val": 5
        },
        {
          "type": "push",
          "val": 3
        },
        {
          "type": "push",
          "val": 7
        },
        {
          "type": "getMin"
        },
        {
          "type": "pop"
        },
        {
          "type": "getMin"
        }
      ]
    },
    {
      "label": "Decreasing",
      "ops": [
        {
          "type": "push",
          "val": 10
        },
        {
          "type": "push",
          "val": 6
        },
        {
          "type": "push",
          "val": 3
        },
        {
          "type": "push",
          "val": 1
        },
        {
          "type": "getMin"
        },
        {
          "type": "pop"
        },
        {
          "type": "getMin"
        }
      ]
    }
  ],
  "minimum-window-substring": [
    {
      "label": "Classic",
      "s": "ADOBECODEBANC",
      "t": "ABC"
    },
    {
      "label": "Tiny",
      "s": "a",
      "t": "a"
    },
    {
      "label": "No Answer",
      "s": "a",
      "t": "aa"
    },
    {
      "label": "Repeats",
      "s": "AAABBC",
      "t": "ABC"
    }
  ],
  "missing-number": [
    {
      "label": "Ex 1",
      "nums": [
        3,
        0,
        1
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        0,
        1
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        9,
        6,
        4,
        2,
        3,
        5,
        7,
        0,
        1
      ]
    }
  ],
  "move-zeroes": [
    {
      "label": "Ex 1",
      "nums": [
        0,
        1,
        0,
        3,
        12
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        0,
        0,
        1
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        1,
        0,
        2,
        0,
        0,
        4,
        5
      ]
    }
  ],
  "nqueens": [
    {
      "label": "n=4",
      "n": 4
    },
    {
      "label": "n=5",
      "n": 5
    },
    {
      "label": "n=6",
      "n": 6
    }
  ],
  "next-permutation": [
    {
      "label": "[1,2,3]",
      "nums": [
        1,
        2,
        3
      ]
    },
    {
      "label": "[3,2,1]",
      "nums": [
        3,
        2,
        1
      ]
    },
    {
      "label": "[1,1,5]",
      "nums": [
        1,
        1,
        5
      ]
    },
    {
      "label": "[1,3,2,4,3]",
      "nums": [
        1,
        3,
        2,
        4,
        3
      ]
    }
  ],
  "non-overlapping-intervals": [
    {
      "label": "LeetCode",
      "val": "[[1,2],[2,3],[3,4],[1,3]]"
    },
    {
      "label": "Example 2",
      "val": "[[1,2],[1,2],[1,2]]"
    },
    {
      "label": "Example 3",
      "val": "[[1,2],[2,3]]"
    },
    {
      "label": "Complex",
      "val": "[[1,100],[11,22],[1,11],[2,12]]"
    }
  ],
  "number-of1-bits": [
    {
      "label": "Ex 1",
      "n": 11,
      "desc": "11 (0b1011)"
    },
    {
      "label": "Ex 2",
      "n": 128,
      "desc": "128 (0b10000000)"
    },
    {
      "label": "Ex 3",
      "n": 4294967293,
      "desc": "4294967293 (0b1111…1101)"
    }
  ],
  "number-of-islands": [
    {
      "label": "Standard",
      "gridStr": "[\n  [\"1\",\"1\",\"1\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"0\",\"0\"]\n]"
    },
    {
      "label": "Multiple",
      "gridStr": "[\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"1\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"1\",\"1\"]\n]"
    },
    {
      "label": "Checkerboard",
      "gridStr": "[\n  [\"1\",\"0\",\"1\"],\n  [\"0\",\"1\",\"0\"],\n  [\"1\",\"0\",\"1\"]\n]"
    }
  ],
  "number-of-islands-ii": [
    {
      "label": "Islands Form",
      "m": 3,
      "n": 3,
      "positions": [[0, 0], [0, 2], [2, 1]]
    },
    {
      "label": "Islands Merge",
      "m": 4,
      "n": 4,
      "positions": [[0, 0], [0, 1], [1, 0], [1, 1]]
    },
    {
      "label": "Single Island",
      "m": 2,
      "n": 2,
      "positions": [[0, 0], [0, 1], [1, 0], [1, 1]]
    }
  ],
  "palindrome-linked-list": [
    {
      "label": "1→2→2→1",
      "nums": [
        1,
        2,
        2,
        1
      ]
    },
    {
      "label": "1→2→1",
      "nums": [
        1,
        2,
        1
      ]
    },
    {
      "label": "1→2",
      "nums": [
        1,
        2
      ]
    },
    {
      "label": "1→2→3→2→1",
      "nums": [
        1,
        2,
        3,
        2,
        1
      ]
    }
  ],
  "palindrome-number": [
    {
      "label": "121",
      "value": "121"
    },
    {
      "label": "-121",
      "value": "-121"
    },
    {
      "label": "10",
      "value": "10"
    },
    {
      "label": "0",
      "value": "0"
    },
    {
      "label": "1221",
      "value": "1221"
    },
    {
      "label": "12321",
      "value": "12321"
    },
    {
      "label": "1234321",
      "value": "1234321"
    }
  ],
  "palindrome-partitioning": [
    {
      "label": "\"aab\"",
      "s": "aab"
    },
    {
      "label": "\"a\"",
      "s": "a"
    },
    {
      "label": "\"racecar\"",
      "s": "racecar"
    },
    {
      "label": "\"aabb\"",
      "s": "aabb"
    }
  ],
  "palindrome-partitioning-ii": [
    {
      "label": "aab",
      "s": "aab"
    },
    {
      "label": "aabb",
      "s": "aabb"
    },
    {
      "label": "aaabbc",
      "s": "aaabbc"
    }
  ],
  "palindromic-substrings": [
    {
      "label": "LeetCode",
      "s": "abc"
    },
    {
      "label": "aaa",
      "s": "aaa"
    },
    {
      "label": "abcba",
      "s": "abcba"
    },
    {
      "label": "racecar",
      "s": "racecar"
    }
  ],
  "partition-equal-subset": [
    {
      "label": "[1,5,11,5]",
      "nums": [
        1,
        5,
        11,
        5
      ]
    },
    {
      "label": "[1,2,3,5]",
      "nums": [
        1,
        2,
        3,
        5
      ]
    },
    {
      "label": "[3,3,3,4,5]",
      "nums": [
        3,
        3,
        3,
        4,
        5
      ]
    },
    {
      "label": "[1,1]",
      "nums": [
        1,
        1
      ]
    }
  ],
  "pascals-triangle": [
    {
      "label": "5 rows",
      "numRows": 5
    },
    {
      "label": "6 rows",
      "numRows": 6
    },
    {
      "label": "7 rows",
      "numRows": 7
    }
  ],
  "permutation-in-string": [
    {
      "label": "s1=\"ab\" s2=\"eidbaooo\"",
      "s1": "ab",
      "s2": "eidbaooo"
    },
    {
      "label": "s1=\"ab\" s2=\"eidboaoo\"",
      "s1": "ab",
      "s2": "eidboaoo"
    },
    {
      "label": "s1=\"adc\" s2=\"dcda\"",
      "s1": "adc",
      "s2": "dcda"
    }
  ],
  "permutations": [
    {
      "label": "[1,2,3]",
      "nums": [
        1,
        2,
        3
      ]
    },
    {
      "label": "[0,1]",
      "nums": [
        0,
        1
      ]
    },
    {
      "label": "[1,2,3,4]",
      "nums": [
        1,
        2,
        3,
        4
      ]
    }
  ],
  "permutations-ii": [
    {
      "label": "[1,1,2]",
      "nums": [
        1,
        1,
        2
      ]
    },
    {
      "label": "[0,1]",
      "nums": [
        0,
        1
      ]
    },
    {
      "label": "[1,2,2]",
      "nums": [
        1,
        2,
        2
      ]
    },
    {
      "label": "[1,1,1]",
      "nums": [
        1,
        1,
        1
      ]
    }
  ],
  "plus-one": [
    {
      "label": "Ex 1",
      "digits": [
        1,
        2,
        3
      ],
      "desc": "123"
    },
    {
      "label": "Ex 2",
      "digits": [
        4,
        3,
        2,
        1
      ],
      "desc": "4321"
    },
    {
      "label": "Ex 3",
      "digits": [
        9
      ],
      "desc": "9"
    },
    {
      "label": "Ex 4",
      "digits": [
        9,
        9,
        9
      ],
      "desc": "999"
    }
  ],
  "power-of-two": [
    {
      "label": "n=1",
      "n": 1,
      "desc": "2⁰ = 1"
    },
    {
      "label": "n=16",
      "n": 16,
      "desc": "2⁴ = 16"
    },
    {
      "label": "n=3",
      "n": 3,
      "desc": "Not power"
    },
    {
      "label": "n=100",
      "n": 100,
      "desc": "Not power"
    }
  ],
  "product-of-array-except-self": [
    {
      "label": "Classic",
      "nums": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "label": "With Zero",
      "nums": [
        1,
        0,
        3,
        4
      ]
    },
    {
      "label": "Two Zeros",
      "nums": [
        0,
        0,
        1,
        2
      ]
    },
    {
      "label": "Negatives",
      "nums": [
        -1,
        2,
        -3,
        4
      ]
    }
  ],
  "randomized-collection": [
    {
      "label": "Ex 1",
      "ops": [
        {
          "type": "insert",
          "val": 1
        },
        {
          "type": "insert",
          "val": 1
        },
        {
          "type": "insert",
          "val": 2
        },
        {
          "type": "getRandom"
        },
        {
          "type": "remove",
          "val": 1
        },
        {
          "type": "getRandom"
        },
        {
          "type": "insert",
          "val": 2
        },
        {
          "type": "getRandom"
        },
        {
          "type": "remove",
          "val": 2
        },
        {
          "type": "getRandom"
        }
      ]
    },
    {
      "label": "Ex 2",
      "ops": [
        {
          "type": "insert",
          "val": 0
        },
        {
          "type": "insert",
          "val": 1
        },
        {
          "type": "remove",
          "val": 0
        },
        {
          "type": "insert",
          "val": 2
        },
        {
          "type": "remove",
          "val": 1
        },
        {
          "type": "getRandom"
        }
      ]
    }
  ],
  "redundant-connection": [
    {
      "label": "Triangle",
      "edges": [
        [
          1,
          2
        ],
        [
          1,
          3
        ],
        [
          2,
          3
        ]
      ]
    },
    {
      "label": "Late Cycle",
      "edges": [
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ],
        [
          1,
          4
        ],
        [
          1,
          5
        ]
      ]
    }
  ],
  "remove-duplicates": [
    {
      "label": "Ex 1",
      "nums": [
        1,
        1,
        2
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        0,
        0,
        1,
        1,
        1,
        2,
        2,
        3,
        3,
        4
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        1,
        2,
        2,
        3,
        4,
        4,
        5
      ]
    }
  ],
  "remove-nth-node": [
    {
      "label": "LeetCode",
      "input": "[1,2,3,4,5]; 2"
    },
    {
      "label": "Remove Head",
      "input": "[1,2,3]; 3"
    },
    {
      "label": "Remove Tail",
      "input": "[1,2,3]; 1"
    },
    {
      "label": "Single",
      "input": "[1]; 1"
    }
  ],
  "reorder-list": [
    {
      "label": "[1,2,3,4]",
      "arr": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "label": "[1,2,3,4,5]",
      "arr": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "[1,2,3,4,5,6]",
      "arr": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    }
  ],
  "russian-doll-envelopes": [
    {
      "label": "Simple nesting",
      "envelopes": [
        [2, 3],
        [5, 4],
        [6, 4],
        [6, 7]
      ]
    },
    {
      "label": "No nesting",
      "envelopes": [
        [1, 1],
        [1, 1],
        [1, 1]
      ]
    },
    {
      "label": "Complex chain",
      "envelopes": [
        [2, 100],
        [3, 200],
        [4, 300],
        [5, 500],
        [5, 400],
        [5, 600],
        [6, 700]
      ]
    }
  ],
  "reverse-bits": [
    {
      "label": "Ex 1",
      "n": 43261596,
      "desc": "43261596"
    },
    {
      "label": "Ex 2",
      "n": 4294967293,
      "desc": "4294967293"
    },
    {
      "label": "Ex 3",
      "n": 1,
      "desc": "1"
    }
  ],
  "reverse-integer": [
    {
      "label": "Positive",
      "x": 123
    },
    {
      "label": "Negative",
      "x": -123
    },
    {
      "label": "Zero Ending",
      "x": 120
    },
    {
      "label": "Overflow",
      "x": 1534236469
    }
  ],
  "reverse-kgroup": [
    {
      "label": "Ex 1",
      "list": [
        1,
        2,
        3,
        4,
        5
      ],
      "k": 2
    },
    {
      "label": "Ex 2",
      "list": [
        1,
        2,
        3,
        4,
        5
      ],
      "k": 3
    },
    {
      "label": "Ex 3",
      "list": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "k": 2
    }
  ],
  "reverse-linked-list": [
    {
      "label": "1→2→3→4→5",
      "values": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    {
      "label": "1→2",
      "values": [
        1,
        2
      ]
    },
    {
      "label": "Single",
      "values": [
        42
      ]
    },
    {
      "label": "Short",
      "values": [
        3,
        1,
        4,
        1,
        5
      ]
    }
  ],
  "reverse-string": [
    {
      "label": "Ex 1",
      "s": [
        "h",
        "e",
        "l",
        "l",
        "o"
      ]
    },
    {
      "label": "Ex 2",
      "s": [
        "H",
        "a",
        "n",
        "n",
        "a",
        "h"
      ]
    },
    {
      "label": "Ex 3",
      "s": [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
      ]
    }
  ],
  "reverse-vowels": [
    {
      "label": "\"hello\"",
      "input": "hello"
    },
    {
      "label": "\"leetcode\"",
      "input": "leetcode"
    },
    {
      "label": "\"aA\"",
      "input": "aA"
    }
  ],
  "right-side-view": [
    {
      "label": "Example",
      "arr": [
        1,
        2,
        3,
        null,
        5,
        null,
        4
      ]
    },
    {
      "label": "Skewed",
      "arr": [
        1,
        2,
        null,
        3
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    },
    {
      "label": "Full",
      "arr": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    }
  ],
  "roman-to-integer": [
    {
      "label": "Standard",
      "s": "III"
    },
    {
      "label": "Subtractive IV",
      "s": "IV"
    },
    {
      "label": "Subtractive IX",
      "s": "IX"
    },
    {
      "label": "Complex",
      "s": "MCMXCIV"
    },
    {
      "label": "Large",
      "s": "MMMCMXCIX"
    }
  ],
  "rotate-array": [
    {
      "label": "[1,2,3,4,5,6,7], k=3",
      "nums": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ],
      "k": 3
    },
    {
      "label": "[-1,-100,3,99], k=2",
      "nums": [
        -1,
        -100,
        3,
        99
      ],
      "k": 2
    },
    {
      "label": "[1,2,3,4,5], k=1",
      "nums": [
        1,
        2,
        3,
        4,
        5
      ],
      "k": 1
    }
  ],
  "rotate-image": [
    {
      "label": "3×3",
      "matrix": [
        [
          1,
          2,
          3
        ],
        [
          4,
          5,
          6
        ],
        [
          7,
          8,
          9
        ]
      ]
    },
    {
      "label": "4×4",
      "matrix": [
        [
          5,
          1,
          9,
          11
        ],
        [
          2,
          4,
          8,
          10
        ],
        [
          13,
          3,
          6,
          7
        ],
        [
          15,
          14,
          12,
          16
        ]
      ]
    }
  ],
  "rotting-oranges": [
    {
      "label": "Classic",
      "grid": [
        [
          2,
          1,
          1
        ],
        [
          1,
          1,
          0
        ],
        [
          0,
          1,
          1
        ]
      ]
    },
    {
      "label": "Unreachable",
      "grid": [
        [
          2,
          1,
          1
        ],
        [
          0,
          1,
          1
        ],
        [
          1,
          0,
          1
        ]
      ]
    },
    {
      "label": "Already Done",
      "grid": [
        [
          0,
          2
        ]
      ]
    },
    {
      "label": "Multi Source",
      "grid": [
        [
          2,
          1,
          1
        ],
        [
          1,
          1,
          1
        ],
        [
          1,
          1,
          2
        ]
      ]
    }
  ],
  "same-tree": [
    {
      "label": "Same (LC ex1)",
      "p": [
        1,
        2,
        3
      ],
      "q": [
        1,
        2,
        3
      ]
    },
    {
      "label": "Different vals",
      "p": [
        1,
        2
      ],
      "q": [
        1,
        null,
        2
      ]
    },
    {
      "label": "Val mismatch",
      "p": [
        1,
        2,
        1
      ],
      "q": [
        1,
        1,
        2
      ]
    },
    {
      "label": "Larger same",
      "p": [
        4,
        2,
        7,
        1,
        3,
        6,
        9
      ],
      "q": [
        4,
        2,
        7,
        1,
        3,
        6,
        9
      ]
    }
  ],
  "search2-dmatrix": [
    {
      "label": "target=3",
      "matrix": [
        [
          1,
          3,
          5,
          7
        ],
        [
          10,
          11,
          16,
          20
        ],
        [
          23,
          30,
          34,
          60
        ]
      ],
      "target": 3
    },
    {
      "label": "target=13",
      "matrix": [
        [
          1,
          3,
          5,
          7
        ],
        [
          10,
          11,
          16,
          20
        ],
        [
          23,
          30,
          34,
          60
        ]
      ],
      "target": 13
    },
    {
      "label": "target=16",
      "matrix": [
        [
          1,
          3,
          5,
          7
        ],
        [
          10,
          11,
          16,
          20
        ],
        [
          23,
          30,
          34,
          60
        ]
      ],
      "target": 16
    }
  ],
  "search-a-2d-matrix": [
    {
      "label": "target=3",
      "matrix": [
        [
          1,
          3,
          5,
          7
        ],
        [
          10,
          11,
          16,
          20
        ],
        [
          23,
          30,
          34,
          60
        ]
      ],
      "target": 3
    },
    {
      "label": "target=13",
      "matrix": [
        [
          1,
          3,
          5,
          7
        ],
        [
          10,
          11,
          16,
          20
        ],
        [
          23,
          30,
          34,
          60
        ]
      ],
      "target": 13
    },
    {
      "label": "target=16",
      "matrix": [
        [
          1,
          3,
          5,
          7
        ],
        [
          10,
          11,
          16,
          20
        ],
        [
          23,
          30,
          34,
          60
        ]
      ],
      "target": 16
    }
  ],
  "search-a-2d-matrix-ii": [
    {
      "label": "Found (5)",
      "matrix": [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30]
      ],
      "target": 5
    },
    {
      "label": "Not Found (20)",
      "matrix": [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30]
      ],
      "target": 20
    },
    {
      "label": "Edge (1)",
      "matrix": [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30]
      ],
      "target": 1
    }
  ],
  "search-in-rotated-sorted-array": [
    {
      "label": "Find 0",
      "nums": [
        4,
        5,
        6,
        7,
        0,
        1,
        2
      ],
      "target": 0
    },
    {
      "label": "Not found",
      "nums": [
        4,
        5,
        6,
        7,
        0,
        1,
        2
      ],
      "target": 3
    },
    {
      "label": "Find 3",
      "nums": [
        1,
        3
      ],
      "target": 3
    },
    {
      "label": "No rotate",
      "nums": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "target": 4
    },
    {
      "label": "Single",
      "nums": [
        1
      ],
      "target": 1
    }
  ],
  "serialize-deserialize": [
    {
      "label": "Ex 1",
      "tree": [
        1,
        2,
        3,
        null,
        null,
        4,
        5
      ]
    },
    {
      "label": "Ex 2",
      "tree": [
        1,
        2,
        null,
        3,
        null,
        null,
        null,
        4
      ]
    },
    {
      "label": "Ex 3",
      "tree": [
        1,
        null,
        2,
        null,
        null,
        null,
        3
      ]
    }
  ],
  "set-matrix-zeroes": [
    {
      "label": "Ex1",
      "matrix": [
        [
          1,
          1,
          1
        ],
        [
          1,
          0,
          1
        ],
        [
          1,
          1,
          1
        ]
      ]
    },
    {
      "label": "Ex2",
      "matrix": [
        [
          0,
          1,
          2,
          0
        ],
        [
          3,
          4,
          5,
          2
        ],
        [
          1,
          3,
          1,
          5
        ]
      ]
    },
    {
      "label": "Ex3",
      "matrix": [
        [
          1,
          2,
          3
        ],
        [
          4,
          0,
          6
        ],
        [
          7,
          8,
          9
        ],
        [
          0,
          2,
          3
        ]
      ]
    }
  ],
  "single-number": [
    {
      "label": "Ex 1",
      "nums": [
        2,
        2,
        1
      ]
    },
    {
      "label": "Ex 2",
      "nums": [
        4,
        1,
        2,
        1,
        2
      ]
    },
    {
      "label": "Ex 3",
      "nums": [
        3,
        3,
        7,
        7,
        5
      ]
    }
  ],
  "skyline-problem": [
    {
      "label": "Ex 1",
      "buildings": [
        [
          2,
          9,
          10
        ],
        [
          3,
          7,
          15
        ],
        [
          5,
          12,
          12
        ],
        [
          15,
          20,
          10
        ],
        [
          19,
          24,
          8
        ]
      ]
    },
    {
      "label": "Ex 2",
      "buildings": [
        [
          0,
          2,
          3
        ],
        [
          2,
          5,
          3
        ]
      ]
    },
    {
      "label": "Ex 3",
      "buildings": [
        [
          1,
          2,
          1
        ],
        [
          1,
          2,
          2
        ],
        [
          1,
          2,
          3
        ]
      ]
    }
  ],
  "sliding-window-maximum": [
    {
      "label": "[1,3,-1,-3,5,3,6,7] k=3",
      "nums": [
        1,
        3,
        -1,
        -3,
        5,
        3,
        6,
        7
      ],
      "k": 3
    },
    {
      "label": "[1] k=1",
      "nums": [
        1
      ],
      "k": 1
    },
    {
      "label": "[2,1,5,3,6,4,8,9,2] k=3",
      "nums": [
        2,
        1,
        5,
        3,
        6,
        4,
        8,
        9,
        2
      ],
      "k": 3
    }
  ],
  "sort-colors": [
    {
      "label": "[2,0,2,1,1,0]",
      "nums": [
        2,
        0,
        2,
        1,
        1,
        0
      ]
    },
    {
      "label": "[2,0,1]",
      "nums": [
        2,
        0,
        1
      ]
    },
    {
      "label": "[1,2,0,1,2,0,1]",
      "nums": [
        1,
        2,
        0,
        1,
        2,
        0,
        1
      ]
    }
  ],
  "sort-list": [
    {
      "label": "[4,2,1,3]",
      "arr": [
        4,
        2,
        1,
        3
      ]
    },
    {
      "label": "[-1,5,3,4,0]",
      "arr": [
        -1,
        5,
        3,
        4,
        0
      ]
    },
    {
      "label": "[5,4,3,2,1]",
      "arr": [
        5,
        4,
        3,
        2,
        1
      ]
    }
  ],
  "spiral-matrix": [
    {
      "label": "3x3",
      "matrix": [
        [
          1,
          2,
          3
        ],
        [
          4,
          5,
          6
        ],
        [
          7,
          8,
          9
        ]
      ]
    },
    {
      "label": "3x4",
      "matrix": [
        [
          1,
          2,
          3,
          4
        ],
        [
          5,
          6,
          7,
          8
        ],
        [
          9,
          10,
          11,
          12
        ]
      ]
    },
    {
      "label": "4x3",
      "matrix": [
        [
          1,
          2,
          3
        ],
        [
          4,
          5,
          6
        ],
        [
          7,
          8,
          9
        ],
        [
          10,
          11,
          12
        ]
      ]
    },
    {
      "label": "1 Row",
      "matrix": [
        [
          1,
          2,
          3,
          4
        ]
      ]
    },
    {
      "label": "1 Col",
      "matrix": [
        [
          1
        ],
        [
          2
        ],
        [
          3
        ],
        [
          4
        ]
      ]
    }
  ],
  "string-to-integer-atoi": [
    {
      "label": "Simple",
      "value": "42",
      "note": "No whitespace, no sign, just digits."
    },
    {
      "label": "Leading space",
      "value": "   -042",
      "note": "Skips spaces, reads sign, ignores leading zeros in the value."
    },
    {
      "label": "Stops on letter",
      "value": "1337c0d3",
      "note": "Parsing stops at the first non-digit."
    },
    {
      "label": "Stops on symbol",
      "value": "0-1",
      "note": "Reads 0, then stops at the dash."
    },
    {
      "label": "Invalid start",
      "value": "words and 987",
      "note": "No digits can be read, so the result is 0."
    },
    {
      "label": "Overflow",
      "value": "91283472332",
      "note": "Shows positive clamping to INT_MAX."
    },
    {
      "label": "Negative clamp",
      "value": "   -91283472332",
      "note": "Shows negative clamping to INT_MIN."
    }
  ],
  "integer-to-roman": [
    {
      "label": "Simple",
      "num": 3,
      "note": "III - just repeated I symbols."
    },
    {
      "label": "With V",
      "num": 58,
      "note": "LVIII - 50 + 5 + 3."
    },
    {
      "label": "Complex",
      "num": 1994,
      "note": "MCMXCIV - 1000 + 900 + 90 + 4."
    },
    {
      "label": "Max value",
      "num": 3999,
      "note": "MMMCMXCIX - highest single case."
    }
  ],
  "subarray-sum-equals-k": [
    {
      "label": "[1,1,1] k=2",
      "nums": [
        1,
        1,
        1
      ],
      "k": 2
    },
    {
      "label": "[1,2,3] k=3",
      "nums": [
        1,
        2,
        3
      ],
      "k": 3
    },
    {
      "label": "[3,4,7,2,-3,1,4,2] k=7",
      "nums": [
        3,
        4,
        7,
        2,
        -3,
        1,
        4,
        2
      ],
      "k": 7
    }
  ],
  "subsets": [
    {
      "label": "[1,2,3]",
      "nums": [
        1,
        2,
        3
      ]
    },
    {
      "label": "[0]",
      "nums": [
        0
      ]
    },
    {
      "label": "[1,2]",
      "nums": [
        1,
        2
      ]
    },
    {
      "label": "[1,2,3,4]",
      "nums": [
        1,
        2,
        3,
        4
      ]
    }
  ],
  "sum-of-two-integers": [
    {
      "label": "1 + 1",
      "a": 1,
      "b": 1
    },
    {
      "label": "5 + 3",
      "a": 5,
      "b": 3
    },
    {
      "label": "2 + 2",
      "a": 2,
      "b": 2
    },
    {
      "label": "15 + 7",
      "a": 15,
      "b": 7
    }
  ],
  "substring-concatenation": [
    {
      "label": "Ex 1",
      "s": "barfoothefoobarman",
      "words": [
        "foo",
        "bar"
      ]
    },
    {
      "label": "Ex 2",
      "s": "wordgoodgoodgoodbestword",
      "words": [
        "word",
        "good",
        "best",
        "word"
      ]
    },
    {
      "label": "Ex 3",
      "s": "barfoofoobarthefoobarman",
      "words": [
        "bar",
        "foo",
        "the"
      ]
    }
  ],
  "subtree-of-another-tree": [
    {
      "label": "Example 1",
      "root": [
        3,
        4,
        5,
        1,
        2
      ],
      "sub": [
        4,
        1,
        2
      ]
    },
    {
      "label": "Example 2",
      "root": [
        3,
        4,
        5,
        1,
        2,
        null,
        null,
        null,
        null,
        0
      ],
      "sub": [
        4,
        1,
        2
      ]
    },
    {
      "label": "Same root",
      "root": [
        1,
        2,
        3
      ],
      "sub": [
        1,
        2,
        3
      ]
    }
  ],
  "sudoku-solver": [
    {
      "label": "Ex 1",
      "board": [
        [
          "5",
          "3",
          ".",
          ".",
          "7",
          ".",
          ".",
          ".",
          "."
        ],
        [
          "6",
          ".",
          ".",
          "1",
          "9",
          "5",
          ".",
          ".",
          "."
        ],
        [
          ".",
          "9",
          "8",
          ".",
          ".",
          ".",
          ".",
          "6",
          "."
        ],
        [
          "8",
          ".",
          ".",
          ".",
          "6",
          ".",
          ".",
          ".",
          "3"
        ],
        [
          "4",
          ".",
          ".",
          "8",
          ".",
          "3",
          ".",
          ".",
          "1"
        ],
        [
          "7",
          ".",
          ".",
          ".",
          "2",
          ".",
          ".",
          ".",
          "6"
        ],
        [
          ".",
          "6",
          ".",
          ".",
          ".",
          ".",
          "2",
          "8",
          "."
        ],
        [
          ".",
          ".",
          ".",
          "4",
          "1",
          "9",
          ".",
          ".",
          "5"
        ],
        [
          ".",
          ".",
          ".",
          ".",
          "8",
          ".",
          ".",
          "7",
          "9"
        ]
      ]
    }
  ],
  "symmetric-tree": [
    {
      "label": "Symmetric",
      "tree": [
        1,
        2,
        2,
        3,
        4,
        4,
        3
      ]
    },
    {
      "label": "Symmetric null",
      "tree": [
        1,
        2,
        2,
        null,
        3,
        null,
        3
      ]
    },
    {
      "label": "Not symmetric",
      "tree": [
        1,
        2,
        2,
        null,
        3,
        3,
        null
      ]
    },
    {
      "label": "Single node",
      "tree": [
        1
      ]
    }
  ],
  "text-justification": [
    {
      "label": "Ex 1",
      "words": [
        "This",
        "is",
        "an",
        "example",
        "of",
        "text",
        "justification"
      ],
      "maxWidth": 16
    },
    {
      "label": "Ex 2",
      "words": [
        "What",
        "must",
        "be",
        "acknowledgment",
        "shall",
        "be"
      ],
      "maxWidth": 16
    },
    {
      "label": "Ex 3",
      "words": [
        "the",
        "quick",
        "brown",
        "fox",
        "jumps",
        "over",
        "the",
        "lazy",
        "dog"
      ],
      "maxWidth": 12
    }
  ],
  "three-sum-closest": [
    {
      "label": "Classic",
      "nums": [
        -1,
        2,
        1,
        -4
      ],
      "target": 1
    },
    {
      "label": "Exact Match",
      "nums": [
        0,
        0,
        0
      ],
      "target": 1
    },
    {
      "label": "Negative Target",
      "nums": [
        -4,
        -1,
        -1,
        0,
        1,
        2
      ],
      "target": -5
    },
    {
      "label": "Large Gap",
      "nums": [
        -1000,
        0,
        1,
        2,
        -1,
        -4
      ],
      "target": 0
    }
  ],
  "three-sum": [
    {
      "label": "Classic",
      "nums": [
        -1,
        0,
        1,
        2,
        -1,
        -4
      ]
    },
    {
      "label": "All Zeros",
      "nums": [
        0,
        0,
        0,
        0
      ]
    },
    {
      "label": "No Match",
      "nums": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "label": "Duplicates",
      "nums": [
        -2,
        0,
        0,
        2,
        2
      ]
    }
  ],
  "four-sum": [
    {
      "label": "Classic",
      "nums": [1000000000, 1000000000, 1000000000, 1000000000],
      "target": -294967296
    },
    {
      "label": "Example 2",
      "nums": [1, 0, -1, 0, -2, 2],
      "target": 0
    },
    {
      "label": "All Zeros",
      "nums": [0, 0, 0, 0],
      "target": 0
    },
    {
      "label": "Duplicates",
      "nums": [-3, -2, -1, 0, 1, 2, 3],
      "target": 0
    }
  ],
  "top-kfrequent": [
    {
      "label": "[1,1,1,2,2,3] k=2",
      "nums": [
        1,
        1,
        1,
        2,
        2,
        3
      ],
      "k": 2
    },
    {
      "label": "[1] k=1",
      "nums": [
        1
      ],
      "k": 1
    },
    {
      "label": "[4,1,1,2,2,3,3,3] k=2",
      "nums": [
        4,
        1,
        1,
        2,
        2,
        3,
        3,
        3
      ],
      "k": 2
    }
  ],
  "trapping-rain-water": [
    {
      "label": "Classic",
      "height": [
        0,
        1,
        0,
        2,
        1,
        0,
        1,
        3,
        2,
        1,
        2,
        1
      ]
    },
    {
      "label": "Mountain",
      "height": [
        4,
        2,
        0,
        3,
        2,
        5
      ]
    },
    {
      "label": "Pyramid",
      "height": [
        1,
        2,
        3,
        4,
        3,
        2,
        1
      ]
    },
    {
      "label": "Bowl",
      "height": [
        5,
        1,
        1,
        1,
        5
      ]
    },
    {
      "label": "Steps",
      "height": [
        5,
        4,
        3,
        2,
        1,
        2,
        3
      ]
    }
  ],
  "two-sum": [
    {
      "label": "Example 1",
      "nums": [
        2,
        7,
        11,
        15
      ],
      "target": 9
    },
    {
      "label": "Example 2",
      "nums": [
        3,
        2,
        4
      ],
      "target": 6
    },
    {
      "label": "Same Values",
      "nums": [
        3,
        3
      ],
      "target": 6
    },
    {
      "label": "Negatives",
      "nums": [
        -3,
        4,
        3,
        90
      ],
      "target": 0
    }
  ],
  "two-sum-ii": [
    {
      "label": "Basic",
      "numbers": [
        2,
        7,
        11,
        15
      ],
      "target": 9
    },
    {
      "label": "Middle",
      "numbers": [
        2,
        3,
        4
      ],
      "target": 6
    },
    {
      "label": "Large",
      "numbers": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "target": 11
    },
    {
      "label": "Negatives",
      "numbers": [
        -3,
        -1,
        0,
        2,
        4,
        6
      ],
      "target": 1
    }
  ],
  "unique-paths": [
    {
      "label": "3×7",
      "m": 3,
      "n": 7
    },
    {
      "label": "3×2",
      "m": 3,
      "n": 2
    },
    {
      "label": "2×2",
      "m": 2,
      "n": 2
    },
    {
      "label": "4×4",
      "m": 4,
      "n": 4
    },
    {
      "label": "5×5",
      "m": 5,
      "n": 5
    }
  ],
  "valid-anagram": [
    {
      "label": "Anagram",
      "s": "anagram",
      "t": "nagaram"
    },
    {
      "label": "Not anagram",
      "s": "rat",
      "t": "car"
    },
    {
      "label": "Same",
      "s": "listen",
      "t": "silent"
    },
    {
      "label": "Diff length",
      "s": "hello",
      "t": "world!"
    }
  ],
  "valid-palindrome": [
    {
      "label": "A man a plan",
      "s": "A man, a plan, a canal: Panama"
    },
    {
      "label": "race a car",
      "s": "race a car"
    },
    {
      "label": "\" \"",
      "s": " "
    },
    {
      "label": "Was it a car",
      "s": "Was it a car or a cat I saw?"
    }
  ],
  "valid-parentheses": [
    {
      "label": "Valid",
      "s": "()[]{}"
    },
    {
      "label": "Nested",
      "s": "({[]})"
    },
    {
      "label": "Mismatch",
      "s": "(]"
    },
    {
      "label": "Unmatched Open",
      "s": "((()"
    },
    {
      "label": "Unmatched Close",
      "s": "())"
    }
  ],
  "validate-bst": [
    {
      "label": "Valid",
      "arr": [
        5,
        3,
        7,
        1,
        4,
        6,
        8
      ]
    },
    {
      "label": "Invalid",
      "arr": [
        5,
        1,
        4,
        null,
        null,
        3,
        6
      ]
    },
    {
      "label": "LeetCode",
      "arr": [
        2,
        1,
        3
      ]
    },
    {
      "label": "Tricky",
      "arr": [
        10,
        5,
        15,
        null,
        null,
        6,
        20
      ]
    }
  ],
  "wildcard-matching": [
    {
      "label": "aa / a*",
      "s": "aa",
      "p": "a*"
    },
    {
      "label": "cb / ?a",
      "s": "cb",
      "p": "?a"
    },
    {
      "label": "abc / a*c",
      "s": "abc",
      "p": "a*c"
    },
    {
      "label": "aab / c*a*b",
      "s": "aab",
      "p": "c*a*b"
    }
  ],
  "word-break": [
    {
      "label": "Classic",
      "s": "leetcode",
      "dict": [
        "leet",
        "code"
      ]
    },
    {
      "label": "Applepenapple",
      "s": "applepenapple",
      "dict": [
        "apple",
        "pen"
      ]
    },
    {
      "label": "Cannot",
      "s": "catsandog",
      "dict": [
        "cats",
        "dog",
        "sand",
        "and",
        "cat"
      ]
    },
    {
      "label": "Short",
      "s": "cars",
      "dict": [
        "car",
        "ca",
        "rs"
      ]
    }
  ],
  "word-ladder": [
    {
      "label": "hit→cog",
      "beginWord": "hit",
      "endWord": "cog",
      "wordList": [
        "hot",
        "dot",
        "dog",
        "lot",
        "log",
        "cog"
      ]
    },
    {
      "label": "hit→dog",
      "beginWord": "hit",
      "endWord": "dog",
      "wordList": [
        "hot",
        "dot",
        "dog",
        "lot"
      ]
    }
  ],
  "word-search": [
    {
      "label": "Exists",
      "board": [
        [
          "A",
          "B",
          "C",
          "E"
        ],
        [
          "S",
          "F",
          "C",
          "S"
        ],
        [
          "A",
          "D",
          "E",
          "E"
        ]
      ],
      "word": "ABCCED"
    },
    {
      "label": "Exists 2",
      "board": [
        [
          "A",
          "B",
          "C",
          "E"
        ],
        [
          "S",
          "F",
          "C",
          "S"
        ],
        [
          "A",
          "D",
          "E",
          "E"
        ]
      ],
      "word": "SEE"
    },
    {
      "label": "Not Exists",
      "board": [
        [
          "A",
          "B",
          "C",
          "E"
        ],
        [
          "S",
          "F",
          "C",
          "S"
        ],
        [
          "A",
          "D",
          "E",
          "E"
        ]
      ],
      "word": "ABCB"
    }
  ],
  "word-search-ii": [
    {
      "label": "Ex 1",
      "board": [
        [
          "o",
          "a",
          "a",
          "n"
        ],
        [
          "e",
          "t",
          "a",
          "e"
        ],
        [
          "i",
          "h",
          "k",
          "r"
        ],
        [
          "i",
          "f",
          "l",
          "v"
        ]
      ],
      "words": [
        "oath",
        "pea",
        "eat",
        "rain"
      ]
    },
    {
      "label": "Ex 2",
      "board": [
        [
          "a",
          "b"
        ],
        [
          "c",
          "d"
        ]
      ],
      "words": [
        "abdc",
        "abcd",
        "ab"
      ]
    }
  ],
  "binary-tree-paths": [
    {
      "label": "LeetCode",
      "arr": [
        1,
        2,
        3
      ]
    },
    {
      "label": "With Nulls",
      "arr": [
        1,
        2,
        3,
        null,
        5
      ]
    },
    {
      "label": "Single",
      "arr": [
        1
      ]
    },
    {
      "label": "Left Heavy",
      "arr": [
        1,
        2,
        null,
        3,
        4
      ]
    }
  ],
  "perfect-squares": [
    {
      "label": "n = 7",
      "n": 7
    },
    {
      "label": "n = 12",
      "n": 12
    },
    {
      "label": "n = 13",
      "n": 13
    },
    {
      "label": "n = 15",
      "n": 15
    }
  ],
  "swap-nodes-in-pairs": [
    {
      "label": "Basic",
      "values": [1, 2, 3, 4]
    },
    {
      "label": "Single",
      "values": [1]
    },
    {
      "label": "Pairs",
      "values": [1, 2, 3, 4, 5, 6]
    },
    {
      "label": "Odd Count",
      "values": [1, 2, 3, 4, 5]
    }
  ],
  "super-power": [
    {
      "label": "2^3",
      "base": 2,
      "exponents": [3]
    },
    {
      "label": "2^10",
      "base": 2,
      "exponents": [1, 0]
    },
    {
      "label": "1^2147483647",
      "base": 1,
      "exponents": [2, 1, 4, 7, 4, 8, 3, 6, 4, 7]
    }
  ],
  "wiggle-sort-ii": [
    {
      "label": "Basic",
      "nums": [5, 7, 4, 3, 1]
    },
    {
      "label": "Duplicates",
      "nums": [1, 1, 2, 2, 3, 3]
    },
    {
      "label": "All Same",
      "nums": [5, 5, 5, 5, 5]
    },
    {
      "label": "Two Elements",
      "nums": [3, 1]
    },
    {
      "label": "Random",
      "nums": [9, 2, 7, 4, 5, 1, 8, 6]
    }
  ],

  "reconstruct-original-digits": [
    {
      "label": "Simple",
      "tokens": "zerozerozerozerotwotwotwotwo"
    },
    {
      "label": "Mixed",
      "tokens": "owoztneoer"
    },
    {
      "label": "All Digits",
      "tokens": "zeroonetwothreefourfivesixseveneightnine"
    }
  ],
  "contiguous-array": [
    {
      "label": "Equal 0 and 1",
      "nums": [0, 1]
    },
    {
      "label": "Two Pairs",
      "nums": [0, 1, 0]
    },
    {
      "label": "Longer",
      "nums": [0, 0, 1, 0, 0, 0, 1, 1]
    }
  ],
  "beautiful-arrangement": [
    {
      "label": "n=2",
      "n": 2
    },
    {
      "label": "n=3",
      "n": 3
    },
    {
      "label": "n=4",
      "n": 4
    }
  ],
  "word-abbreviation": [
    {
      "label": "Simple",
      "dict": ["like", "god", "internal"]
    },
    {
      "label": "Mixed",
      "dict": ["cat", "cats", "dog"]
    },
    {
      "label": "Single",
      "dict": ["internationalization"]
    }
  ],
  "random-pick-with-weight": [
    {
      "label": "Simple",
      "w": [1]
    },
    {
      "label": "Two Options",
      "w": [1, 3]
    },
    {
      "label": "Multiple",
      "w": [1, 3, 4]
    }
  ],
  "minesweeper": [
    {
      "label": "Simple",
      "board": [["E", "E", "E", "E", "E"], ["E", "E", "M", "E", "E"], ["E", "E", "E", "E", "E"], ["E", "E", "E", "E", "E"]],
      "click": [0, 0]
    },
    {
      "label": "Mine Hit",
      "board": [["B", "1", "E", "1", "B"], ["B", "1", "E", "1", "B"], ["B", "B", "E", "B", "B"], ["M", "1", "1", "1", "B"], ["B", "1", "1", "1", "B"]],
      "click": [4, 2]
    }
  ],
  "minimum-absolute-difference-in-bst": [
    {
      "label": "Simple",
      "root": [4, 2, 6, 1, 3]
    },
    {
      "label": "Larger",
      "root": [1, 0, 48, null, null, 12, 49]
    }
  ],
  "lonely-pixel-i": [
    {
      "label": "Simple",
      "picture": [["W", "W", "B"], ["W", "B", "W"], ["B", "W", "W"]]
    },
    {
      "label": "All Black",
      "picture": [["B", "B", "B"], ["B", "B", "B"], ["B", "B", "B"]]
    }
  ],
  "k-diff-pairs-in-array": [
    {
      "label": "k=1",
      "nums": [3, 1, 4, 1, 5],
      "k": 1
    },
    {
      "label": "k=2",
      "nums": [1, 2, 3, 1, 1, 3],
      "k": 2
    },
    {
      "label": "k=0",
      "nums": [1, 1, 1, 2, 2],
      "k": 0
    }
  ],
  "lonely-pixel-ii": [
    {
      "label": "n=2",
      "picture": [["W", "B", "W"], ["W", "B", "W"], ["W", "B", "W"]],
      "N": 2
    },
    {
      "label": "n=1",
      "picture": [["B", "W", "W"], ["B", "B", "W"], ["W", "B", "W"]],
      "N": 1
    }
  ],
  "design-log-storage-system": [
    {
      "label": "Sample 1",
      "operations": ["LogSystem", "put", "put", "retrieve"],
      "values": [[], [1, "2017:01:01:23:59:59"], [2, "2017:01:02:23:59:59"], [1, "2017:01:01:23:59:59", "2017:01:02:23:59:59", "Second"]]
    }
  ],
  "encode-and-decode-tinyurl": [
    {
      "label": "Simple",
      "url": "https://leetcode.com/problems/design-tinyurl"
    },
    {
      "label": "Long URL",
      "url": "https://www.google.com/search?q=leetcode"
    }
  ],
  "construct-binary-tree-from-string": [
    {
      "label": "Simple",
      "s": "4(2(3)(1))(6(5))"
    },
    {
      "label": "Negative",
      "s": "-4(2)(6)"
    },
    {
      "label": "Single",
      "s": "4"
    }
  ],
  "complex-number-multiplication": [
    {
      "label": "Simple",
      "num1": "1+1i",
      "num2": "1+1i"
    },
    {
      "label": "Negative",
      "num1": "1+-1i",
      "num2": "-1+-1i"
    }
  ],
  "convert-bst-to-greater-tree": [
    {
      "label": "Simple",
      "root": [5, 2, 13]
    },
    {
      "label": "Larger",
      "root": [3, 2, 4, 1]
    }
  ],
  "minimum-time-difference": [
    {
      "label": "Two Times",
      "timePoints": ["23:59", "00:00"]
    },
    {
      "label": "Three Times",
      "timePoints": ["00:00", "04:58", "23:59"]
    }
  ],
  "single-element-in-sorted-array": [
    {
      "label": "Simple",
      "nums": [1, 1, 2, 3, 3, 4, 4, 8, 8]
    },
    {
      "label": "Larger",
      "nums": [3, 3, 7, 7, 10, 11, 11]
    }
  ],
  "reverse-string-ii": [
    {
      "label": "k=2",
      "s": "abcdefg",
      "k": 2
    },
    {
      "label": "k=3",
      "s": "abcdefg",
      "k": 3
    },
    {
      "label": "k=4",
      "s": "abcdefg",
      "k": 4
    }
  ],
  "01-matrix": [
    {
      "label": "Simple",
      "mat": [[0, 0, 0], [0, 1, 0], [1, 1, 1]]
    },
    {
      "label": "Multiple Zeros",
      "mat": [[0, 0], [0, 1]]
    }
  ],
  "diameter-of-binary-tree": [
    {
      "label": "Simple",
      "root": [1, 2, 3, 4, 5]
    },
    {
      "label": "Single Node",
      "root": [1, 2]
    }
  ],
  "output-contest-matches": [
    {
      "label": "n=2",
      "n": 2
    },
    {
      "label": "n=4",
      "n": 4
    },
    {
      "label": "n=8",
      "n": 8
    }
  ],
  "add-two-numbers-ii": [{ "label": "Example 1", "l1": [7, 2, 4, 3], "l2": [5, 6, 4] }, { "label": "Example 2", "l1": [9, 9, 9], "l2": [9, 9, 9, 9] }],
  "all-o1-data-structure": [{ "label": "Example 1", "operations": [["inc", "a"], ["inc", "b"], ["getMaxKey"], ["getMinKey"], ["inc", "a"], ["getMaxKey"], ["getMinKey"]] }, { "label": "Example 2", "operations": [["inc", "hello"], ["inc", "hello"], ["inc", "world"], ["inc", "world"], ["inc", "world"], ["getMaxKey"], ["getMinKey"]] }],
  "arithmetic-slices-ii": [{ "label": "Example 1", "nums": [2, 4, 6, 8, 10] }, { "label": "Example 2", "nums": [1, 1, 1, 1] }],
  "arranging-coins": [{ "label": "Example 1", "n": 5 }, { "label": "Example 2", "n": 8 }],
  "binary-tree-level-order-ii": [{ "label": "Example 1", "root": [3, 9, 20, null, null, 15, 7] }, { "label": "Example 2", "root": [1] }],
  "binary-watch": [{ "label": "Example 1", "n": 0 }, { "label": "Example 2", "n": 1 }],
  "bst-to-doubly-linked-list": [{ "label": "Example 1", "root": [4, 2, 6, 1, 3, 5, 7] }, { "label": "Example 2", "root": [2, 1, 3] }],
  "can-i-win": [{ "label": "Example 1", "maxChoosableInteger": 10, "desiredTotal": 40 }, { "label": "Example 2", "maxChoosableInteger": 4, "desiredTotal": 6 }],
  "circular-array-loop": [{ "label": "Example 1", "nums": [2, -1, 1, 2, 2] }, { "label": "Example 2", "nums": [-1, 2] }],
  "coin-change-2": [{ "label": "Example 1", "amount": 5, "coins": [1, 2, 5] }, { "label": "Example 2", "amount": 3, "coins": [10] }],
  "combination-sum-ii": [{ "label": "Example 1", "candidates": [10, 1, 2, 7, 6, 1, 5], "target": 8 }, { "label": "Example 2", "candidates": [2, 5, 2, 1, 2], "target": 5 }],
  "combinations": [{ "label": "Example 1", "n": 4, "k": 2 }, { "label": "Example 2", "n": 1, "k": 1 }],
  "concatenated-words": [{ "label": "Example 1", "words": ["cat", "cats", "catsdogcats", "dog", "catscat", "ratcatdogcat"] }, { "label": "Example 2", "words": ["a", "b", "ab", "abc"] }],
  "construct-the-rectangle": [{ "label": "Example 1", "area": 8 }, { "label": "Example 2", "area": 122122 }],
  "continuous-subarray-sum": [{ "label": "Example 1", "nums": [23, 2, 4, 6, 13], "k": 6 }, { "label": "Example 2", "nums": [23, 2, 6, 4, 7], "k": 13 }],
  "convex-polygon": [{ "label": "Example 1", "points": [[0, 0], [0, 1], [1, 1], [1, 0]] }, { "label": "Example 2", "points": [[0, 0], [0, 10], [10, 10], [10, 0], [5, 5]] }],
  "count-the-repetitions": [{ "label": "Example 1", "s1": "acb", "n1": 4, "s2": "ab", "n2": 2 }, { "label": "Example 2", "s1": "abc", "n1": 1, "s2": "ac", "n2": 1 }],
  "delete-node-in-a-bst": [{ "label": "Example 1", "root": [5, 3, 6, 2, 4, null, 7], "key": 3 }, { "label": "Example 2", "root": [5, 3, 6], "key": 5 }],
  "detect-capital": [{ "label": "Example 1", "word": "USA" }, { "label": "Example 2", "word": "FlaG" }],
  "distinct-subsequences": [{ "label": "Example 1", "s": "rabbbit", "t": "rabbit" }, { "label": "Example 2", "s": "babgbag", "t": "bag" }],
  "distribute-candies-to-people": [{ "label": "Example 1", "candies": 7, "num_people": 4 }, { "label": "Example 2", "candies": 10, "num_people": 3 }],
  "encode-nary-to-binary-tree": [{ "label": "Example 1", "root": [1, null, [3, [5, 6], 2, 4], null, [2]] }, { "label": "Example 2", "root": [1, null, [2, 3, 4, 5], null, [6, null, [7, 8], null, 9]] }],
  "encode-string-with-shortest-length": [{ "label": "Example 1", "s": "aabcb" }, { "label": "Example 2", "s": "aaabccccaabcadabac" }],
  "expression-tree-from-tokens": [{ "label": "Example 1", "tokens": ["2", "1", "+", "3", "*"] }, { "label": "Example 2", "tokens": ["4", "13", "5", "/", "+"] }],
  "find-all-anagrams": [{ "label": "Example 1", "s": "cbaebabacd", "p": "abc" }, { "label": "Example 2", "s": "abab", "p": "ab" }],
  "find-all-numbers-disappeared-in-array": [{ "label": "Example 1", "nums": [4, 3, 2, 7, 8, 2, 3, 1] }, { "label": "Example 2", "nums": [1, 1] }],
  "find-bottom-left-tree-value": [{ "label": "Example 1", "root": [2, 1, 3] }, { "label": "Example 2", "root": [1, 2, 3, 4, null, 5, 6, null, null, 7] }],
  "find-largest-value-each-row": [{ "label": "Example 1", "root": [1, 3, 2, 5, 3, null, 9] }, { "label": "Example 2", "root": [1, 2, 3] }],
  "find-leaves-of-binary-tree": [{ "label": "Example 1", "root": [1, 2, 3, 4, 5] }, { "label": "Example 2", "root": [1] }],
  "find-peak-element": [{ "label": "Example 1", "nums": [1, 2, 3, 1] }, { "label": "Example 2", "nums": [1, 2, 1, 3, 5, 6, 4] }],
  "find-permutation": [{ "label": "Example 1", "n": 3, "s": "DI" }, { "label": "Example 2", "n": 2, "s": "D" }],
  "find-right-interval": [{ "label": "Example 1", "intervals": [[1, 2]] }, { "label": "Example 2", "intervals": [[3, 4], [2, 3], [1, 2]] }],
  "first-bad-version": [{ "label": "Example 1", "n": 5, "bad": 4 }, { "label": "Example 2", "n": 1, "bad": 1 }],
  "first-missing-positive": [{ "label": "Example 1", "nums": [1, 2, 0] }, { "label": "Example 2", "nums": [3, 4, -1, 1] }],
  "flatten-multilevel-dll": [{ "label": "Example 1", "head": [1, null, 2, 3, null, [[4, null, 5, 6]]] }, { "label": "Example 2", "head": [1, null, 2, null, 3] }],
  "four-sum": [{ "label": "Example 1", "nums": [1000000000, 1000000000, 1000000000, 1000000000], "target": -294967296 }, { "label": "Example 2", "nums": [0, 0, 0, 0], "target": 0 }],
  "generate-random-point-in-a-circle": [{ "label": "Example 1", "radius": 1.0, "x_center": 0.0, "y_center": 0.0 }, { "label": "Example 2", "radius": 5.5, "x_center": -2.0, "y_center": 3.0 }],
  "guess-number": [{ "label": "Example 1", "n": 10 }, { "label": "Example 2", "n": 1 }],
  "guess-number-higher-or-lower": [{ "label": "Example 1", "n": 10 }, { "label": "Example 2", "n": 1000 }],
  "heaters": [{ "label": "Example 1", "houses": [1, 2, 3], "heaters": [2] }, { "label": "Example 2", "houses": [1, 2, 3, 4], "heaters": [1, 4] }],
  "house-robber-ii": [{ "label": "Example 1", "nums": [1, 2, 3, 1] }, { "label": "Example 2", "nums": [2, 3, 2] }],
  "implement-rand10": [{ "label": "Example 1" }, { "label": "Example 2" }],
  "increasing-subsequences": [{ "label": "Example 1", "nums": [4, 6, 7, 7] }, { "label": "Example 2", "nums": [1, 2, 3, 4, 5] }],
  "interleaving-string": [{ "label": "Example 1", "s1": "aabcc", "s2": "dbbca", "s3": "aadbbcbcac" }, { "label": "Example 2", "s1": "aa", "s2": "ab", "s3": "aaba" }],
  "intersection-of-two-arrays-ii": [{ "label": "Example 1", "nums1": [1, 2, 2, 1], "nums2": [2, 2] }, { "label": "Example 2", "nums1": [4, 9, 5], "nums2": [9, 4, 9, 8, 4] }],
  "ipo": [{ "label": "Example 1", "k": 1, "w": 0, "profits": [1, 2, 3], "capital": [0, 1, 1] }, { "label": "Example 2", "k": 10, "w": 0, "profits": [1, 2, 3], "capital": [0, 1, 2] }],
  "kth-largest-element": [{ "label": "Example 1", "nums": [3, 2, 1, 5, 6, 4], "k": 2 }, { "label": "Example 2", "nums": [3, 2, 3, 1, 2, 4, 5, 5, 6], "k": 4 }],
  "kth-smallest": [{ "label": "Example 1", "matrix": [[1, 2], [1, 1]], "k": 1 }, { "label": "Example 2", "matrix": [[1, 2, 3], [4, 5, 6], [7, 8, 9]], "k": 5 }],
  "kth-smallest-lexicographical-order": [{ "label": "Example 1", "n": 13, "k": 2 }, { "label": "Example 2", "n": 1, "k": 1 }],
  "largest-palindrome-product": [{ "label": "Example 1", "n": 1 }, { "label": "Example 2", "n": 2 }],
  "license-key-formatting": [{ "label": "Example 1", "s": "5F3Z-2e-9-w", "k": 4 }, { "label": "Example 2", "s": "2-4A0r-4k", "k": 4 }],
  "longest-substring-k-repeating": [{ "label": "Example 1", "s": "aaab", "k": 3 }, { "label": "Example 2", "s": "ababbc", "k": 2 }],
  "longest-uncommon-subsequence-i": [{ "label": "Example 1", "a": "aba", "b": "cdc" }, { "label": "Example 2", "a": "abc", "b": "abc" }],
  "longest-uncommon-subsequence-ii": [{ "label": "Example 1", "nums": ["aba", "cdc", "eae"] }, { "label": "Example 2", "nums": ["abc", "bcd", "ecdfe", "bbbb", "cde"] }],
  "longest-valid-parentheses": [{ "label": "Example 1", "s": "()" }, { "label": "Example 2", "s": ")()())" }],
  "magical-string": [{ "label": "Example 1", "n": 6 }, { "label": "Example 2", "n": 1 }],
  "matchsticks-to-square": [{ "label": "Example 1", "matchsticks": [1, 1, 2, 2, 2] }, { "label": "Example 2", "matchsticks": [3, 3, 3, 3, 4] }],
  "max-consecutive-ones": [{ "label": "Example 1", "nums": [1, 1, 0, 1, 1, 1] }, { "label": "Example 2", "nums": [1, 0, 1, 1, 0, 1] }],
  "max-consecutive-ones-iii": [{ "label": "Example 1", "nums": [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], "k": 2 }, { "label": "Example 2", "nums": [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], "k": 3 }],
  "max-points-on-aline": [{ "label": "Example 1", "points": [[1, 1], [1, 1], [2, 2], [2, 2]] }, { "label": "Example 2", "points": [[0, 0], [1, 1], [0, 0]] }],
  "max-product-subarray": [{ "label": "Example 1", "nums": [2, 3, -2, 4] }, { "label": "Example 2", "nums": [-2] }],
  "maximum-gap": [{ "label": "Example 1", "nums": [3, 6, 9, 1] }, { "label": "Example 2", "nums": [10] }],
  "minimum-genetic-mutation": [{ "label": "Example 1", "startGene": "AACCCCCCCCCCCCCCCCCC", "endGene": "AACCCCCCCCCCCCCCCCCC", "bank": ["AACCCCCCCCCCCCCCCCCC"] }, { "label": "Example 2", "startGene": "AACCCCCCCCCCCCCCCCCC", "endGene": "AAACCCCCCCCCCCCCCCCC", "bank": ["AAACCCCCCCCCCCCCCCCC", "AACCCCCCCCCCCCCCCCCC"] }],
  "minimum-moves-to-equal-array-elements": [{ "label": "Example 1", "nums": [1, 0, 0, 8, 6] }, { "label": "Example 2", "nums": [1, 2, 3, 4, 5] }],
  "minimum-moves-to-equal-array-elements-ii": [{ "label": "Example 1", "nums": [1, 0, 0, 8, 6] }, { "label": "Example 2", "nums": [1, 10, 2, 9] }],
  "minimum-number-of-arrows-to-burst-balloons": [{ "label": "Example 1", "points": [[10, 16], [2, 8], [1, 6], [7, 12]] }, { "label": "Example 2", "points": [[1, 2], [3, 4], [5, 6], [7, 8]] }],
  "minimum-time-difference": [{ "label": "Example 1", "timePoints": ["23:59", "00:00"] }, { "label": "Example 2", "timePoints": ["00:00", "04:00", "02:00", "20:00"] }],
  "missing-number": [{ "label": "Example 1", "nums": [3, 0, 1] }, { "label": "Example 2", "nums": [0, 1] }],
  "4sum-ii": [{"label":"Example 1","nums":[[1,2],[-2,-1],[-2,2],[0,0]],"target":0},{"label":"Example 2","nums":[[1000000000,1000000000,-1000000000,-1000000000],[1000000000,1000000000,-1000000000,-1000000000],[-1000000000,-1000000000,1000000000,1000000000],[-1000000000,-1000000000,1000000000,1000000000]],"target":0}],
  "assign-cookies": [{"label":"Example 1","greed":[1,2,3],"cookies":[1,1]},{"label":"Example 2","greed":[1,2],"cookies":[1,2,3]}],
  "design-snake-game": [{"label":"Example 1","width":3,"height":2,"food":[[1,2],[0,1]],"commands":["R","D","R","U","L","U"]},{"label":"Example 2","width":10,"height":10,"food":[[5,5],[3,3],[7,7]],"commands":["R","R","D","D","L","L","U","U"]}],
  "diagonal-traverse": [{"label":"Example 1","matrix":[[1,2,3],[4,5,6],[7,8,9]]},{"label":"Example 2","matrix":[[1,2],[3,4]]}],
  "evaluate-division": [{"label":"Example 1","equations":[["a","b"],["b","c"]],"values":[2.0,3.0],"queries":[["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]},{"label":"Example 2","equations":[["a","b"],["b","c"],["bc","cd"]],"values":[1.5,2.5,5.0],"queries":[["a","c"],["c","b"],["bc","cd"],["cd","bc"]]}],
  "fibonacci-number": [{"label":"Example 1","n":2},{"label":"Example 2","n":3}],
  "find-all-anagrams-in-string": [{"label":"Example 1","s":"cbaebabacd","p":"abc"},{"label":"Example 2","s":"abab","p":"ab"}],
  "find-all-duplicates-in-array": [{"label":"Example 1","nums":[4,3,2,7,8,2,3,1]},{"label":"Example 2","nums":[1,1,2]}],
  "find-first-last-position": [{"label":"Example 1","nums":[5,7,7,8,8,10],"target":8},{"label":"Example 2","nums":[5,7,7,8,8,10],"target":6}],
  "find-first-occurrence": [{"label":"Example 1","haystack":"sadbutsad","needle":"sad"},{"label":"Example 2","haystack":"leetcode","needle":"leeto"}],
  "freedom-trail": [{"label":"Example 1","ring":"godding","key":"gd"},{"label":"Example 2","ring":"iotfo","key":"fioot"}],
  "game-play-analysis-i": [{"label":"Example 1","activity":[{"player_id":1,"device_id":2,"event_date":"2016-03-01","games_played":5},{"player_id":1,"device_id":2,"event_date":"2016-05-02","games_played":6}]},{"label":"Example 2","activity":[{"player_id":1,"device_id":3,"event_date":"2016-03-02","games_played":8}]}],
  "game-play-analysis-ii": [{"label":"Example 1","activity":[{"player_id":1,"device_id":2,"event_date":"2016-03-01","games_played":5},{"player_id":1,"device_id":2,"event_date":"2016-03-02","games_played":6},{"player_id":2,"device_id":3,"event_date":"2017-06-25","games_played":1}]},{"label":"Example 2","activity":[{"player_id":1,"device_id":2,"event_date":"2016-03-01","games_played":5}]}],
  "hamming-distance": [{"label":"Example 1","x":1,"y":4},{"label":"Example 2","x":3,"y":1}],
  "inorder-successor-bst": [{"label":"Example 1","tree":[2,1,3],"p":1},{"label":"Example 2","tree":[5,3,6,2,4,null,null,1],"p":6}],
  "is-subsequence": [{"label":"Example 1","s":"abc","t":"ahbgdc"},{"label":"Example 2","s":"axc","t":"ahbgdc"}],
  "island-perimeter": [{"label":"Example 1","grid":[[1]]},{"label":"Example 2","grid":[[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,1,1,1]]}],
  "logger-rate-limiter": [{"label":"Example 1","logs":[{"timestamp":1,"message":"foo"},{"timestamp":1,"message":"bar"},{"timestamp":3,"message":"foo"},{"timestamp":10,"message":"bar"}]},{"label":"Example 2","logs":[{"timestamp":1,"message":"a"},{"timestamp":2,"message":"b"},{"timestamp":11,"message":"a"},{"timestamp":12,"message":"b"}]}],
  "longest-palindromic-subsequence": [{"label":"Example 1","s":"bbbab"},{"label":"Example 2","s":"abcdefedcba"}],
  "longest-word-dictionary": [{"label":"Example 1","words":["a","b","ba","bca","bda","bdca"]},{"label":"Example 2","words":["cat","cats","catsc","catscs","catscsc","catnip","catni","cat","cats"]}],
  "max-area-of-island": [{"label":"Example 1","grid":[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]},{"label":"Example 2","grid":[[1,1,1],[1,1,1],[1,1,1]]}],
  "minimum-path-sum": [{"label":"Example 1","grid":[[1,3,1],[1,5,1],[4,2,1]]},{"label":"Example 2","grid":[[1,2,3],[4,5,6],[7,8,9]]}],
  "most-frequent-subtree-sum": [{"label":"Example 1","tree":[5,2,-3]},{"label":"Example 2","tree":[5,2,-5]}],
  "nary-tree-level-order": [{"label":"Example 1","root":[1,null,3,2,4,null,5,6]},{"label":"Example 2","root":[1,null,2,3,4,5]}],
  "next-greater-element-i": [{"label":"Example 1","nums1":[4,1,2],"nums2":[1,3,4,2]},{"label":"Example 2","nums1":[2,4],"nums2":[1,2,3,4]}],
  "nqueensii": [{"label":"Example 1","n":4},{"label":"Example 2","n":1}],
  "nth-digit": [{"label":"Example 1","n":3},{"label":"Example 2","n":11}],
  "number-complement": [{"label":"Example 1","num":5},{"label":"Example 2","num":1}],
  "number-of-boomerangs": [{"label":"Example 1","points":[[1,1],[2,2],[3,3]]},{"label":"Example 2","points":[[1,0],[0,0],[0,0]]}],
  "ones-and-zeroes": [{"label":"Example 1","strs":["10","0001","111001","1","0"],"m":5,"n":3},{"label":"Example 2","strs":["10","0","1"],"m":1,"n":1}],
  "path-sum-ii": [{"label":"Example 1","root":[5,4,8,11,null,13,4,7,2,null,null,5,1],"targetSum":22},{"label":"Example 2","root":[1,2,3],"targetSum":5}],
  "path-sum-iii": [{"label":"Example 1","root":[10,5,-3,3,2,null,11,3,-2,null,1],"targetSum":8},{"label":"Example 2","root":[5,4,8,11,null,13,4,7,2,null,null,5,1],"targetSum":22}],
  "perfect-rectangles": [{"label":"Example 1","rectangles":[[1,1,2,2],[2,1,3,2],[1,2,2,3],[2,2,3,3]]},{"label":"Example 2","rectangles":[[1,1,2,2]]}],
  "permutation-sequence": [{"label":"Example 1","n":3,"k":3},{"label":"Example 2","n":4,"k":9}],
  "poor-pigs": [{"label":"Example 1","buckets":1000,"minutesToDie":15,"minutesToTest":60},{"label":"Example 2","buckets":8,"minutesToDie":1,"minutesToTest":1}],
  "predict-the-winner": [{"label":"Example 1","nums":[1,5,233,7]},{"label":"Example 2","nums":[1,5,2]}],
  "random-flip-matrix": [{"label":"Example 1","m":3,"n":2},{"label":"Example 2","m":1,"n":1}],
  "random-pick-index": [{"label":"Example 1","nums":[1,3,3,3,5]},{"label":"Example 2","nums":[1,1,1,1]}],
  "random-point-in-non-overlapping-rectangles": [{"label":"Example 1","rects":[[1,1,5,5],[6,2,10,4]]},{"label":"Example 2","rects":[[0,0,2,2],[3,1,4,3]]}],
  "rearrange-string-k-distance-apart": [{"label":"Example 1","s":"ababab","k":3},{"label":"Example 2","s":"aaadbbcc","k":3}],
  "regular-expression-matching": [{"label":"Example 1","s":"aa","p":"a"},{"label":"Example 2","s":"aa","p":"a*"}],
  "remove-k-digits": [{"label":"Example 1","num":"1432219","k":3},{"label":"Example 2","num":"10200","k":1}],
  "repeated-substring-pattern": [{"label":"Example 1","s":"abab"},{"label":"Example 2","s":"aba"}],
  "restore-ip-addresses": [{"label":"Example 1","s":"25525511135"},{"label":"Example 2","s":"0000"}],
  "reverse-pairs": [{"label":"Example 1","nums":[1,3,2,3,1]},{"label":"Example 2","nums":[2,4,3,5,1]}],
  "robot-room-cleaner": [{"label":"Example 1","room":[[1,1,1,0],[1,0,1,0],[1,1,1,1]]},{"label":"Example 2","room":[[1,0],[1,1]]}],
  "rotate-function": [{"label":"Example 1","nums":[1,2,3,4]},{"label":"Example 2","nums":[2,4,6,8]}],
  "scramble-string": [{"label":"Example 1","s1":"great","s2":"rgeat"},{"label":"Example 2","s1":"abcde","s2":"caebd"}],
  "search-in-rotated-sorted-array-ii": [{"label":"Example 1","nums":[1,0,1,1,1],"target":0},{"label":"Example 2","nums":[1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1],"target":2}],
  "search-insert-position": [{"label":"Example 1","nums":[1,3,5,6],"target":5},{"label":"Example 2","nums":[1,3,5,6],"target":7}],
  "sequence-reconstruction": [{"label":"Example 1","org":[1,2,3],"seqs":[[1,2],[1,3],[2,3]]},{"label":"Example 2","org":[1,2,3],"seqs":[[1,2],[2,3],[1,3]]}],
  "serialize-and-deserialize-bst": [{"label":"Example 1","tree":{"val":2,"left":{"val":1},"right":{"val":3}}},{"label":"Example 2","tree":{"val":5,"left":{"val":3,"left":{"val":2},"right":{"val":4}},"right":{"val":6}}}],
  "serialize-deserialize-nary-tree": [{"label":"Example 1","tree":{"val":1,"children":[{"val":3,"children":[{"val":5},{"val":6}]},{"val":2},{"val":4}]}},{"label":"Example 2","tree":{"val":1,"children":[{"val":2},{"val":3,"children":[{"val":6}]},{"val":4,"children":[{"val":7},{"val":8}]}]}}],
  "sliding-window-median": [{"label":"Example 1","nums":[1,3,-1,-3,5,3,6,7],"k":3},{"label":"Example 2","nums":[1,2,3,4,5],"k":2}],
  "smallest-good-base": [{"label":"Example 1","n":"13"},{"label":"Example 2","n":"4681"}],
  "sort-characters-by-frequency": [{"label":"Example 1","s":"tree"},{"label":"Example 2","s":"cccaaa"}],
  "spiral-matrix-ii": [{"label":"Example 1","n":3},{"label":"Example 2","n":1}],
  "string-compression": [{"label":"Example 1","chars":["a","a","b","b","c","c","c"]},{"label":"Example 2","chars":["a","b","b","b","b","b","b","b","b","b","b","b","b"]}],
  "super-washing-machines": [{"label":"Example 1","machines":[1,0,5]},{"label":"Example 2","machines":[0,3,0]}],
  "target-sum": [{"label":"Example 1","nums":[1,1,1,1,1],"target":3},{"label":"Example 2","nums":[1,0],"target":1}],
  "task-scheduler": [{"label":"Example 1","tasks":["A","A","A","B","B","B"],"n":2},{"label":"Example 2","tasks":["A","A","A","B","B","B"],"n":0}],
  "teemo-attacking": [{"label":"Example 1","attackTime":[1,4],"duration":2},{"label":"Example 2","attackTime":[1,2],"duration":2}],
  "ternary-expression-parser": [{"label":"Example 1","expression":"T?2:3"},{"label":"Example 2","expression":"F?1:T?4:5"}],
  "the-maze": [{"label":"Example 1","maze":[[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]],"start":[0,0],"destination":[4,4]},{"label":"Example 2","maze":[[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]],"start":[0,0],"destination":[3,2]}],
  "the-maze-iii": [{"label":"Example 1","maze":[[0,0,0,0,0],[1,1,0,0,1],[0,0,0,0,0],[0,1,0,1,0],[0,1,0,0,0]],"ball":[4,3],"hole":[0,1]},{"label":"Example 2","maze":[[0,0,0,0,0],[1,1,0,0,1],[0,0,0,0,0],[0,1,0,1,0],[0,1,0,0,0]],"ball":[4,3],"hole":[3,0]}],
  "total-hamming-distance": [{"label":"Example 1","nums":[4,14,2]},{"label":"Example 2","nums":[1,14,2]}],
  "ugly-number-ii": [{"label":"Example 1","n":10},{"label":"Example 2","n":15}],
  "unique-substrings-in-wraparound-string": [{"label":"Example 1","s":"abc"},{"label":"Example 2","s":"cdc"}],
  "utf-8-validation": [{"label":"Example 1","data":[197,130,1]},{"label":"Example 2","data":[235,140,4]}],
  "validate-ip-address": [{"label":"Example 1","queryIP":"172.16.254.1"},{"label":"Example 2","queryIP":"2001:0db8:85a3:0:0:8A2E:0370:7334"}],
  "verbal-arithmetic-puzzle": [{"label":"Example 1","equation":"SEND+MORE=MONEY"},{"label":"Example 2","equation":"SIX+SEVEN=TWELVE"}],
  "word-squares": [{"label":"Example 1","words":["abat","baba","atan","tata"]},{"label":"Example 2","words":["cat","bat","rat"]}],
  "zuma-game": [{"label":"Example 1","board":"WWWWW","hand":"WWWWW"},{"label":"Example 2","board":"WWRRWWWWRRWWWWRRWWW","hand":"WRWWWWWW"}]
}

/**
 * Get examples for a specific problem
 * @param {string} problemSlug - The problem slug in kebab-case (e.g., 'two-sum')
 * @returns {Array} Array of example objects, or empty array if problem not found
 */
export function getExamples(problemSlug) {
  return EXAMPLES_REGISTRY[problemSlug]
}

/**
 * Get all available problem slugs
 * @returns {Array<string>} Array of all problem slugs
 */
export function getAllProblems() {
  return Object.keys(EXAMPLES_REGISTRY)
}

/**
 * Get the count of examples for a problem
 * @param {string} problemSlug - The problem slug
 * @returns {number} Count of examples
 */
export function getExamplesCount(problemSlug) {
  const examples = getExamples(problemSlug)
  return examples.length
}
