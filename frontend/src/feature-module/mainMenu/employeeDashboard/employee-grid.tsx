import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type Employee = {
  id: number;
  emp_code: string;
  first_name: string;
  last_name?: string;
  email: string;
  department?: { id: number; name: string } | null;
  designation?: { id: number; title: string } | null;
  photo?: string | null;
};

const API = "http://localhost:8000/api/employees/";

const EmployeeGrid: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const load = async () => {
    try {
      const res = await axios.get(API);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error loading employees grid", err);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Employee Grid</h3>
        <div>
          <Link to="/employees-list" className="btn btn-outline-secondary me-2">List</Link>
          <Link to="/employees-details" className="btn btn-outline-secondary">Details</Link>
        </div>
      </div>

      <div className="card-body">
        <div className="row">
          {employees.map((e) => (
            <div className="col-md-3" key={e.id}>
              <div className="card text-center mb-3">
                <div className="card-body">
                  <img
                    src={e.photo ?? "/assets/images/avatar.png"}
                    alt={e.first_name}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%" }}
                  />
                  <h5 className="mt-2">{e.first_name} {e.last_name}</h5>
                  <p className="mb-1">{e.designation?.title ?? "-"}</p>
                  <p className="text-muted small">{e.department?.name ?? "-"}</p>
                  <Link to={`/employees-details?id=${e.id}`} className="btn btn-sm btn-primary">View</Link>
                </div>
              </div>
            </div>
          ))}
          {employees.length === 0 && <div className="col-12 text-center">No employees</div>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeGrid;
