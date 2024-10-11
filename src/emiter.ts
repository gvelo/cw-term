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

export type EventListener<T> = (event: T) => void;

export class EventEmitter<T> {
  private listeners: EventListener<T>[] = [];

  /**
   * Register a listener for the event.
   * @param listener - The event listener function to be registered.
   */
  public addListener(listener: EventListener<T>): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a specific listener for the event.
   * @param listener - The event listener function to be removed.
   */
  public removeListener(listener: EventListener<T>): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Emit the event to all registered listeners.
   * @param event - The event data to be emitted.
   */
  public emit(event: T): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
