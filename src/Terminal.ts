import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Readline } from "xterm-readline";

export class Terminal {
  xterm: Xterm;
  input: Readline;

  constructor(termDiv: HTMLElement) {
    const fitAddon = new FitAddon();
    const readLine = new Readline();

    this.xterm = new Xterm({
      cursorBlink: true,
      convertEol: true,
      cursorStyle: "block",
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: {
        foreground: "#FFFFFF",
        background: "#000000",
      },
    });

    this.xterm.loadAddon(fitAddon);
    this.xterm.loadAddon(readLine);

    this.xterm.open(termDiv!);

    fitAddon.fit();
    this.xterm.focus();
    this.input = readLine;
  }

  write(str: string) {
    this.xterm.write(str);
  }

  writeln(str?: string) {
    if (str) {
      this.xterm.write(str + "\r\n");
    } else {
      this.xterm.write("\r\n");
    }
  }

  readLine(prompt: string): Promise<string> {
    return this.input.read(prompt);
  }
}
