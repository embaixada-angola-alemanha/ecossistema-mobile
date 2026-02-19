import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineCache } from './offline-cache';

const QUEUE_KEY = '@sync_queue';

export type SyncOperationType = 'CREATE_VISTO' | 'UPDATE_PROFILE' | 'CREATE_AGENDAMENTO' | 'CANCEL_AGENDAMENTO';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

export const SyncQueue = {
  /**
   * Add an operation to the sync queue (for offline submission).
   */
  async enqueue(type: SyncOperationType, payload: Record<string, unknown>): Promise<SyncOperation> {
    const operations = await SyncQueue.getAll();
    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
    };
    operations.push(operation);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(operations));
    return operation;
  },

  /**
   * Get all pending operations.
   */
  async getAll(): Promise<SyncOperation[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Get count of pending operations.
   */
  async count(): Promise<number> {
    const ops = await SyncQueue.getAll();
    return ops.length;
  },

  /**
   * Remove a completed operation.
   */
  async dequeue(id: string): Promise<void> {
    const operations = await SyncQueue.getAll();
    const filtered = operations.filter(op => op.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  },

  /**
   * Update an operation (e.g., increment retry count).
   */
  async update(id: string, updates: Partial<SyncOperation>): Promise<void> {
    const operations = await SyncQueue.getAll();
    const idx = operations.findIndex(op => op.id === id);
    if (idx >= 0) {
      operations[idx] = { ...operations[idx], ...updates };
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(operations));
    }
  },

  /**
   * Process all pending operations. Call this when connectivity is restored.
   * Returns the number of successfully processed operations.
   */
  async processAll(
    handler: (op: SyncOperation) => Promise<void>
  ): Promise<{ success: number; failed: number }> {
    const isOnline = await OfflineCache.isOnline();
    if (!isOnline) return { success: 0, failed: 0 };

    const operations = await SyncQueue.getAll();
    let success = 0;
    let failed = 0;

    for (const op of operations) {
      try {
        await handler(op);
        await SyncQueue.dequeue(op.id);
        success++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await SyncQueue.update(op.id, {
          retryCount: op.retryCount + 1,
          lastError: errorMessage,
        });

        // Remove operations that have failed too many times
        if (op.retryCount >= 4) {
          await SyncQueue.dequeue(op.id);
        }
      }
    }

    return { success, failed };
  },

  /**
   * Clear the entire queue.
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
