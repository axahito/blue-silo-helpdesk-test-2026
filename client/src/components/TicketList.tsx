import React, { useEffect, useState } from "react";
import { privateApi } from "../api/axios";
import { useAuth } from "../auth/AuthProvider";

export default function TicketList({
  onSelect,
  role,
  refreshSignal,
}: {
  onSelect: (id: string) => void;
  role: string;
  refreshSignal?: number;
}) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All'|'New'|'Attending'|'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All'|'Low'|'Med'|'High'>('All');
  const [escalationFilter, setEscalationFilter] = useState<'All'|'L1'|'L2'|'L3'>(()=>{
    if (role === 'L2') return 'L2';
    if (role === 'L3') return 'L3';
    return 'All';
  });

  useEffect(() => {
    if (!user) {
      setTickets([]);
      return;
    }

    async function load() {
      try {
        const params: any = {};
        if (statusFilter !== 'All') params.status = statusFilter;
        if (priorityFilter !== 'All') params.priority = priorityFilter;
        if (escalationFilter !== 'All') params.escalation = escalationFilter;
        const r = await privateApi.get('/tickets', { params });
        setTickets(r.data);
      } catch (err) {
        console.log('Failed to fetch tickets:', err);
        setTickets([]);
      }
    }
    load();
  }, [refreshSignal, user, statusFilter, priorityFilter, escalationFilter]);

  return (
    <div>
      <h2 className="font-semibold mb-2">Tickets</h2>
      <div className="flex gap-2 mb-3 items-center">
        <label className="text-sm">Status:</label>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="border p-1">
          <option value="All">All</option>
          <option value="New">New</option>
          <option value="Attending">Attending</option>
          <option value="Completed">Completed</option>
        </select>
        <label className="text-sm">Priority:</label>
        <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value as any)} className="border p-1">
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Med">Med</option>
          <option value="High">High</option>
        </select>
        <label className="text-sm">Escalation:</label>
        <select value={escalationFilter} onChange={e=>setEscalationFilter(e.target.value as any)} className="border p-1">
          <option value="All">All</option>
          <option value="L1">L1</option>
          <option value="L2">L2</option>
          <option value="L3">L3</option>
        </select>
        <button className="ml-auto px-2 py-1 border rounded" onClick={()=>{setStatusFilter('All'); setPriorityFilter('All'); setEscalationFilter('All');}}>Reset</button>
      </div>
      <ul className="space-y-2">
        {tickets.map((t) => (
          <li
            key={t.id}
            className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(t.id)}
          >
            <div className="flex justify-between">
              <span className="font-medium">{t.title}</span>
              <span>{t.priority}</span>
            </div>
            <div className="text-sm text-gray-600">
              {t.status} • {t.escalation || "L1"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
