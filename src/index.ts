import { RootApp } from "./root";
import { Terminal } from "./Terminal";
let termDiv = document.getElementById("terminal");

const term = new Terminal(termDiv!);

const root = new RootApp(term);
root.start();
