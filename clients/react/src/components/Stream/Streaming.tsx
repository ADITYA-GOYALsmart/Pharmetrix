import React, { useState, useEffect, useRef } from 'react';
const Streaming: React.FC = () => {
  const [piId, setPiId] = useState<string>('');
  const [live, setLive] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getToken = () => localStorage.getItem('token');

  const connectWebSocket = (id: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setStatus('Connecting...');
    const ws = new WebSocket(`ws://localhost:4000/${id}/live/feed`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'frame' && imgRef.current) {
          imgRef.current.src = `data:image/jpeg;base64,${msg.data}`;
        } else if (msg.type === 'status') {
          setLive(msg.data.live);
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    ws.onclose = () => {
      setStatus('Disconnected');
      setLive(false);
    };

    ws.onerror = () => {
      setStatus('Error');
    };
  };

  const fetchStatus = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:4000/${id}/live`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setLive(data.live);
      }
    } catch (err) {
      console.error('Fetch status error:', err);
    }
  };

  const toggleFeed = async () => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:4000/${piId}/live/toggleFeed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ toggleFeed: !live }),
      });
      if (res.ok) {
        setLive(!live);
      }
    } catch (err) {
      console.error('Toggle feed error:', err);
    }
  };

  useEffect(() => {
    if (piId) {
      connectWebSocket(piId);
      fetchStatus(piId);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [piId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Live Camera Streaming</h1>
      <div>
        <label>Pi ID: </label>
        <input
          type="text"
          value={piId}
          onChange={(e) => setPiId(e.target.value)}
          placeholder="Enter Raspberry Pi ID"
        />
      </div>
      <div>
        <p>Status: {status}</p>
        <p>Live: {live ? 'Yes' : 'No'}</p>
        <button onClick={toggleFeed} disabled={!piId}>
          {live ? 'Stop Feed' : 'Start Feed'}
        </button>
      </div>
      <div>
        <img ref={imgRef} alt="Live Stream" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
      </div>
    </div>
  );
};

export default Streaming;
