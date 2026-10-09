import { useEffect, useState } from 'react';
import { fetchMessages, Message } from './api';
import { MessageList } from './components/MessageList';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages()
      .then(setMessages)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <span className="logo" />
          AI Workshop
        </div>
        <div className="nav-links">
          <span className="active">Messages</span>
          <span>Settings</span>
        </div>
      </nav>

      <div className="page-body">
        <header className="page-header">
          <div>
            <h1>Messages List</h1>
            <p>Read straight from Postgres through the API.</p>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className="card">
          <div className="table-header">
            <span>ID</span>
            <span>Text</span>
          </div>
          <MessageList messages={messages} />
        </div>
      </div>
    </div>
  );
}

export default App;
