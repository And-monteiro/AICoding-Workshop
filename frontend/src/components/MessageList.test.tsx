import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageList } from './MessageList';

describe('MessageList', () => {
  it('renders every message it is given', () => {
    render(
      <MessageList
        messages={[
          { id: 1, text: 'Hello, World!' },
          { id: 2, text: 'Hola, Mundo!' },
        ]}
      />,
    );

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('Hola, Mundo!')).toBeInTheDocument();
  });

  it('shows an empty state when there are no messages', () => {
    render(<MessageList messages={[]} />);

    expect(screen.getByText('No messages yet.')).toBeInTheDocument();
  });
});
