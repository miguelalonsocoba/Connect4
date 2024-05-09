const { Console } = require("console-mpds");
const console = new Console();

const name = console.readString("Enter your name: ");
console.writeln(`Hello, ${name}!`);
