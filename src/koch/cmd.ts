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

import { ConfStorage } from "../config";
import { Terminal } from "../Terminal";
import { theme } from "../theme";
import { Tx } from "../tx";
import { Koch } from "./koch";

interface KochHelpCmd {
  subcommand?: string;
}

interface KochConfigCmd {
  show?: boolean;
  set?: { key: string; value: string };
}

interface KochListenCmd {
  wpm?: number;
  eff?: number;
  volume?: number;
  freq?: number;
}

interface KochPracticeCmd {
  mainChar?: string;
  secondaryChars?: string;
  groupsCount?: number;
  wpm?: number;
  eff?: number;
  volume?: number;
  freq?: number;
}

interface KochLessonCmd {
  list?: boolean;
  show?: number;
  lesson?: number;
}

export class KochCommand {
  private terminal: Terminal;
  private tx: Tx;
  private koch: Koch;

  constructor(terminal: Terminal, tx: Tx, storage: ConfStorage) {
    this.terminal = terminal;
    this.tx = tx;
    this.koch = new Koch(terminal, tx, storage);
  }

  public async exec(argv: string[]) {
    try {
      await this.parseKochCommand(argv);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.terminal.writeln(`Error: ${error.message}`);
      } else {
        this.terminal.writeln(String(error));
      }
    }
  }

  private async parseKochCommand(argv: string[]) {
    if (argv.length == 1) {
      this.printUsage();
      return;
    }

    if (argv[1] === "-h" || argv[1] === "--help") {
      this.execHelpCommand(this.parseHelpCommand(argv.slice(2)));
      return;
    }

    const [command, ...restArgs] = argv.slice(1);

    switch (command) {
      case "help":
        this.execHelpCommand(this.parseHelpCommand(restArgs));
        break;
      case "config":
        this.execConfigCommand(this.parseConfigCommand(restArgs));
        break;
      case "listen":
        await this.execListenCommand(this.parseListenCommand(restArgs));
        break;
      case "practice":
        await this.execPracticeCommand(this.parsePracticeCommand(restArgs));
        break;
      case "lesson":
        this.execLessonCommand(this.parseLessonCommand(restArgs));
        break;
      default:
        throw new Error(
          theme.error(` '${command}' is not a koch command. See 'koch --help'.`)
        );
    }
  }

  private parseHelpCommand(args: string[]): KochHelpCmd {
    const [subcommand] = args;
    return subcommand ? { subcommand } : {};
  }

  private parseConfigCommand(args: string[]): KochConfigCmd {
    const configCmd: KochConfigCmd = {};
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      switch (arg) {
        case "--show":
          configCmd.show = true;
          break;
        case "--set":
          if (args.length >= i + 3) {
            configCmd.set = { key: args[i + 1], value: args[i + 2] };
            i += 2;
          } else {
            throw new Error(
              `Invalid config command format. See 'koch help config' for details`
            );
          }
          break;
        default:
          throw new Error(
            `Unknown config option: ${arg}. See 'koch help config' for details`
          );
      }
      i++;
    }
    return configCmd;
  }

  private parseListenCommand(args: string[]): KochListenCmd {
    const listenCmd: KochListenCmd = {};
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      switch (arg) {
        case "--wpm":
          listenCmd.wpm = parseInt(args[++i], 10);
          break;
        case "--eff":
          listenCmd.eff = parseInt(args[++i], 10);
          break;
        case "--volume":
          listenCmd.volume = parseInt(args[++i], 10);
          break;
        case "--freq":
          listenCmd.freq = parseInt(args[++i], 10);
          break;
        default:
          throw new Error(
            `Unknown listen option: ${arg}. See 'koch help listen' for details`
          );
      }
      i++;
    }

    return listenCmd;
  }

  private parsePracticeCommand(args: string[]): KochPracticeCmd {
    const practiceCmd: KochPracticeCmd = {};
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      switch (arg) {
        case "--main-char":
          practiceCmd.mainChar = args[++i];
          break;
        case "--secondary-chars":
          practiceCmd.secondaryChars = args[++i];
          break;
        case "--groups-count":
          practiceCmd.groupsCount = parseInt(args[++i], 10);
          break;
        case "--wpm":
          practiceCmd.wpm = parseInt(args[++i], 10);
          break;
        case "--eff":
          practiceCmd.eff = parseInt(args[++i], 10);
          break;
        case "--volume":
          practiceCmd.volume = parseInt(args[++i], 10);
          break;
        case "--freq":
          practiceCmd.freq = parseInt(args[++i], 10);
          break;
        default:
          throw new Error(
            `Unknown practice option: ${arg}. See 'koch help practice' for details`
          );
      }
      i++;
    }

    return practiceCmd;
  }

  private parseLessonCommand(args: string[]): KochLessonCmd {
    const lessonCmd: KochLessonCmd = {};
    console.log(args);
    if (args.length == 0) {
      lessonCmd.show = 0;
      return lessonCmd;
    }

    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      switch (arg) {
        case "--list":
          lessonCmd.list = true;
          return lessonCmd;
        case "--show":
          lessonCmd.show = parseInt(args[++i], 10);
          return lessonCmd;
        default:
          lessonCmd.lesson = parseInt(arg, 10);
          if (isNaN(lessonCmd.lesson)) {
            throw new Error("invalid lesson number");
          }
          break;
      }
      i++;
    }

    return lessonCmd;
  }

  private execHelpCommand(cmd: KochHelpCmd) {
    if (!cmd.subcommand) {
      this.printUsage();
      return;
    }

    switch (cmd.subcommand) {
      case "config":
        this.printConfigUsage();
        break;
      case "lesson":
        this.printLessonUsage();
        break;
      case "listen":
        this.printListenUsage();
        break;
      case "practice":
        this.printPracticeUsage();
        break;
      default:
        throw new Error(
          theme.error(
            ` '${cmd.subcommand}' is not a koch command. See 'koch --help'.`
          )
        );
        break;
    }
  }

  private execConfigCommand(cmd: KochConfigCmd) {
    if (cmd.show) {
      this.koch.showConfig();
    } else if (cmd.set) {
      this.koch.setCofig(cmd.set.key, cmd.set.value);
    } else {
      throw new Error("Unknown config command.");
    }
  }

  private async execListenCommand(cmd: KochListenCmd) {
    await this.koch.listen({ ...cmd });
  }

  private async execPracticeCommand(cmd: KochPracticeCmd) {
    if (!cmd.mainChar && !cmd.secondaryChars) {
      await this.koch.practice({ ...cmd });
      return;
    }

    // Both mainChar and secondaryChars must be specified for custom groups
    if (!cmd.mainChar || !cmd.secondaryChars) {
      throw new Error(
        "main char and secondary char should be specified when working with custom groups"
      );
    }

    // Call the practice method with custom characters
    await this.koch.practiceCustomChars(
      cmd.mainChar,
      cmd.secondaryChars.toUpperCase().split(""),
      { ...cmd },
      cmd.groupsCount
    );
  }

  private execLessonCommand(cmd: KochLessonCmd) {
    if (cmd.list) {
      this.koch.listLessons();
    } else if (cmd.show != undefined) {
      this.koch.showLesson(cmd.show);
      return;
    } else if (cmd.lesson !== undefined) {
      this.koch.setLesson(cmd.lesson);
    } else {
      console.log("Unknown lesson command.");
    }
  }

  private printUsage() {
    this.terminal.writeln(
      theme.info(`
Usage: koch [-h | --help] <command>

The Koch method is an efficient way to learn Morse code by focusing on
character recognition at full speed. It begins with just two characters
and adds more as you become proficient. This method helps learners build
speed and accuracy over time, progressing through characters while
maintaining a solid understanding of previously learned ones.

These are the available koch commands:

  config:
    Configure basic parameters for the Koch method, such as the default
    number of character groups used in practice sessions. You can also view
    or set specific configuration values.

  lesson:
    Manage lessons within the Koch method. You can set the current lesson,
    view the list of available lessons, or check the status of passed and
    pending lessons.

  listen:
    Play the character currently being taught in the selected lesson. This
    command allows you to focus on recognizing individual characters by
    listening to them at different speeds and frequencies.

  practice:
    Practice the current lesson by transmitting groups of characters. This
    command allows for focused training on specific characters or groups of
    characters at different speeds and group sizes.

For more information on specific commands, use:

  koch help <command>
      `)
    );
  }
  private printLessonUsage() {
    this.terminal.writeln(
      theme.info(`
Usage: koch lesson [ --list ] [ --show <n> ] [n]

Description:
  Manage the lessons available in the Koch method. You can set the current
  lesson, display a specific lesson, or list all available lessons and their
  completion status (passed or pending).

Options:

  --list
    List all available lessons and their completion status (passed/pending).

  --show <n>
    Show details for a specific lesson <n>, including the main and secondary
    characters of that lesson.

  [n]
    Set the current lesson to lesson number <n>.

        `)
    );
  }
  private printListenUsage() {
    this.terminal.writeln(
      theme.info(`
Usage: koch listen [ --wpm <n> ] [ --eff <n> ] [ --volume <n> ] [ --freq <n> ]

Description:
  Listen to the principal character being taught in the current lesson.
  This allows you to hear the character at various speeds, volumes, and
  frequencies to aid in recognition during the learning process.

Options:

  --wpm <n>
    Sets the character speed to <n> words per minute for the current play.

  --eff <n>
    Sets the effective speed to <n> words per minute for the current play.

  --volume <n>
    Sets the volume to <n> (0 to 100) for the current play.

  --freq <n>
    Set the tone frequency to <n> Hertz.
      
      `)
    );
  }
  private printPracticeUsage() {
    this.terminal.writeln(
      theme.info(`
Usage: koch practice [ --main-char <char> --secondary-chars <chars> --groups-count <n> ] 
                     [ --wpm <n> ] [ --eff <n> ] [ --volume <n> ] [ --freq <n> ]

Description:
  Practice the current lesson by transmitting groups of characters. You can
  also focus on specific characters outside the current lesson to improve
  recognition, while customizing practice speeds and settings.

Options:

  --main-char <char>
    Practice groups that focus on the specified main character outside the
    current lesson.

  --secondary-chars <chars>
    Practice groups that focus on the specified secondary characters
    outside the current lesson.

  --groups-count <n>
    Practice using <n> groups of characters during the session.

  --wpm <n>
    Sets the character speed to <n> words per minute for the current play.

  --eff <n>
    Sets the effective speed to <n> words per minute for the current play.

  --volume <n>
    Sets the volume to <n> (0 to 100) for the current play.

  --freq <n>
    Set the tone frequency to <n> Hertz.

        `)
    );
  }
  private printConfigUsage() {
    this.terminal.writeln(
      theme.info(`
Usage: koch config [ --show ] [ --set <key> <value> ]

Description:
  Configure basic Koch parameters such as the number of character groups
  used during practice sessions. You can view the current configuration
  values or set specific parameters.

Options:

  --show
    Show all the current configuration values for the Koch method.

  --set <key> <value>
    Set a specific configuration value. Possible keys are:

      group-count:
        Configure the number of character groups to be transmitted during
        practice sessions.
 
      `)
    );
  }
}
