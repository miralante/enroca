/* Language-neutral curriculum; all text lives in strings.<locale>.js. */
(function(root) {
  'use strict';
  const lessons = [
  {
    "id": "board",
    "piece": "r",
    "steps": 3,
    "pos": {},
    "focus": "h1",
    "marks": [
      "h1"
    ],
    "exercises": [
      {
        "id": "board-0",
        "type": "choice",
        "key": "lesson.board.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "board-1",
        "type": "choice",
        "key": "lesson.board.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  },
  {
    "id": "turns",
    "piece": "p",
    "steps": 3,
    "pos": {
      "e2": "P",
      "e7": "p"
    },
    "focus": "e2",
    "marks": [
      "e3",
      "e4"
    ],
    "move": [
      "e2",
      "e4"
    ],
    "exercises": [
      {
        "id": "turns-0",
        "type": "choice",
        "key": "lesson.turns.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "turns-1",
        "type": "choice",
        "key": "lesson.turns.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  },
  {
    "id": "rook",
    "piece": "r",
    "steps": 3,
    "pos": {
      "d4": "R"
    },
    "focus": "d4",
    "marks": [
      "d1",
      "d2",
      "d3",
      "d5",
      "d6",
      "d7",
      "d8",
      "a4",
      "b4",
      "c4",
      "e4",
      "f4",
      "g4",
      "h4"
    ],
    "move": [
      "d4",
      "d7"
    ],
    "exercises": [
      {
        "id": "rook-0",
        "type": "choice",
        "key": "lesson.rook.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "rook-move",
        "type": "move",
        "key": "lesson.rook.target",
        "from": "d4",
        "to": "d7"
      }
    ]
  },
  {
    "id": "bishop",
    "piece": "b",
    "steps": 3,
    "pos": {
      "d4": "B"
    },
    "focus": "d4",
    "marks": [
      "a1",
      "b2",
      "c3",
      "e5",
      "f6",
      "g7",
      "h8",
      "a7",
      "b6",
      "c5",
      "e3",
      "f2",
      "g1"
    ],
    "move": [
      "d4",
      "f6"
    ],
    "exercises": [
      {
        "id": "bishop-0",
        "type": "choice",
        "key": "lesson.bishop.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "bishop-move",
        "type": "move",
        "key": "lesson.bishop.target",
        "from": "d4",
        "to": "f6"
      }
    ]
  },
  {
    "id": "queen",
    "piece": "q",
    "steps": 3,
    "pos": {
      "d4": "Q"
    },
    "focus": "d4",
    "marks": [
      "d7",
      "d6",
      "d5",
      "e5",
      "f6",
      "g7",
      "e4",
      "f4",
      "g4",
      "c3",
      "b2",
      "a1"
    ],
    "move": [
      "d4",
      "g7"
    ],
    "exercises": [
      {
        "id": "queen-0",
        "type": "choice",
        "key": "lesson.queen.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "queen-move",
        "type": "move",
        "key": "lesson.queen.target",
        "from": "d4",
        "to": "g7"
      }
    ]
  },
  {
    "id": "king",
    "piece": "k",
    "steps": 3,
    "pos": {
      "d4": "K"
    },
    "focus": "d4",
    "marks": [
      "c3",
      "d3",
      "e3",
      "c4",
      "e4",
      "c5",
      "d5",
      "e5"
    ],
    "move": [
      "d4",
      "e5"
    ],
    "exercises": [
      {
        "id": "king-0",
        "type": "choice",
        "key": "lesson.king.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "king-move",
        "type": "move",
        "key": "lesson.king.target",
        "from": "d4",
        "to": "e5"
      }
    ]
  },
  {
    "id": "knight",
    "piece": "n",
    "steps": 3,
    "pos": {
      "d4": "N"
    },
    "focus": "d4",
    "marks": [
      "b3",
      "b5",
      "c2",
      "c6",
      "e2",
      "e6",
      "f3",
      "f5"
    ],
    "move": [
      "d4",
      "e6"
    ],
    "exercises": [
      {
        "id": "knight-0",
        "type": "choice",
        "key": "lesson.knight.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "knight-move",
        "type": "move",
        "key": "lesson.knight.target",
        "from": "d4",
        "to": "e6"
      }
    ]
  },
  {
    "id": "pawn",
    "piece": "p",
    "steps": 3,
    "pos": {
      "d2": "P",
      "e3": "p"
    },
    "focus": "d2",
    "marks": [
      "d3",
      "d4",
      "e3"
    ],
    "move": [
      "d2",
      "e3"
    ],
    "exercises": [
      {
        "id": "pawn-0",
        "type": "choice",
        "key": "lesson.pawn.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "pawn-move",
        "type": "move",
        "key": "lesson.pawn.target",
        "from": "d2",
        "to": "d3"
      }
    ]
  },
  {
    "id": "capture",
    "piece": "r",
    "steps": 3,
    "pos": {
      "d4": "R",
      "d7": "p",
      "f4": "P"
    },
    "focus": "d4",
    "marks": [
      "d7"
    ],
    "move": [
      "d4",
      "d7"
    ],
    "exercises": [
      {
        "id": "capture-0",
        "type": "choice",
        "key": "lesson.capture.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "capture-move",
        "type": "move",
        "key": "lesson.capture.target",
        "from": "d4",
        "to": "d7"
      }
    ]
  },
  {
    "id": "check",
    "piece": "k",
    "steps": 3,
    "pos": {
      "e1": "K",
      "e8": "r",
      "a8": "k"
    },
    "focus": "e1",
    "marks": [
      "d1",
      "f1",
      "d2",
      "f2"
    ],
    "move": [
      "e1",
      "d1"
    ],
    "exercises": [
      {
        "id": "check-0",
        "type": "choice",
        "key": "lesson.check.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "check-1",
        "type": "choice",
        "key": "lesson.check.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  },
  {
    "id": "castle",
    "piece": "k",
    "steps": 4,
    "pos": {
      "e1": "K",
      "h1": "R",
      "e8": "k"
    },
    "focus": "e1",
    "marks": [
      "f1",
      "g1"
    ],
    "move": [
      "e1",
      "g1"
    ],
    "castle": true,
    "exercises": [
      {
        "id": "castle-0",
        "type": "choice",
        "key": "lesson.castle.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "castle-1",
        "type": "choice",
        "key": "lesson.castle.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  },
  {
    "id": "promotion",
    "piece": "q",
    "steps": 3,
    "pos": {
      "d7": "P"
    },
    "focus": "d7",
    "marks": [
      "d8"
    ],
    "move": [
      "d7",
      "d8"
    ],
    "promote": true,
    "exercises": [
      {
        "id": "promotion-0",
        "type": "choice",
        "key": "lesson.promotion.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "promotion-1",
        "type": "choice",
        "key": "lesson.promotion.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  },
  {
    "id": "enpassant",
    "piece": "p",
    "steps": 4,
    "pos": {
      "d5": "P",
      "e5": "p"
    },
    "focus": "d5",
    "marks": [
      "e6"
    ],
    "move": [
      "d5",
      "e6"
    ],
    "ep": "e5",
    "exercises": [
      {
        "id": "enpassant-0",
        "type": "choice",
        "key": "lesson.enpassant.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "enpassant-1",
        "type": "choice",
        "key": "lesson.enpassant.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  },
  {
    "id": "draw",
    "piece": "k",
    "steps": 4,
    "pos": {
      "a8": "k",
      "c6": "K",
      "c7": "Q"
    },
    "focus": "a8",
    "marks": [],
    "exercises": [
      {
        "id": "draw-0",
        "type": "choice",
        "key": "lesson.draw.q.0",
        "answer": 0,
        "options": 3
      },
      {
        "id": "draw-1",
        "type": "choice",
        "key": "lesson.draw.q.1",
        "answer": 0,
        "options": 3
      }
    ]
  }
];
  if (typeof module === 'object' && module.exports) module.exports = lessons;
  else root.EnrocaLessons = lessons;
}(typeof globalThis !== 'undefined' ? globalThis : this));
