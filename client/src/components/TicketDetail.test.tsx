import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TicketDetail from './TicketDetail';

jest.mock('../api/axios', () => ({
  privateApi: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('../auth/AuthProvider', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: { username: 'test' } }),
}));

import { privateApi } from '../api/axios';

test('L2 role sees Assign Critical UI and L1 does not', async () => {
  (privateApi.get as jest.Mock).mockResolvedValue({ data: { title: 'T', status: 'New', priority: 'Med', logs: [], critical: 'None', escalation: null } });
  const { rerender } = render(<TicketDetail id={'1'} role={'L2'} />);
  await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
  // critical select should be present for L2
  expect(screen.getByText(/Critical:/i)).toBeInTheDocument();

  // rerender as L1 - critical UI should not be present
  (privateApi.get as jest.Mock).mockResolvedValue({ data: { title: 'T', status: 'New', priority: 'Med', logs: [], critical: 'None', escalation: null } });
  rerender(<TicketDetail id={'1'} role={'L1'} />);
  await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());
  expect(screen.queryByText(/Critical:/i)).toBeNull();
});

test('Escalation captures and displays note in logs', async () => {
  // initial ticket
  (privateApi.get as jest.Mock).mockResolvedValueOnce({ data: { title: 'T', status: 'New', priority: 'Med', logs: [], critical: 'None', escalation: null } });
  (privateApi.post as jest.Mock).mockResolvedValueOnce({ data: { title: 'T', status: 'New', priority: 'Med', logs: [{ by: 'u', note: 'escalation note', action: 'escalate', date: new Date().toISOString() }], critical: 'None', escalation: 'L2' } });

  const { container } = render(<TicketDetail id={'1'} role={'L1'} />);
  await waitFor(() => expect(privateApi.get).toHaveBeenCalled());
  await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

  // locate the escalation input via DOM after the ticket has loaded
  await screen.findByText(/Logs/i);
  const input = container.querySelector('input[placeholder="Escalation note"]') as HTMLInputElement | null;
  expect(input).not.toBeNull();
  fireEvent.change(input!, { target: { value: 'escalation note' } });
  const button = screen.getByText(/Escalate to L2/i);
  fireEvent.click(button);

  await waitFor(() => expect(privateApi.post).toHaveBeenCalled());
  // log entry should be rendered
  await waitFor(() => expect(screen.getByText(/escalation note/i)).toBeInTheDocument());
});
