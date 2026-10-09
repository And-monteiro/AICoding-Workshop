export interface Message {
  id: number;
  text: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export async function fetchMessages(): Promise<Message[]> {
  const response = await fetch(`${API_URL}/api/messages`);
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }
  return response.json();
}
