import React, { useEffect, useState } from "react";
import axios from "../../../services/axios"; 
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const SalaryComponentsList = () => {
  const [components, setComponents] = useState([]);

  // Fetch components
  const loadData = async () => {
    try {
      const res = await axios.get("/salary-components/");
      setComponents(res.data);
    } catch (err) {
      toast.error("Failed to fetch salary components");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salary component?")) return;
    try {
      await axios.delete(`/salary-components/${id}/`);
      toast.success("Deleted successfully!");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        <div className="page-header">
          <h3 className="page-title">Salary Components</h3>
          <div className="page-btn">
            <Link to="/accounts/salary-components/create" className="btn btn-primary">
              <i className="fa fa-plus"></i> Add Component
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Percentage</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {components.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.amount || "-"}</td>
                    <td>{item.percentage || "-"}</td>

                    <td>
                      <Link
                        to={`/accounts/salary-components/edit/${item.id}`}
                        className="btn btn-sm btn-warning me-2"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(item.id)}
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

      </div>
    </div>
  );
};

export default SalaryComponentsList;
