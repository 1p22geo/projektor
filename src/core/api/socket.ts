const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

class WebSocketManager {
  private sockets: Map<string, WebSocket> = new Map();
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();

  connect(teamId: string): void {
    if (this.sockets.has(teamId)) {
      return;
    }

    const ws = new WebSocket(`${WS_URL}/ws/teams/${teamId}`);

    ws.onopen = () => {
      console.log(`Connected to team ${teamId} WebSocket`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.messageHandlers.get(teamId);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for team ${teamId}:`, error);
    };

    ws.onclose = () => {
      console.log(`Disconnected from team ${teamId} WebSocket`);
      this.sockets.delete(teamId);
    };

    this.sockets.set(teamId, ws);
  }

  disconnect(teamId: string): void {
    const ws = this.sockets.get(teamId);
    if (ws) {
      ws.close();
      this.sockets.delete(teamId);
      this.messageHandlers.delete(teamId);
    }
  }

  send(teamId: string, data: any): void {
    const ws = this.sockets.get(teamId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.error(`WebSocket for team ${teamId} is not connected`);
    }
  }

  onMessage(teamId: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(teamId)) {
      this.messageHandlers.set(teamId, new Set());
    }
    const handlers = this.messageHandlers.get(teamId)!;
    handlers.add(handler);

    // Return cleanup function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(teamId);
      }
    };
  }
}

const wsManager = new WebSocketManager();

export const getWebSocketManager = () => wsManager;