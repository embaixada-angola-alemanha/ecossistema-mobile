import { SyncQueue, SyncOperation } from './sync-queue';
import { OfflineCache } from './offline-cache';
import { VistoService } from './visto';
import { AgendamentoService } from './agendamento';
import { sgcApi } from './api';
import { VistoCreateRequest } from '@types/visto';
import { AgendamentoCreateRequest } from '@types/agendamento';

/**
 * Process a single sync operation by routing it to the appropriate service.
 */
async function processSyncOperation(op: SyncOperation): Promise<void> {
  switch (op.type) {
    case 'CREATE_VISTO': {
      const payload = op.payload as unknown as VistoCreateRequest;
      await VistoService.create(payload);
      break;
    }
    case 'CREATE_AGENDAMENTO': {
      const payload = op.payload as unknown as AgendamentoCreateRequest;
      await AgendamentoService.create(payload);
      break;
    }
    case 'CANCEL_AGENDAMENTO': {
      const { id, motivo } = op.payload as { id: string; motivo: string };
      await AgendamentoService.cancel(id, motivo);
      break;
    }
    case 'UPDATE_PROFILE': {
      await sgcApi.put('/cidadaos/me', op.payload);
      break;
    }
    default:
      console.warn(`Unknown sync operation type: ${op.type}`);
  }
}

/**
 * SyncProcessor manages the lifecycle of offline operations:
 * - Listens for connectivity changes
 * - Processes queued operations when online
 * - Provides status information
 */
export const SyncProcessor = {
  private_unsubscribe: null as (() => void) | null,

  /**
   * Start listening for connectivity changes and auto-process queue.
   */
  start(): void {
    if (SyncProcessor.private_unsubscribe) return;

    SyncProcessor.private_unsubscribe = OfflineCache.onConnectivityChange(async (isOnline) => {
      if (isOnline) {
        const result = await SyncQueue.processAll(processSyncOperation);
        if (result.success > 0) {
          console.log(`Sync: ${result.success} operations synced, ${result.failed} failed`);
        }
      }
    });

    // Also try processing immediately on start
    SyncProcessor.processNow();
  },

  /**
   * Stop listening for connectivity changes.
   */
  stop(): void {
    if (SyncProcessor.private_unsubscribe) {
      SyncProcessor.private_unsubscribe();
      SyncProcessor.private_unsubscribe = null;
    }
  },

  /**
   * Manually trigger sync processing.
   */
  async processNow(): Promise<{ success: number; failed: number }> {
    return SyncQueue.processAll(processSyncOperation);
  },

  /**
   * Get pending operation count for UI badge/indicator.
   */
  async getPendingCount(): Promise<number> {
    return SyncQueue.count();
  },
};
