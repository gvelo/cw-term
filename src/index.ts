import { Terminal } from "@xterm/xterm";
import '@xterm/xterm/css/xterm.css';

let termDiv = document.getElementById("terminal");
let term = new Terminal();
term.open(termDiv!);
term.write('Hello world');
let cw = new jscw();
cw.setText("hello world");
cw.play();







