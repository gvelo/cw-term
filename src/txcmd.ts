// Copyright 2024 The cw-term authors.
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

import { Terminal } from "./Terminal";
import { Tx } from "./tx";
import { theme } from "./theme";

type TxConfigProperty = "wpm" | "eff" | "freq" | "volume";
const txConfigKeys: TxConfigProperty[] = ["wpm", "eff", "freq", "volume"];

interface TxConfigCmd {
  action: "show" | "set";
  property?: TxConfigProperty;
  value?: number;
}

interface TxSendCmd {
  message: string;
  wpm?: number;
  eff?: number;
  freq?: number;
  volume?: number;
}

export class TxCommand {
  private terminal: Terminal;
  private tx: Tx;

  constructor(terminal: Terminal, tx: Tx) {
    this.terminal = terminal;
    this.tx = tx;
  }

  async exec(args: string[]) {
    // Remove the first two elements (node executable and script name)
    const [command, ...restArgs] = args.slice(1);
    try {
      switch (command) {
        case "config":
          this.execConfigCmd(this.parseConfigCommand(restArgs));
          break;
        case "send":
          await this.execSendCmd(this.parseSendCommand(restArgs));
          break;
        case "--help":
        case "-h":
          this.showUsage();
          break;
        case "help":
          this.showHelp(restArgs);
          break;
        default:
          this.terminal.writeln('Invalid command. Use "config" or "send".');
          this.showUsage();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.terminal.writeln(`Error: ${error.message}`);
        this.terminal.writeln("For more information, use --help");
      } else {
        this.terminal.writeln(String(error));
      }
    }
  }

  private parseConfigCommand(args: string[]): TxConfigCmd {
    if (args.length === 0 || args[0] === "--show") {
      return { action: "show" };
    }

    if (args[0] === "--set" && args.length === 3) {
      const [, property, value] = args;
      if (["wpm", "eff", "freq", "volume"].includes(property)) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
          throw new Error(
            `Invalid value for ${property}: ${value}. Must be a number.`
          );
        }
        return {
          action: "set",
          property: property as TxConfigCmd["property"],
          value: numValue,
        };
      }
    }

    throw new Error("Invalid config command");
  }

  private parseSendCommand(args: string[]): TxSendCmd {
    const cmd: TxSendCmd = { message: "" };
    let i = 0;

    function parseNumericArg(argName: string): number {
      const value = parseInt(args[++i], 10);
      if (isNaN(value)) {
        throw new Error(
          `Invalid value for ${argName}: ${args[i]}. Must be a number.`
        );
      }
      return value;
    }

    while (i < args.length) {
      switch (args[i]) {
        case "--eff":
          cmd.eff = parseNumericArg("eff");
          break;
        case "--wpm":
          cmd.wpm = parseNumericArg("wpm");
          break;
        case "--freq":
          cmd.freq = parseNumericArg("freq");
          break;
        case "--volume":
          cmd.volume = parseNumericArg("volume");
          break;
        default:
          if (args[i].startsWith("--") || args[i].startsWith("-")) {
            throw new Error(`Unknown option: ${args[i]}`);
          }
          // Assume the rest is the message
          cmd.message = args.slice(i).join(" ");
          return cmd;
      }
      i++;
    }

    if (!cmd.message) {
      throw new Error("Invalid send command: message is required");
    }

    return cmd;
  }

  private execConfigCmd(cmd: TxConfigCmd): void {
    if (cmd.action === "show") {
      this.showConfig();
    } else if (cmd.property && cmd.value !== undefined) {
      this.setConfig(cmd.property, cmd.value);
    }
  }

  private showConfig() {
    this.terminal.writeln();
    this.terminal.writeln(theme.info("tx configuration:"));
    this.terminal.writeln();

    for (const key of txConfigKeys) {
      this.terminal.write(key);
      this.terminal.write("\t");
      this.terminal.writeln(theme.info(String(this.tx[key])));
    }

    this.terminal.writeln();
  }

  private setConfig(property: TxConfigProperty, value: number): void {
    if (property in this.tx) {
      this.tx[property] = value;
      this.terminal.write(`\n ${property} set to ${theme.info(value)} \n\n`);
    }
  }

  private async execSendCmd(cmd: TxSendCmd): Promise<void> {
    return new Promise<void>((resolve) => {
      const onTxStop = () => {
        this.tx.removeStopEventListener(onTxStop);
        resolve();
      };

      this.tx.addStopEventListener(onTxStop);
      this.tx.send(cmd.message, cmd.wpm, cmd.eff, cmd.freq, cmd.volume);
    });
  }

  private showHelp(args: string[]): void {
    if (args.length == 0) {
      this.showUsage();
    } else {
      switch (args[0]) {
        case "send":
          this.showTxUsage();
          break;
        case "config":
          this.showConfigUsage();
          break;
        default:
          throw new Error("unknown command");
      }
    }
  }

  private showUsage(): void {
    this.terminal.writeln(
      theme.info(`
Usage: tx [-h | --help] <command>

The tx command  allows you to transmit arbitrary text in Morse code. You can 
configure various transmission parameters such as speed, effective speed, 
and tone frequency to customize the transmission experience. This command 
supports different subcommands for configuring settings, sending messages, 
and displaying help.

These are the available tx commands:

  config:
    Configure transmission parameters, such as words per minute (WPM), 
    effective speed (EFF), and tone frequency. You can view or modify 
    configuration values to customize the transmission settings.

  send:
    Transmit an arbitrary piece of text as Morse code. You can customize 
    the speed, tone, and other parameters when sending the message.

  help:
    Show detailed help for the tx command or any of its subcommands.

For more information on specific commands, use:

  tx help <subcommand>
`)
    );
  }
  private showConfigUsage(): void {
    this.terminal.writeln(
      theme.info(`
Usage: tx config [ --show ] [ --set <property> <value> ]

Description:
  The \`config\` subcommand allows you to view and modify the transmission 
  parameters for the \`tx\` command. You can configure the speed, effective 
  speed, tone frequency, and volume for Morse code transmission. You can 
  either view the current configuration values or set new ones.

Options:

  --show
    Display the current configuration values for the TX method, including 
    speed, effective speed, tone frequency, and volume.

  --set <property> <value>
    Set a specific configuration value. You can adjust the following properties:
    
      wpm:
        Set the character speed in words per minute.

      eff:
        Set the effective speed in words per minute.

      freq:
        Set the tone frequency in Hertz for the Morse code transmission.

      volume:
        Set the transmission volume (from 0 to 100).

`)
    );
  }
  private showTxUsage(): void {
    this.terminal.writeln(
      theme.info(`
Usage: tx send [options] <message>

Description:
  The \`send\` subcommand allows you to transmit an arbitrary message in Morse 
  code. You can customize various transmission parameters such as character 
  speed, effective speed, tone frequency, and volume for the message you are 
  sending. The message is transmitted based on the configuration values or 
  any specified options for this particular transmission.

Options:

  --wpm <int>
    Set the character speed (words per minute) for this message. Overrides 
    the default configuration value for WPM.

  --eff <int>
    Set the effective speed (words per minute) for this message. Overrides 
    the default configuration value for effective speed.

  --freq <int>
    Set the tone frequency (in Hertz) for this message. Overrides the default 
    configuration value for frequency.

  --volume <int>
    Set the volume (0 to 100) for this message. Overrides the default 
    configuration value for volume.

`)
    );
  }
}
