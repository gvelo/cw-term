// Copyright 2024 The cw-console authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ConfStorage } from "./config";
import { Tx } from "./tx";
import { Terminal } from "./Terminal";
import { TxCommand } from "./txcmd";
import { StatusBar } from "./statusbar";
import { KochCommand } from "./koch/cmd";
import { theme } from "./theme";

export class RootApp {
  private terminal: Terminal;
  private tx: Tx;
  private storage: ConfStorage;
  private txCmd: TxCommand;
  private kochCmd: KochCommand;
  private statusBar: StatusBar;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.storage = new ConfStorage();
    this.tx = new Tx(this.storage);
    this.txCmd = new TxCommand(this.terminal, this.tx);
    this.kochCmd = new KochCommand(this.terminal, this.tx, this.storage);
    this.statusBar = new StatusBar(this.terminal, this.tx);
  }

  async start() {
    this.showWellcome();
    while (true) {
      const prompt = "cw-console: ";
      const line = await this.terminal.readLine(prompt);
      if (line) {
        await this.processLine(line);
      }
      this.statusBar.setCmd("");
    }
  }

  async processLine(line: string) {
    const argv = this.parseCommandLine(line);
    if (argv) {
      const cmd = argv[0];
      switch (cmd) {
        case "help":
          this.showUsage();
          break;
        case "koch":
          await this.kochCmd.exec(argv);
          break;
        case "tx":
          this.statusBar.setCmd("tx");
          await this.txCmd.exec(argv);
          break;
        case "callsign":
          this.terminal.writeln("not yet implemented");
          break;
        case "qso":
          this.terminal.writeln("not yet implemented");
          break;
        default:
          this.terminal.writeln(`command not found: ${cmd}`);
          break;
      }
    }
  }

  parseCommandLine(command: string): string[] {
    const argv: string[] = [];
    let currentArg = "";
    let inQuotes = false;
    let escape = false;

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if (escape) {
        currentArg += char;
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === " " && !inQuotes) {
        if (currentArg.length > 0) {
          argv.push(currentArg);
          currentArg = "";
        }
      } else {
        currentArg += char;
      }
    }

    if (currentArg.length > 0) {
      argv.push(currentArg);
    }

    return argv;
  }

  private showWellcome(): void {
    this.terminal.writeln(`
                                            _       
  ____ _ _ _     ____ ___  ____   ___  ___ | | ____ 
 / ___) | | |   / ___) _ \\|  _ \\ /___)/ _ \\| |/ _  )
( (___| | | |  ( (__| |_| | | | |___ | |_| | ( (/ / 
 \\____)\\____|   \\____)___/|_| |_(___/ \\___/|_|\\____)

type 'help' if you are new!                    (v0.0.1)  

  `);
  }

  showUsage() {
    this.terminal.writeln(
      theme.info(`

cw-console is a simple Morse code training program designed to help you improve
your CW (Continuous Wave) abilities. The following subcommands provide various 
methods to practice and enhance your skills:

  koch:
    Train Morse code using the Koch method, which introduces characters gradually, 
    starting with just two characters and adding more as you become proficient. 
    This method focuses on listening at full speed from the start, helping you develop 
    accuracy and speed simultaneously.
    Type 'koch --help' for more details.

  callsign:
    Practice receiving and decoding callsigns, a key skill for amateur radio operators. 
    This exercise helps you become proficient in identifying callsigns quickly and 
    accurately.
    Type 'callsign --help' for more details.

  qso:
    Train using a standard QSO (conversation) format, simulating real-world Morse 
    code exchanges. This mode helps you get comfortable with the structure and flow 
    of typical CW QSOs.
    Type 'qso --help' for more details.

  tx:
    Transmit arbitrary text in Morse code. This mode allows you to practice sending 
    text at your chosen speed, tone, and settings, which can be customized to fit 
    your preferences.
    Type 'tx --help' for more details.

For more information on any specific subcommand, use the '--help' flag after the subcommand name.

      `)
    );
  }
}
