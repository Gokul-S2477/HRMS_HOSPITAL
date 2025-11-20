import React, { useEffect, useState } from "react";
import axios from "axios";

type Policy = { id: number; title: string; description?: string };
const API = "http://localhost:8000/api/policies/"; // adjust if different

const Policies: React.FC = () => {
  const [items, setItems] = useState<Policy[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    try { const res = await axios.get(API); setItems(res.data); } catch (err) { console.warn("policies load", err); setItems([]); }
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await axios.post(API, { title, description: desc }); setTitle(""); setDesc(""); load(); } catch (err) { console.error(err); alert("Failed to add policy"); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete policy?")) return;
    try { await axios.delete(`${API}${id}/`); load(); } catch (err) { console.error(err); alert("Failed to delete"); }
  };

  return (
    <div className="card">
      <div className="card-header"><h3>Policies</h3></div>
      <div className="card-body">
        <form className="row g-2 mb-3" onSubmit={add}>
          <div className="col-md-4"><input className="form-control" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required/></div>
          <div className="col-md-6"><input className="form-control" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
          <div className="col-md-2"><button className="btn btn-primary w-100" type="submit">Add</button></div>
        </form>

        <table className="table">
          <thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            {items.length === 0 && (<tr><td colSpan={4} className="text-center">No policies</td></tr>)}
            {items.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.description ?? "-"}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => remove(p.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Policies;
