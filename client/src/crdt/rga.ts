import { RGANode, InsertItemOp } from './types';

/**
 * Replicated Growable Array (RGA) Linked-List Sequence CRDT
 */
export class RGASequence {
  private nodes: Map<string, RGANode> = new Map();
  private list: RGANode[] = [];

  /**
   * Retrieves an RGANode by item ID.
   */
  public getNode(id: string): RGANode | undefined {
    // TODO: Return node from this.nodes Map
    throw new Error('Not implemented');
  }

  /**
   * Returns all RGANodes in current linear sequence order.
   */
  public getAllNodes(): RGANode[] {
    // TODO: Return array copy of this.list
    throw new Error('Not implemented');
  }

  /**
   * Applies an INSERT_ITEM operation into the RGA sequence.
   * @returns true if applied, false if duplicate/idempotent.
   */
  public applyInsert(op: InsertItemOp): boolean {
    // TODO: Implement RGA insert:
    // 1. Check idempotency: if op.itemId already exists in this.nodes, return false
    // 2. Construct new RGANode initializing text, done, deleted LWW registers with op.clock
    // 3. Store node in this.nodes map
    // 4. Call this.insertIntoSequence(newNode) to place node in linear sequence order
    // 5. Return true
    throw new Error('Not implemented');
  }

  /**
   * Inserts an RGANode into the linear list following RGA ordering rules.
   */
  private insertIntoSequence(newNode: RGANode): void {
    // TODO: Implement RGA insertion & tie-breaking algorithm:
    // 1. Locate index of newNode.originId in this.list (if originId is null, insert at head index 0)
    // 2. Skip over any existing concurrent children of originId that have higher creation clock (using compareClocks)
    // 3. Insert newNode into this.list at the determined index
    throw new Error('Not implemented');
  }
}
