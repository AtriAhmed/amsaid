"use client"
import axios from "axios";
import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers]= useState<any>([]);
    const [email, setEmail] = useState<string>();
    const [name, setName] = useState<string>();
useEffect(()=>{
    async function getUsers(){
        const users = await axios.get('/api/users');
setUsers(users.data);
    }
getUsers();
},[])

async function addUser(e:any) {
    e.preventDefault();
    axios.post("/api/users", {email, name}).then(res=>{
        console.log(res)
    })
  }

  return (
    <main className="p-6">
      <form onSubmit={addUser} className="space-y-2">
        <input name="email" placeholder="email" className="border px-2 py-1" onChange={(e)=>setEmail(e.target.value)} value={email} />
        <input name="name" placeholder="name" className="border px-2 py-1" onChange={(e)=>setName(e.target.value)} value={name} />
        <button type="submit" className="border px-3 py-1">Add</button>
      </form>

      <ul className="mt-6 space-y-1">
        {users.map((u:any) => (
          <li key={u.id}>
            {u.id} — {u.email} {u.name ? `(${u.name})` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}
