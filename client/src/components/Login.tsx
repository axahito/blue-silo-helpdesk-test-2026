
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed');
    }
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded w-full max-w-sm mx-auto">
      <h3 className="text-lg font-medium mb-2">Login</h3>
      <input className="w-full border p-2 mb-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full border p-2 mb-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" type="submit">Login</button>
      </div>
    </form>
  );
}
