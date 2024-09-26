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

import { Chalk, ChalkInstance } from "chalk";

export const colors = new Chalk({ level: 1 });

interface Theme {
  readonly error: ChalkInstance;
  readonly info: ChalkInstance;
  readonly statusBar: ChalkInstance;
  readonly passed: ChalkInstance;
  readonly pending: ChalkInstance;
  readonly errorChar: ChalkInstance;
}

const defaultTheme: Theme = {
  error: colors.redBright,
  info: colors.yellowBright,
  statusBar: colors.bgBlueBright,
  passed: colors.green,
  pending: colors.redBright,
  errorChar:colors.redBright,
};

export const theme = defaultTheme;
