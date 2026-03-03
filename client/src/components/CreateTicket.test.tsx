import { createTicketSchema } from '../schemas';

test('createTicketSchema validates required fields (title, priority)', () => {
  // missing title
  const res1 = createTicketSchema.safeParse({ priority: 'Med' });
  expect(res1.success).toBe(false);
  // short title
  const res2 = createTicketSchema.safeParse({ title: 'ab', priority: 'Med' });
  expect(res2.success).toBe(false);
  // valid
  const res3 = createTicketSchema.safeParse({ title: 'Valid title', priority: 'Low' });
  expect(res3.success).toBe(true);
});
