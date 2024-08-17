import { App } from "./app";
import { Config } from "./config";
import { Cw } from "./cw";
import { RootApp } from "./root";
import { Terminal } from "./Terminal";

export class Koch implements App {
  lesson: number;
  terminal: Terminal;
  config: Config;
  cw: Cw;

  constructor(config: Config, cw: Cw, terminal: Terminal) {
    this.terminal = terminal;
    this.config = config;
    this.cw = cw;
    this.lesson = 1;
  }

  async processLine(line: string[]) {
    throw new Error("Method not implemented.");
  }

  prompt(): string {
    return `kock lesson:${this.lesson} > `;
  }

  allowLineEnter(): boolean {
    throw new Error("Method not implemented.");
  }
}
