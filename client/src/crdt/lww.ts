import { LWWRegister, LamportClock } from './types';

/**
 * Creates a new LWW Register initialized with a value and clock.
 */
export function createLWWRegister<T>(value: T, clock: LamportClock): LWWRegister<T> {
  // TODO: Return an object containing { value, clock }
  throw new Error('Not implemented');
}

/**
 * Merges an incoming value and clock into an existing LWW Register.
 * @returns true if the register was updated, false otherwise.
 */
export function updateLWWRegister<T>(
  register: LWWRegister<T>,
  newValue: T,
  newClock: LamportClock
): boolean {
  // TODO: Implement Last-Writer-Wins merge logic:
  // 1. Compare newClock with register.clock using compareClocks
  // 2. If newClock > register.clock:
  //    - Update register.value = newValue
  //    - Update register.clock = newClock
  //    - Return true
  // 3. Otherwise return false
  throw new Error('Not implemented');
}
