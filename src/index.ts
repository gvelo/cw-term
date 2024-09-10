import { RootApp } from "./root";
import { Terminal } from "./Terminal";
let termDiv = document.getElementById("terminal");

const term = new Terminal(termDiv!);

writeWellcome(term);

const root = new RootApp(term);
root.start();


// term.onKey((e: { key: string, domEvent: KeyboardEvent }) => {
//     term.write(e.key);
//     let cw = new jscw();
//     cw.setText(groupsStr);
//     cw.setEff(6);
//     cw.setWpm(20);
//     cw.play();
// })

function writeWellcome(term: Terminal) {
    term.writeln("wellcome to cw-terminal");
}








