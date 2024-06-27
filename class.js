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
    error = columnNumber < Board.columns - Board.rows || Board.columns < columnNumber;
    if (error) {
      console.writeln(`Error!!! - Por favor elige una columna entre ${Board.columns - Board.rows} y ${Board.columns}`);
    }
  } while (error);
  return columnNumber - (Board.columns - Board.rows);
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
  for (let i = 0; i < Board.rows; i++) {
    console.write("|");
    for (let j = 0; j < Board.columns; j++) {
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

class Board {
    #cells
    static rows = 6;
    static columns = 7;
    static emptyCharacter = " ";

    constructor() {
        this.#cells = [];
        this.#generateCells();
    }

    #generateCells() {
        for (let i = 0; i < Board.rows; i++) {
            this.#cells[i] = [];
            for (let j = 0; i < Board.columns; j++) {
                this.#cells[i][j] = Board.emptyCharacter;
            }
        }
    }

    getCells() {
        return this.#cells;
    }

    isConnect4(coordinateOfLastTokenPlaced) {
        const checker = new Checker(this.#cells);
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
    }

    isTie() {
        for (let i = 0; i < Board.rows; i++) {
            for (let j = 0; j < Board.columns; j++) {
                if (this.#cells[i][j] === Board.emptyCharacter) {
                    return false;
                }
            }
        }
        return true;
    }

    add(token, column) {
        let placedToken = false;
        for (let i = Board.rows - 1; !placedToken && i >= 0; i--) {
            if (this.cells[i][column] === Board.emptyCharacter) {
                this.#cells[i][column] = token;
                placedToken = true;
            }
        }
    }

    getCoordinateOfLastAddedToken(token, column) {
        let coordinateFound = false;
        let coordinateOfLastAddedToken;
        for (let i = 0; !coordinateFound && i < Board.columns; i++) {
            if (this.#cells[i][column] === token) {
                coordinateOfLastAddedToken = new Coordinate(column, i);
                coordinateFound = true;
            }
        }
        return coordinateOfLastAddedToken
    }

    isThereAGap(column) {
        if (this.#cells[0][column] !== Board.emptyCharacter) {
            return true;
        }
        return false;
    }

}

class GameView {

    #board
    #turn
    #boardView
    #players
    #playerView

    constructor() {
        this.#board = new Board();
        this.#turn = new Turn();
        this.#boardView = new BoardView(this.#board, this.#turn);
        this.#players = [new Player(Token.RED), new Player(Token.Yellow)];
        this.#playerView = new PlayerView();
    }

    play() {
        let winner = false;
        this.#boardView.show();
        while (!winner && !this.#board.isTie()) {
            let columnToInsertToken = this.#getValidAndNonFullColumn(this);
            this.#board.add(this.#players[this.#turn.getTurn()].getToken(), columnToInsertToken);
            let coordinateOfLastAddedToken = this.#board.getCoordinateOfLastAddedToken(this.#players[this.#turn.getTurn()].getToken(), columnToInsertToken);
            winner = this.#board.isConnect4(coordinateOfLastAddedToken);
            this.#boardView.show();
            if (!winner && !this.#board.isTie()) {
                this.#turn.nextTurn();
            }
        }
        if (winner) {
            this.#boardView.showWinningMessage(this.#turn.getTurn());
        } else if (this.#board.isTie()) {
            this.#boardView.showTieMessage();
        }
    }

    #getValidAndNonFullColumn(object) {
        let columnComplet;
        let column;
        do {
          column = object.#playerView.getValidColumn(object.#players[object.#turn.getTurn()].getToken());
          columnComplet = object.#board.isThereAGap(column);
          if (columnComplet) {
            console.writeln("La columna elegida ya está completa. !!!ELIGUE OTRA COLUMNA!!!");
          }
        } while (columnComplet);
        return column;
      }
}

class YesNoDialogView {

    #question
    #answer

    constructor(question) {
        this.#question = question;
        this.#answer = "";
    }

    read() {
        let error;
        do {
            this.#answer = console.readString(this.#question);
            error = !this.isAffirmative() && !this.#isNegative();
            if (error) {
                console.writeln(`Por favor responda "si" o "no"`);
            }
        } while (error);
    }

    isAffirmative() {
        return this.#answer === "si";
    }

    #isNegative() {
        return this.#answer === "no";
    }
}

class Connect4View {

    play() {
        const continueDialogView = new YesNoDialogView("¿Desea continuar jugando? ");
        do {
            new GameView().play();
            continueDialogView.read();
        } while (continueDialogView.isAffirmative());
    }
}

let game = new Connect4View();
game.play();
