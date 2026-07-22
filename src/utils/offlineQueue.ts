const QUEUE_KEY = "daara_offline_queue";

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: any;
  timestamp: number;
}

export function enqueueRequest(url: string, method: string, body: any) {
  const queueStr = localStorage.getItem(QUEUE_KEY);
  const queue: QueuedRequest[] = queueStr ? JSON.parse(queueStr) : [];
  
  queue.push({
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    url,
    method,
    body,
    timestamp: Date.now(),
  });
  
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  // Dispatch custom event to notify UI
  window.dispatchEvent(new CustomEvent('daara_queue_updated'));
}

export async function processQueue() {
  if (!navigator.onLine) return;
  
  const queueStr = localStorage.getItem(QUEUE_KEY);
  if (!queueStr) return;
  
  let queue: QueuedRequest[] = JSON.parse(queueStr);
  if (queue.length === 0) return;
  
  let networkDown = false;
  
  for (let i = 0; i < queue.length; i++) {
    const req = queue[i];
    try {
      const res = await fetch(req.url, {
        method: req.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      
      if (!res.ok && res.status >= 500) {
        // Keep in queue for 500 errors
        continue;
      }
      
      // Success or 4xx -> remove from queue (mark for removal by nullifying)
      (queue[i] as any) = null;
      
    } catch (err) {
      console.error(`Network error during sync of ${req.url}`, err);
      networkDown = true;
      break;
    }
  }
  
  // Filter out nulls
  queue = queue.filter(req => req !== null);
  
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent('daara_queue_updated'));
  
  if (queue.length === 0 && !networkDown) {
    // Trigger a re-fetch of global state to ensure perfect sync
    window.dispatchEvent(new CustomEvent('daara_sync_complete'));
  }
}

export function getQueueCount(): number {
  const queueStr = localStorage.getItem(QUEUE_KEY);
  if (!queueStr) return 0;
  const queue: QueuedRequest[] = JSON.parse(queueStr);
  return queue.length;
}
