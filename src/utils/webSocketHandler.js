const createWebSocket = (url, onOpen, onMessage, onError, onClose) => {
  let socket;

  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      if (onOpen) onOpen();
    };

    socket.onmessage = (event) => {
      if (onMessage) onMessage(event);
    };

    socket.onerror = (error) => {
      let message = 'WebSocket error';
      if (error.currentTarget.readyState === 3) {
        message = 'Connection refused. Is the server running?';
      }
      if (onError) onError(message);
    };

    socket.onclose = (event) => {
      if (onClose) onClose(event);
    };
  };

  connect();

  const closeWebSocket = () => {
    if (socket) socket.close();
  };

  return { closeWebSocket };
};

export default createWebSocket;