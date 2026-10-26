// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several authors and follow changes",
    "operations": [
      "postTweet",
      "postTweet",
      "follow",
      "postTweet",
      "getNewsFeed",
      "unfollow",
      "getNewsFeed"
    ],
    "params": {
      "postTweet": [
        [
          11,
          101
        ],
        [
          12,
          202
        ],
        [
          12,
          203
        ]
      ],
      "follow": [
        [
          11,
          12
        ]
      ],
      "unfollow": [
        [
          11,
          12
        ]
      ],
      "getNewsFeed": [
        11,
        11
      ]
    }
  },
  {
    "label": "Only own posts",
    "operations": [
      "postTweet",
      "postTweet",
      "getNewsFeed"
    ],
    "params": {
      "postTweet": [
        [
          21,
          301
        ],
        [
          21,
          302
        ]
      ],
      "getNewsFeed": [
        21
      ]
    }
  },
  {
    "label": "Empty feed",
    "operations": [
      "getNewsFeed"
    ],
    "params": {
      "getNewsFeed": [
        31
      ]
    }
  }
];
