const { Console } = require("console-mpds");
const console = new Console();

function Token() {}

Token.RED = "R";
Token.Yellow = "Y";

function Coordinate(axisX, axisY) {
  this.axisX = axisX;
  this.axisY = axisY;
}

Coordinate.prototype.getAxisX = function () {
  return this.axisX;
};

Coordinate.prototype.getAxisY = function () {
  return this.axisY;
};

Coordinate.prototype.asYouAreDisplaced = function (direction) {
  return new Coordinate(this.axisX + direction.getAxisX(), this.axisY + direction.getAxisY());
};

function Checker(cells) {
  this.cells = cells;
}

Checker.prototype.review = function (coordinates, coordinateOfLastTokenPlaced) {
  let count = 1; 
  let displacedCoordinate;
  const lineLength = 4;
  for (let i = 0; i < coordinates.length; i++) {
    displacedCoordinate = coordinateOfLastTokenPlaced.asYouAreDisplaced(coordinates[i]);
    while (
      isWithinTheRange(displacedCoordinate) &&
      this.cells[coordinateOfLastTokenPlaced.getAxisY()][coordinateOfLastTokenPlaced.getAxisX()]
       === this.cells[displacedCoordinate.getAxisY()][displacedCoordinate.getAxisX()]
    ) {
      count++;
      displacedCoordinate = displacedCoordinate.asYouAreDisplaced(coordinates[i]);
    }
    if (count >= lineLength) {
      return true;
    }
  }
  return false;

  function isWithinTheRange(coordinate) {
    const RANGE_X = 6;
    const RANGE_Y = 5;
    const MINOR_RANGE = 0;
    return (
      MINOR_RANGE <= coordinate.getAxisX() &&
      coordinate.getAxisX() <= RANGE_X &&
      MINOR_RANGE <= coordinate.getAxisY() &&
      coordinate.getAxisY() <= RANGE_Y
    );
  }
};

function Turn() {
  this.turn = 0;
  this.MAX_PLAYERS = 2;
}

Turn.prototype.nextTurn = function () {
  this.turn = (this.turn + 1) % this.MAX_PLAYERS;
};

Turn.prototype.getTurn = function () {
  return this.turn;
};

function PlayerView() {}

PlayerView.prototype.getValidColumn = function (token) {
  let error;
  let columnNumber;
  do {
    columnNumber = console.readNumber(
      `Selecciona una columna para insertar FICHA ${token === Token.RED ? "ROJA" : "AMARILLA"}: `
    );
    error = columnNumber < Board.COLUMNS - Board.ROWS || Board.COLUMNS < columnNumber;
    if (error) {
      console.writeln(`Error!!! - Por favor elige una columna entre ${Board.COLUMNS - Board.ROWS} y ${Board.COLUMNS}`);
    }
  } while (error);
  return columnNumber - (Board.COLUMNS - Board.ROWS);
};

function Player(token) {
  this.token = token;
}

Player.prototype.getToken = function () {
  return this.token;
};

function BoardView(board) {
  this.board = board;
}

BoardView.prototype.show = function () {
  console.writeln("----------------------");
  for (let i = 0; i < Board.ROWS; i++) {
    console.write("|");
    for (let j = 0; j < Board.COLUMNS; j++) {
      console.write(`${this.board.getCells()[i][j]} |`);
    }
    console.writeln();
  }
  console.writeln("----------------------");
};

BoardView.prototype.showWinningMessage = function (turn) {
  console.writeln(`Felicidades gano el jugador ${++turn}`);
};

BoardView.prototype.showTieMessage = function () {
  console.writeln("!!!EMPATE!!!");
};

function Board() {
  this.cells = [];
  generateCells(this);

  function generateCells(object) {
    for (let i = 0; i < Board.ROWS; i++) {
      object.cells[i] = [];
      for (let j = 0; j < Board.COLUMNS; j++) {
        object.cells[i][j] = Board.EMPTY_CHARACTER;
      }
    }
  }
}

Board.ROWS = 6;
Board.COLUMNS = 7;
Board.EMPTY_CHARACTER = " ";

Board.prototype.getCells = function () {
  return this.cells;
};

