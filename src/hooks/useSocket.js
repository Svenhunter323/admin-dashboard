import { useEffect, useRef } from 'react';
import { getSocket } from '../socket';

export const useSocket = (eventName, handler) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const eventListener = (...args) => savedHandler.current(...args);
    
    socket.on(eventName, eventListener);

    return () => {
      socket.off(eventName, eventListener);
    };
  }, [eventName]);
};