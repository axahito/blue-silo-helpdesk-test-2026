import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketList from './TicketList';

jest.mock('../api/axios', () => ({
  privateApi: { get: jest.fn().mockResolvedValue({ data: [] }) },
}));
jest.mock('../auth/AuthProvider', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({ user: { username: 'test' } }),
}));

import { privateApi } from '../api/axios';

test('renders TicketList and calls API with priority filter', async () =>{
  (privateApi.get as jest.Mock).mockResolvedValueOnce({ data: [{ id: '1', title: 'A', priority: 'High', status: 'New' }] });
  const onSelect = jest.fn();
  render(<TicketList onSelect={onSelect} role={'L1'} />);

  expect(screen.getByText(/Tickets/i)).toBeInTheDocument();

  // change priority filter to High
  const selects = screen.getAllByRole('combobox');
  const priority = selects[1];
  fireEvent.change(priority, { target: { value: 'High' } });

  await waitFor(()=> expect(privateApi.get).toHaveBeenCalled());
  // ensure one of the calls included params.priority = 'High' (use last call)
  const calls = (privateApi.get as jest.Mock).mock.calls;
  const lastCall = calls[calls.length - 1];
  const calledWith = lastCall ? lastCall[1] : undefined;
  expect(calledWith).toBeDefined();
  expect(calledWith.params).toBeDefined();
  expect(calledWith.params.priority).toBe('High');
});
