import { describe, it, expect } from 'vitest';
import { createLWWRegister, updateLWWRegister } from '../src/crdt/lww';

describe('LWW Register Operations', () => {
  it('should initialize an LWW register correctly', () => {
    const clock = { counter: 1, replicaId: 'client-a' };
    const reg = createLWWRegister('Buy groceries', clock);

    expect(reg.value).toBe('Buy groceries');
    expect(reg.clock).toEqual({ counter: 1, replicaId: 'client-a' });
  });

  it('should update register when incoming clock has a higher counter', () => {
    const reg = createLWWRegister('Initial task', { counter: 1, replicaId: 'client-a' });
    const applied = updateLWWRegister(reg, 'Updated task', { counter: 2, replicaId: 'client-a' });

    expect(applied).toBe(true);
    expect(reg.value).toBe('Updated task');
    expect(reg.clock).toEqual({ counter: 2, replicaId: 'client-a' });
  });

  it('should reject update when incoming clock has a lower counter', () => {
    const reg = createLWWRegister('Newest task', { counter: 5, replicaId: 'client-a' });
    const applied = updateLWWRegister(reg, 'Old task', { counter: 3, replicaId: 'client-b' });

    expect(applied).toBe(false);
    expect(reg.value).toBe('Newest task');
    expect(reg.clock).toEqual({ counter: 5, replicaId: 'client-a' });
  });

  it('should deterministically tie-break using replicaId when counters are equal', () => {
    // client-b > client-a lexicographically
    const regA = createLWWRegister('Task A', { counter: 3, replicaId: 'client-a' });
    const appliedB = updateLWWRegister(regA, 'Task B', { counter: 3, replicaId: 'client-b' });

    expect(appliedB).toBe(true);
    expect(regA.value).toBe('Task B');
    expect(regA.clock).toEqual({ counter: 3, replicaId: 'client-b' });

    // Reverse: incoming clock with smaller replicaId should NOT overwrite
    const regB = createLWWRegister('Task B', { counter: 3, replicaId: 'client-b' });
    const appliedA = updateLWWRegister(regB, 'Task A', { counter: 3, replicaId: 'client-a' });

    expect(appliedA).toBe(false);
    expect(regB.value).toBe('Task B');
    expect(regB.clock).toEqual({ counter: 3, replicaId: 'client-b' });
  });

  it('should return false for duplicate/idempotent update with identical clock', () => {
    const clock = { counter: 2, replicaId: 'client-a' };
    const reg = createLWWRegister('Task', clock);
    const applied = updateLWWRegister(reg, 'Task duplicate', { counter: 2, replicaId: 'client-a' });

    expect(applied).toBe(false);
    expect(reg.value).toBe('Task');
  });

  it('should work with boolean values (e.g., done or deleted flags)', () => {
    const reg = createLWWRegister(false, { counter: 1, replicaId: 'client-a' });
    const applied = updateLWWRegister(reg, true, { counter: 2, replicaId: 'client-b' });

    expect(applied).toBe(true);
    expect(reg.value).toBe(true);
  });
});
