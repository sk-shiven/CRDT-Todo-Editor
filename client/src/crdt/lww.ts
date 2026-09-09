import { LWWRegister, LamportClock, compareClocks } from './types';

// Creates a new LWW Register initialized with a value and clock.
export function createLWWRegister<T>(value: T, clock: LamportClock): LWWRegister<T> {
  return { value, clock };
}

// Merges an incoming value and clock into an existing LWW Register.
export function updateLWWRegister<T>(
  register: LWWRegister<T>,
  newValue: T,
  newClock: LamportClock
): boolean {
  if (compareClocks(newClock, register.clock) > 0) {
    register.value = newValue;
    register.clock = newClock;
    return true;
  }
  return false;
}
