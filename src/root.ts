import { App } from "./app";
import { Config } from "./config";
import { Cw } from "./cw";
import { Koch } from "./koch";
import { Terminal } from "./Terminal";

export class RootApp {
  terminal: Terminal;
  cw: Cw;
  config: Config;
  activeApp: App | null;
  koch: Koch;
  //callsigns: CallSigns;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.config = new Config();
    this.cw = new Cw();
    this.activeApp = null;
    this.koch = new Koch(this.config, this.cw, this.terminal);
  }

  async start() {
    while (true) {
      const prompt = this.activeApp ? this.activeApp.prompt() : "cw-console> ";
      const line = (await this.terminal.readLine(prompt)).trim();
      if (line) {
        this.processLine(line.trim().split(" "));
      }
      console.log("reading .... ");
    }
  }

  processLine(line: string[]) {
    switch (line[0]) {
      case "eff":
        this.setEff(line);
        break;
      default:
        if (this.activeApp) {
          this.activeApp.processLine(line);
        } else {
          switch (line[0]) {
            case "koch":
              this.activate(this.koch);
              break;
            case "qso":
              break;
            case "callsigns":
              break;
            case "words":
              break;
            case "help":
              this.printHelp();
              break;
            default:
              this.terminal.println(`command not found: {str}`);
          }
        }
    }
  }

  activate(app: App) {
    this.activeApp = app;
    //TODO: set the event liseners.
  }
  setEff(line: string[]) {
    console.log(line);
  }
  printHelp() {
    this.terminal.println("help");
  }
  //const customChalk = new Chalk({level: 2});
}
