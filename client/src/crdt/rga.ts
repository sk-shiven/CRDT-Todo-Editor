import { RGANode, InsertItemOp, compareClocks } from './types';
import { createLWWRegister } from './lww';

/**
 * Replicated Growable Array (RGA) Linked-List Sequence CRDT
 */
export class RGASequence {
  private nodes: Map<string, RGANode> = new Map();
  private list: RGANode[] = [];

  // Retrieves an RGANode by item ID.
  public getNode(id: string): RGANode | undefined {
    return this.nodes.get(id);
  }

  // Returns all RGANodes in current linear sequence order.
  public getAllNodes(): RGANode[] {
    return this.list;
  }

  // Applies an INSERT_ITEM operation into the RGA sequence.
  // Returns true if applied, false if duplicate/idempotent.
  public applyInsert(op: InsertItemOp): boolean {
    if (this.nodes.has(op.itemId)) {
      return false;
    }

    const newNode: RGANode = {
      id: op.itemId,
      originId: op.originId,
      text: createLWWRegister(op.initialText, op.clock),
      done: createLWWRegister(false, op.clock),
      deleted: createLWWRegister(false, op.clock),
      creationClock: op.clock,
    };

    this.nodes.set(op.itemId, newNode);
    this.insertIntoSequence(newNode);
    return true;
  }

  // Inserts an RGANode into the linear list following RGA ordering rules.
  private insertIntoSequence(newNode: RGANode): void {
    let targetIndex = 0;
    if (newNode.originId !== null) {
      const originIndex = this.list.findIndex((node) => node.id === newNode.originId);
      if (originIndex !== -1) {
        targetIndex = originIndex + 1;
      }
    }
    while (
      targetIndex < this.list.length &&
      this.list[targetIndex].originId === newNode.originId &&
      compareClocks(this.list[targetIndex].creationClock, newNode.creationClock) > 0
    ) {
      targetIndex++;
    }
    this.list.splice(targetIndex, 0, newNode);
  }
}
