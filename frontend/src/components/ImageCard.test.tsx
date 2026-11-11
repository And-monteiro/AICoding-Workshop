import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ImageCard } from './ImageCard';

function renderCard() {
  return render(<ImageCard src="/pipeline.svg" alt="Delivery loop diagram" caption="A caption" />);
}

describe('ImageCard', () => {
  it('shows the image and a zoom button, with no dialog open', () => {
    renderCard();

    expect(screen.getByRole('img', { name: 'Delivery loop diagram' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom image' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a zoom dialog when the magnifier is clicked', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: 'Zoom image' }));

    const dialog = screen.getByRole('dialog', { name: 'Zoomed image' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Delivery loop diagram (zoomed)' })).toBeInTheDocument();
  });

  it('closes the dialog with the close button', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: 'Zoom image' }));
    await user.click(screen.getByRole('button', { name: 'Close zoomed image' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the dialog with the Escape key', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: 'Zoom image' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
