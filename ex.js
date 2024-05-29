const { Console } = require("console-mpds");
const console = new Console();

//Horizontal
let cellsHorizontal = [
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", "R", "R", "R", " "],
  [" ", " ", " ", "R", "Y", "Y", "Y"],
  [" ", " ", " ", "R", "R", "Y", "Y"],
  ["Y", " ", " ", "Y", "R", "R", "Y"],
];

//Vertical
let cellsVertical = [
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", "Y", "Y", "Y", "R", " ", " "],
  ["R", "R", "R", "R", "Y", "R", " "],
  [" ", "Y", "R", "R", "Y", "Y", "Y"],
];

//Diagonal
let cellsDiagonal = [
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", "R", " ", " ", " ", " ", " "],
  [" ", "Y", "R", "Y", " ", " ", " "],
  [" ", "R", "Y", "R", "R", " ", " "],
  [" ", "Y", "Y", "R", "R", "Y", "Y"],
];

//Diagonal invert
let cellsVerticalDiagonalInvert = [
  [" ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", "R", " "],
  [" ", " ", " ", " ", "R", "Y", " "],
  [" ", " ", "Y", "R", "Y", "R", " "],
  [" ", " ", "R", "R", "Y", "Y", " "],
  [" ", " ", "R", "Y", "Y", "R", " "],
];

let coordinateOfLastTokenPlaced = initCoordinate(2, 3);
console.writeln(isConnect4(coordinateOfLastTokenPlaced));

function isConnect4(coordinateOfLastTokenPlaced) {
  // 2, 5
  const cardinalPoints = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
  const directionCoordinate = [
    initDirection(initCoordinate(0, 1)),
    initDirection(initCoordinate(1, 1)),
    initDirection(initCoordinate(1, 0)),
    initDirection(initCoordinate(1, -1)),
    initDirection(initCoordinate(0, -1)),
    initDirection(initCoordinate(-1, -1)),
    initDirection(initCoordinate(-1, 0)),
    initDirection(initCoordinate(-1, 1)),
  ];

  let counter = 1;
  for (let i = 0; counter !== 4 && i < 3; i++) {
    let displacedCoordinate = coordinateOfLastTokenPlaced.moveTo(directionCoordinate[0].getCoordinate());
    if (
      cellsHorizontal[coordinateOfLastTokenPlaced.getX()][coordinateOfLastTokenPlaced.getY()] ===
      cellsHorizontal[displacedCoordinate.getX()][displacedCoordinate.getY()]
    ) {
      counter++;
    } else {
      displacedCoordinate = coordinateOfLastTokenPlaced.moveTo(directionCoordinate[4].getCoordinate());
      if (
        cellsHorizontal[coordinateOfLastTokenPlaced.getX()][coordinateOfLastTokenPlaced.getY()] ===
        cellsHorizontal[displacedCoordinate.getX()][displacedCoordinate.getY()]
      ) {
        counter++;
      }
    }
  }
  console.writeln(`Counter: ${counter}`);
  return counter === 4;
}

function initCoordinate(x, y) {
  function sumCoordinate(coordinate) {
    let newCoordinate = initCoordinate(x + coordinate.getX(), y + coordinate.getY());
    return newCoordinate;
  }

  return {
    getX: function () {
      return x;
    },
    getY: function () {
      return y;
    },
    moveTo: function (coordinate) {
      return initCoordinate(x + coordinate.getX(), y + coordinate.getY());
    },
    getCoordinate: function () {
      return initCoordinate(this.getX(), this.getY());
    },
  };
}

function initDirection(coordinate) {
  const scrollingMode = coordinate;
  return {
    getScrollingMode: function () {
      return scrollingMode;
    },
  };
}
