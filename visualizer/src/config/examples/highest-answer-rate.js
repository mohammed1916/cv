// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several questions with different responses",
    "questions": [
      {
        "id": 11,
        "submissions": 3
      },
      {
        "id": 12,
        "submissions": 5
      },
      {
        "id": 13,
        "submissions": 7
      }
    ],
    "answers": [
      {
        "question_id": 11,
        "answer_id": 21,
        "id": 1,
        "is_accepted": 1
      },
      {
        "question_id": 11,
        "answer_id": 22,
        "id": 2,
        "is_accepted": 1
      },
      {
        "question_id": 12,
        "answer_id": 23,
        "id": 3,
        "is_accepted": 1
      }
    ]
  },
  {
    "label": "No answers",
    "questions": [
      {
        "id": 31,
        "submissions": 3
      },
      {
        "id": 32,
        "submissions": 5
      }
    ],
    "answers": []
  },
  {
    "label": "One answered question",
    "questions": [
      {
        "id": 41,
        "submissions": 3
      }
    ],
    "answers": [
      {
        "question_id": 41,
        "answer_id": 51,
        "id": 1,
        "is_accepted": 1
      }
    ]
  }
];
