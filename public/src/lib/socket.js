let socket = null;

export function initSocket() {
  if (!socket) {
    socket = io();
  }
  return socket;
}

export function getSocket() {
  return socket;
}