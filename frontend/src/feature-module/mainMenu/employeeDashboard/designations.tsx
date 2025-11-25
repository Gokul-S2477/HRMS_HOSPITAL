import React, { useEffect, useState } from "react";
import axios from "axios";

type Desig = { id: number; title: string; description?: string };
const API = "http://localhost:8000/api/designations/";

const Designations: React.FC = () => {
  const [items, setItems] = useState<Desig[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    try { const res = await axios.get(API); setItems(res.data); } catch (err) { console.error(err); }
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await axios.post(API, { title, description: desc }); setTitle(""); setDesc(""); load(); } catch (err) { console.error(err); alert("Failed"); }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete designation?")) return;

    try { await axios.delete(`${API}${id}/`); load(); } catch (err) { console.error(err); }
  };

  return (
    <div className="card">
      <div className="card-header"><h3>Designations</h3></div>
      <div className="card-body">
        <form className="row g-2 mb-3" onSubmit={add}>
          <div className="col-md-4">
            <input className="form-control" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required/>
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" type="submit">Add</button>
          </div>
        </form>

        <table className="table">
          <thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.title}</td>
                <td>{i.description ?? "-"}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => remove(i.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Designations;
