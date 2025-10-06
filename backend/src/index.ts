// src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

type NameModel = { name: string };
type IncomingMessage = { type: 'register'; name: string } | { type: 'message'; text: string };
type OutgoingMessage =
  | { type: 'system'; text: string }
  | { type: 'message'; name: string; text: string }
  | { type: 'error'; text: string };

type WSWithMeta = WebSocket & { name?: string };

const app = express();
app.use(cors({ origin: '*' }));
app.get('/', (_req, res) => res.send('WebSocket backend running'));

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (wsRaw: WebSocket) => {
  const ws = wsRaw as WSWithMeta;

  ws.once('message', (raw) => {
    try {
      const parsed = JSON.parse(raw.toString()) as IncomingMessage;
      if (parsed?.type === 'register' && typeof parsed.name === 'string' && parsed.name.trim()) {
        ws.name = parsed.name.trim();
        ws.send(JSON.stringify({ type: 'system', text: `Welcome, ${ws.name}!` } as OutgoingMessage));

        const joinMsg = JSON.stringify({ type: 'system', text: `User ${ws.name} joined` } as OutgoingMessage);
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) client.send(joinMsg);
        });
      } else {
        ws.send(JSON.stringify({ type: 'error', text: 'Invalid register message' } as OutgoingMessage));
      }
    } catch {
      ws.send(JSON.stringify({ type: 'error', text: 'Invalid JSON in register message' } as OutgoingMessage));
    }

    ws.on('message', (messageRaw) => {
      let payload: any;
      try {
        payload = JSON.parse(messageRaw.toString()) as IncomingMessage;
      } catch {
        payload = { type: 'message', text: messageRaw.toString() };
      }

      if (payload.type === 'message' && typeof payload.text === 'string') {
        const sender = ws.name || 'Anonymous';
        const broadcast = JSON.stringify({ type: 'message', name: sender, text: payload.text } as OutgoingMessage);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(broadcast);
        });
      }
    });

    ws.on('close', () => {
      if (ws.name) {
        const leftMsg = JSON.stringify({ type: 'system', text: `User ${ws.name} left` } as OutgoingMessage);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(leftMsg);
        });
      }
    });
  });

  ws.send(JSON.stringify({ type: 'system', text: 'Please register: { "type":"register", "name":"YourName" }' } as OutgoingMessage));
});

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, () => {
  console.log(`Server running at ws://${process.env.WS_URI || 'localhost'}:${PORT}`);
});
