const clients = new Map();

function addClient(userId, ws) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(ws);
  console.log("hii");
}

function removeClient(userId, ws) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(ws);
  console.log("client disconnected");
  if (set.size === 0) clients.delete(userId);
}

function sendToUser(userId, data) {
  const set = clients.get(userId);
  if (!set) return false; //offline
  const payload = JSON.stringify(data);
  set.forEach((ws) => ws.readyState === ws.OPEN && ws.send(payload));
  return true;
}

module.exports = { addClient, removeClient, sendToUser };
