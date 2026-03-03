import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import RequireRole from './auth/RequireRole';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import CreateTicket from './components/CreateTicket';
import Login from './components/Login';

function AppInner(){
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  function triggerRefresh(){ setRefreshSignal(s=>s+1); }

  if (!user) {
    // center the login form horizontally and vertically
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Login />
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Helpdesk Dashboard</h1>
          <div className="mt-2 text-sm text-gray-700">Logged in: <strong>{user.username}</strong> — {user.role}</div>
        </div>
        <div>
          <button className="px-2 py-1 border" onClick={()=>logout()}>Logout</button>
        </div>
      </header>

      <div className="flex gap-6">
        <div className="w-1/3">
          <RequireRole roles={["L1"]}>
            <CreateTicket onCreated={()=>{ triggerRefresh(); }} role={user.role} />
          </RequireRole>
          <div className="mt-4">
            <TicketList onSelect={(id)=>setSelected(id)} role={user.role} refreshSignal={refreshSignal} />
          </div>
        </div>
        <div className="flex-1">
          {selected ? <TicketDetail id={selected} role={user.role} /> : <div>Select a ticket</div>}
        </div>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
