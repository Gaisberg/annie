import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import useWebSocket from 'react-use-websocket';

interface EventUpdate {
  scraping: number[];
  downloader: number[];
  symlinker: number[];
  updater: number[];
  postprocessing: number[];
}

export const useWebSocketHook = () => {
  const wsUrl = useStore((state) => state.wsUrl);
  const [eventUpdate, setEventUpdate] = useState<EventUpdate | null>(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl, {
    shouldReconnect: (closeEvent) => true,
    onMessage: (event) => handleMessage(event),
  });

  const isConnected = readyState === WebSocket.OPEN;
  const error = readyState === WebSocket.CLOSED ? 'WebSocket error' : null;

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'event_update':
          console.log(data)
          setEventUpdate(data.message);
          break;
        default:
          // console.log('Unhandled message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  useEffect(() => {
    if (!wsUrl) {
      console.error('WebSocket URL is not set');
    }
  }, [wsUrl]);

  const connect = useCallback(() => {
    if (!wsUrl) {
      console.error('WebSocket URL is not set');
      return;
    }
    // The connection is managed by the useWebSocket hook
  }, [wsUrl]);

  const getCurrentItemStage = useCallback((itemId: number) => {
    if (!eventUpdate) return null;
    const stages = ["scraping", "downloader", "symlinker", "updater", "postprocessing"] as const;
  
    for (const stage of stages) {
      if (eventUpdate[stage].includes(itemId)) {
        return stage;
      }
    }
  
    return null;
  }, [eventUpdate]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'event_update') {
          setEventUpdate(data.message);
        }
      } catch (error) {
        console.error('Error parsing last message:', error);
      }
    }
  }, [lastMessage]);

  return {
    isConnected,
    error,
    connect,
    sendMessage,
    eventUpdate,
    getCurrentItemStage
  };
};