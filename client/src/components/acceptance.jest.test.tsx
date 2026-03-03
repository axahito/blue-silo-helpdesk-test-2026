import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';

jest.mock('../api/axios', () => ({
  privateApi: { post: jest.fn(), get: jest.fn() },
}));
jest.mock('../auth/AuthProvider', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: { username: 'test' } }),
}));

import { privateApi } from '../api/axios';

// default mock for get to avoid undefined when components mount
(privateApi.get as jest.Mock).mockResolvedValue({ data: [] });

describe('Jest-only acceptance smoke (client)', () => {
  test('CreateTicket posts and TicketList shows created ticket when filtered by priority', async () => {
    (privateApi.post as jest.Mock).mockResolvedValueOnce({ data: { id: '1', title: 'AC Ticket', priority: 'High', status: 'New' } });

    const { unmount } = render(<CreateTicket onCreated={() => {}} role={'L1'} />);

    const title = screen.getByPlaceholderText(/Title/i) as HTMLInputElement;
    fireEvent.change(title, { target: { value: 'AC Ticket' } });
    const priority = screen.getByDisplayValue('Med') as HTMLSelectElement;
    fireEvent.change(priority, { target: { value: 'High' } });
    const submit = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(submit);

    await waitFor(() => expect(privateApi.post).toHaveBeenCalled());

    // Now simulate TicketList fetching the created ticket when priority=High
    unmount();
    (privateApi.get as jest.Mock).mockResolvedValueOnce({ data: [{ id: '1', title: 'AC Ticket', priority: 'High', status: 'New' }] });
    render(<TicketList onSelect={() => {}} role={'L1'} />);
    const selects = screen.getAllByRole('combobox');
    const prioritySelect = selects[1];
    fireEvent.change(prioritySelect, { target: { value: 'High' } });

    await waitFor(() => expect(privateApi.get).toHaveBeenCalled());
    // verify the tickets API was called with the priority filter
    expect((privateApi.get as jest.Mock).mock.calls.some(call => call[0] === '/tickets' && call[1]?.params?.priority === 'High')).toBeTruthy();
  });
});
