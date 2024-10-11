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

export class ConfStorage {
  private localStorage: Storage;

  constructor() {
    this.localStorage = window.localStorage;
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  set(key: string, obj: any) {
    const str = JSON.stringify(obj);
    this.localStorage.setItem(key, str);
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  get(key: string): any {
    const str = this.localStorage.getItem(key);
    if (str) {
      return JSON.parse(str);
    }
    return null;
  }
}
