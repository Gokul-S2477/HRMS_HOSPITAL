import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const SalaryComponentsList = () => {
  const [components, setComponents] = useState([]);

  // Fetch components
  const loadData = async () => {
    try {
      const res = await API.get("/salary-components/");
      setComponents(res.data);
    } catch (err) {
      console.error("Failed to load salary components", err);
      toast.error("Failed to load salary components");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this component?")) return;
    try {
      await API.delete(`/salary-components/${id}/`);
      toast.success("Deleted successfully!");
      loadData();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Salary Components</h3>
        <Link to="/accounts/salary-components/create" className="btn btn-primary">
          + Add Component
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.length === 0 && (
              <tr>
                <td colSpan={4}>No components found.</td>
              </tr>
            )}
            {components.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.component_type}</td>
                <td>{c.amount}</td>
                <td>
                  <Link
                    to={`/accounts/salary-components/edit/${c.id}`}
                    className="btn btn-sm btn-warning me-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryComponentsList;
