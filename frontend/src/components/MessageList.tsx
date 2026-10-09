import { Message } from '../api';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="empty-state">No messages yet.</p>;
  }

  return (
    <ul className="message-list">
      {messages.map((message) => (
        <li key={message.id} className="message-item">
          <span className="id-badge">#{message.id}</span>
          <span>{message.text}</span>
        </li>
      ))}
    </ul>
  );
}
