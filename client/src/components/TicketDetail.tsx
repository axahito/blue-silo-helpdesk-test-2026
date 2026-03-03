import React, { useEffect, useState } from 'react';
import { privateApi } from '../api/axios';
import { useAuth } from '../auth/AuthProvider';

export default function TicketDetail({ id, role }: { id: string; role: string }){
  const [ticket, setTicket] = useState<any | null>(null);
  const [note, setNote] = useState('');
  const [escalateNote, setEscalateNote] = useState('');
  const [critical, setCritical] = useState<'C1'|'C2'|'C3'|'None'>('None');
  const [resolution, setResolution] = useState('');

  const { user } = useAuth();

  useEffect(()=>{
    if (!user) {
      setTicket(null);
      return;
    }
    async function load(){
      try{
        const r = await privateApi.get(`/tickets/${id}`);
        setTicket(r.data);
      }catch(err){
        setTicket(null);
      }
    }
    load();
  },[id, user])

  async function addLog(){
    try{
      const r = await privateApi.post(`/tickets/${id}/log`, { note });
      setTicket(r.data);
    }catch(err:any){
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add log');
    }
    setNote('');
  }

  async function updateStatus(status: string){
    try{
      const r = await privateApi.post(`/tickets/${id}/status`, { status, note: `Set status ${status}` });
      setTicket(r.data);
    }catch(err:any){ console.error(err); alert(err.response?.data?.message || 'Failed to update status'); }
  }

  async function doEscalate(toRole: string, note?: string){
    try{
      const r = await privateApi.post(`/tickets/${id}/escalate`, { toRole, note: note || escalateNote });
      setTicket(r.data);
    }catch(err:any){ console.error(err); alert(err.response?.data?.message || 'Failed to escalate'); }
    setEscalateNote('');
  }

  async function setCriticalAction(){
    try{
      const r = await privateApi.post(`/tickets/${id}/critical`, { critical, note: `Set critical ${critical}` });
      setTicket(r.data);
    }catch(err:any){ console.error(err); alert(err.response?.data?.message || 'Failed to set critical'); }
  }

  async function doResolve(){
    try{
      const r = await privateApi.post(`/tickets/${id}/resolve`, { resolution });
      setTicket(r.data);
    }catch(err:any){ console.error(err); alert(err.response?.data?.message || 'Failed to resolve'); }
    setResolution('');
  }

  return (
    <div>
      {ticket ? (
        <div>
          <h2 className="text-xl font-semibold">{ticket.title}</h2>
          <div className="text-sm text-gray-600">{ticket.status} • {ticket.priority}</div>
          <p className="mt-2">{ticket.description}</p>

          {/* determine state flags */}
          {(() => {
            const isCompleted = ticket.status === 'Completed';
            return (
              <>
                <div className="mt-4">
                  <h3 className="font-medium">Logs</h3>
                  <ul className="mt-2 space-y-2">
                    {ticket.logs.map((l:any, idx:number)=>(
                      <li key={idx} className="text-sm border p-2 rounded">{l.date} — <strong>{l.by}</strong>: {l.note}</li>
                    ))}
                  </ul>
                </div>

                {!isCompleted && (
                  <div className="mt-4">
                    <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full border p-2"></textarea>
                    <div className="mt-2"><button onClick={addLog} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={false}>Add Log</button></div>
                  </div>
                )}

                <div className="mt-4">
                  {role === 'L1' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-yellow-500 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-yellow-300" onClick={()=>updateStatus('Attending')} disabled={isCompleted || ticket.status === 'Attending'}>Mark Attending</button>
                        <button className="px-2 py-1 bg-green-600 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-300" onClick={()=>updateStatus('Completed')} disabled={isCompleted || ticket.status === 'Completed'}>Mark Completed</button>
                      </div>
                      <div>
                        <input value={escalateNote} onChange={e=>setEscalateNote(e.target.value)} className="w-full border p-2" placeholder="Escalation note" />
                        <div className="mt-1"><button className="px-2 py-1 bg-orange-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-orange-300" onClick={()=>doEscalate('L2')}>Escalate to L2</button></div>
                      </div>
                    </div>
                  )}

                  {role === 'L2' && (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <label className="mr-2">Critical:</label>
                        <select value={critical} onChange={e=>setCritical(e.target.value as any)} className="border p-1">
                          <option value="C1">C1</option>
                          <option value="C2">C2</option>
                          <option value="C3">C3</option>
                          <option value="None">None</option>
                        </select>
                        <button className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-300" onClick={setCriticalAction} disabled={isCompleted}>Set</button>
                      </div>
                      <div>
                        <input value={escalateNote} onChange={e=>setEscalateNote(e.target.value)} className="w-full border p-2" placeholder="Escalation note to L3" />
                          <div className="mt-1">
                          {/* only allow escalate to L3 when critical is C1 or C2 */}
                          <button className="px-2 py-1 bg-orange-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-orange-300" onClick={()=>doEscalate('L3')} disabled={isCompleted || !(ticket.critical === 'C1' || ticket.critical === 'C2')}>Escalate to L3</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'L3' && (
                    <div className="space-y-2">
                      {/* L3 only handles escalated critical C1-C2 tickets */}
                      {ticket.escalation === 'L3' && (ticket.critical === 'C1' || ticket.critical === 'C2') ? (
                        <>
                          <textarea value={resolution} onChange={e=>setResolution(e.target.value)} className="w-full border p-2" placeholder="Resolution notes" />
                          <div><button className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-indigo-300" onClick={doResolve} disabled={isCompleted}>Add Resolution & Close</button></div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-600">Not eligible for L3 handling (only escalated critical C1–C2 are handled by L3).</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      ) : <div>Loading...</div>}
    </div>
  )
}