Board.prototype.isConnect4 = function (coordinateOfLastTokenPlaced) {
  const checker = new Checker(this.cells);
  const directions = [
    [new Coordinate(1, 0), new Coordinate(-1, 0)],
    [new Coordinate(0, 1), new Coordinate(0, -1)],
    [new Coordinate(1, 1), new Coordinate(-1, -1)],
    [new Coordinate(-1, 1), new Coordinate(1, -1)],
  ];

  for (let i = 0; i < directions.length; i++) {
      if (checker.review(directions[i], coordinateOfLastTokenPlaced)) {
          return true;
      }
  }
  return false;
};

Board.prototype.isTie = function () {
  for (let i = 0; i < Board.ROWS; i++) {
    for (let j = 0; j < Board.COLUMNS; j++) {
      if (this.cells[i][j] === Board.EMPTY_CHARACTER) {
        return false;
      }
    }
  }
  return true;
};

Board.prototype.add = function (token, column) {
  let placedToken = false;
  for (let i = Board.ROWS - 1; !placedToken && i >= 0; i--) {
    // Cambiar por un do while
    if (this.cells[i][column] === Board.EMPTY_CHARACTER) {
      this.cells[i][column] = token;
      placedToken = true;
    }
  }
};

Board.prototype.getCoordinateOfLastAddedToken = function (token, column) {
  let coordinateFound = false;
  let coordinateOfLastAddedToken;
  for (let i = 0; !coordinateFound && i < Board.COLUMNS; i++) {
    if (this.cells[i][column] === token) {
      coordinateOfLastAddedToken = new Coordinate(column, i);
      coordinateFound = true;
    }
  }
  return coordinateOfLastAddedToken;
};

Board.prototype.isThereAGap = function (column) {
  if (this.cells[0][column] !== Board.EMPTY_CHARACTER) {
    return true;
  }
  return false;
};

function GameView() {
  this.board = new Board();
  this.turn = new Turn();
  this.boardView = new BoardView(this.board, this.turn);
  this.players = [new Player(Token.RED), new Player(Token.Yellow)];
  this.playerView = new PlayerView();
}

GameView.prototype.play = function () {
  let winner = false;
  this.boardView.show();
  while (!winner && !this.board.isTie()) {
    let columnToInsertToken = getValidAndNonFullColumn(this); // Error
    this.board.add(this.players[this.turn.getTurn()].getToken(), columnToInsertToken);
    let coordinateOfLastAddedToken = this.board.getCoordinateOfLastAddedToken(
      this.players[this.turn.getTurn()].getToken(),
      columnToInsertToken
    );
    winner = this.board.isConnect4(coordinateOfLastAddedToken);
    this.boardView.show();
    if (!winner && !this.board.isTie()) {
      this.turn.nextTurn();
    }
  }
  if (winner) {
    this.boardView.showWinningMessage(this.turn.getTurn());
  } else if (this.board.isTie()) {
    this.boardView.showTieMessage();
  }

  function getValidAndNonFullColumn(object) {
    let columnComplet; // Eliminar esta variable y utilizar unicamente la llamada al objeto board.isThereAGap.
    let column;
    do {
      column = object.playerView.getValidColumn(object.players[object.turn.getTurn()].getToken());
      columnComplete = object.board.isThereAGap(column);
      if (columnComplet) {
        console.writeln("La columna elegida ya está completa. !!!ELIGUE OTRA COLUMNA!!!");
      }
    } while (columnComplet);
    return column;
  }
};

function YesNoDialogView(question) {
  this.question = question;
  this.answer = "";
}

YesNoDialogView.prototype.read = function () {
  let error;
  do {
    this.answer = console.readString(this.question);
    error = !this.isAffirmative() && !this.isNegative();
    if (error) {
      console.writeln(`Por favor responda "si" o "no"`);
    }
  } while (error);
};

YesNoDialogView.prototype.isAffirmative = function () {
  return this.answer === "si";
};

YesNoDialogView.prototype.isNegative = function () {
  return this.answer === "no";
};

function Connect4View() {}

Connect4View.prototype.play = function () {
  const continueDialogView = new YesNoDialogView("¿Desa continuar jugando? ");
  do {
    const gameView = new GameView();
    gameView.play();
    continueDialogView.read();
  } while (continueDialogView.isAffirmative());
};

let game = new Connect4View();
game.play();
