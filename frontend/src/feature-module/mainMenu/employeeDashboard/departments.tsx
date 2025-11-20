import React, { useEffect, useState } from "react";
import axios from "axios";

type Dept = { id: number; name: string; description?: string };

const API = "http://localhost:8000/api/departments/";

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    try {
      const res = await axios.get(API);
      setDepartments(res.data);
    } catch (err) {
      console.error("load departments", err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API, { name, description: desc });
      setName(""); setDesc("");
      load();
    } catch (err) {
      console.error("add dept", err);
      alert("Failed to add department.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete department?")) return;
    try { await axios.delete(`${API}${id}/`); load(); } catch (err) { console.error(err); }
  };

  return (
    <div className="card">
      <div className="card-header"><h3>Departments</h3></div>
      <div className="card-body">
        <form className="row g-2 mb-3" onSubmit={handleAdd}>
          <div className="col-md-4">
            <input className="form-control" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required/>
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" type="submit">Add</button>
          </div>
        </form>

        <table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.description ?? "-"}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Departments;
