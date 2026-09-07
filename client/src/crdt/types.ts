/**
 * Lamport Clock tuple for deterministic ordering & LWW tie-breaking:
 * (counter, replicaId)
 */
export interface LamportClock {
  counter: number;
  replicaId: string;
}

export function compareClocks(a: LamportClock, b: LamportClock): number {
  try {
    if (a.counter !== b.counter) {
      return a.counter - b.counter;
    }
    return a.replicaId.localeCompare(b.replicaId);
  }
  catch (error) {
    throw new Error(`Not implemented ${error}`);
  }
}

/**
 * Last-Writer-Wins Register wrapper for a single field value.
 */
export interface LWWRegister<T> {
  value: T;
  clock: LamportClock;
}

/**
 * Stable Item Identifier: (replicaId, seq)
 */
export interface ItemId {
  replicaId: string;
  seq: number;
}

export function itemIdToString(id: ItemId): string {
  try {
    return `${id.replicaId}:${id.seq}`;
  }
  catch (error) {
    throw new Error(`Error upon conversion to String ${error}`);
  }
}

export function parseItemId(str: string): ItemId {
  try {
    const result = str.split(':');
    if (result.length < 2) {
      throw new Error('Invalid string format for ItemId, length should be greater than 2');
    }
    const replicaId = result[0];
    const seq = parseInt(result[1], 10);
    return { replicaId, seq };
  }
  catch (error) {
    throw new Error(`Error upon parsing string to ItemId ${error}`);
  }

}

/**
 * RGA Linked-List Node in materialized memory.
 */
export interface RGANode {
  id: string;
  originId: string | null;
  text: LWWRegister<string>;
  done: LWWRegister<boolean>;
  deleted: LWWRegister<boolean>;
  creationClock: LamportClock;
}

/**
 * CRDT Operation Types & Interfaces
 */
export type OpType = 'INSERT_ITEM' | 'SET_TEXT' | 'SET_DONE' | 'SET_DELETED';

export interface BaseOp {
  opId: string;
  replicaId: string;
  clock: LamportClock;
  itemId: string;
}

export interface InsertItemOp extends BaseOp {
  type: 'INSERT_ITEM';
  originId: string | null;
  initialText: string;
}

export interface SetTextOp extends BaseOp {
  type: 'SET_TEXT';
  text: string;
}

export interface SetDoneOp extends BaseOp {
  type: 'SET_DONE';
  done: boolean;
}

export interface SetDeletedOp extends BaseOp {
  type: 'SET_DELETED';
  deleted: boolean;
}

export type CRDTOp = InsertItemOp | SetTextOp | SetDoneOp | SetDeletedOp;

/**
 * Materialized View of a Todo Item for rendering UI
 */
export interface MaterializedTodo {
  id: string;
  originId: string | null;
  text: string;
  done: boolean;
  deleted: boolean;
  textClock: LamportClock;
  doneClock: LamportClock;
  deletedClock: LamportClock;
}
