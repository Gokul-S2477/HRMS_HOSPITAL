// frontend/src/feature-module/mainMenu/employeeDashboard/employee-details.tsx

import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import API from "../../../api/axios";

// ===================== TYPES =====================
type Dept = { id: number; name: string };
type Desig = { id: number; title: string };

type Employee = {
  id: number;
  emp_code: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;

  father_name?: string | null;
  mother_name?: string | null;
  spouse_name?: string | null;
  religion?: string | null;
  nationality?: string | null;

  email: string;
  phone?: string | null;
  alternate_phone?: string | null;
  address?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;

  aadhar_number?: string | null;
  pan_number?: string | null;
  passport_number?: string | null;
  driving_license_number?: string | null;

  role?: string | null;
  department?: Dept | null;
  designation?: Desig | null;

  joining_date?: string | null;
  employment_type?: string | null;

  reporting_to_detail?: { id: number; name: string } | null;

  national_id?: string | null;
  blood_group?: string | null;
  marital_status?: string | null;

  work_shift?: string | null;
  work_location?: string | null;

  previous_company?: string | null;
  previous_experience_years?: number | null;
  previous_salary?: number | null;
  highest_qualification?: string | null;

  probation_period?: string | null;
  confirmation_date?: string | null;
  notice_period?: string | null;

  resignation_date?: string | null;
  resignation_reason?: string | null;

  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  bank_branch?: string | null;

  salary?: number | null;
  is_active?: boolean;
  photo?: string | null;
};

// Helper Hook
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// ===================== COMPONENT =====================
const EmployeeDetails: React.FC = () => {
  const q = useQuery();
  const id = q.get("id");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  // Track section being edited
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await API.get(`/employees/${id}/`);
      setEmployee(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setFormData(employee || {});
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await API.patch(`/employees/${id}/`, formData);
      setEditingSection(null);
      load(); // Reload updated data
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!employee) {
    return <h4 className="text-center mt-5">Loading...</h4>;
  }

  const containerStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 20,
    marginBottom: 25,
    background: "#fff",
  };

  const Title = ({ text }: { text: string }) => (
    <h4 style={{ marginBottom: 20, fontWeight: 600 }}>{text}</h4>
  );

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">

        {/* HEADER */}
        <div className="page-header d-flex justify-content-between align-items-center mb-3">
          <h3>Employee Details</h3>
          <Link className="btn btn-secondary" to="/employees">
            Back to List
          </Link>
        </div>

        {/* TOP PROFILE CARD */}
        <div style={containerStyle}>
          <div className="d-flex">
            <img
              src={
                employee.photo
                  ? `http://127.0.0.1:8000${employee.photo}`
                  : "/assets/images/avatar.png"
              }
              style={{ width: 120, height: 120, borderRadius: 10, marginRight: 20 }}
            />

            <div>
              <h3>
                {employee.first_name} {employee.last_name ?? ""}
              </h3>
              <p className="text-muted">{employee.emp_code}</p>
              <p><strong>{employee.role ?? "-"}</strong></p>
            </div>
          </div>
        </div>

        {/* ============================
            BASIC INFORMATION
        ============================ */}
        <div style={containerStyle}>
          <div className="d-flex justify-content-between">
            <Title text="Basic Information" />

            {editingSection !== "basic" ? (
              <button className="btn btn-primary" onClick={() => handleEdit("basic")}>
                Edit
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
            )}
          </div>

          <table className="table">
            <tbody>
              {[
                ["First Name", "first_name"],
                ["Middle Name", "middle_name"],
                ["Last Name", "last_name"],
                ["Gender", "gender"],
                ["Date of Birth", "date_of_birth"],
                ["Father Name", "father_name"],
                ["Mother Name", "mother_name"],
                ["Spouse Name", "spouse_name"],
                ["Religion", "religion"],
                ["Nationality", "nationality"],
              ].map(([label, field]) => (
                <tr key={field}>
                  <th>{label}</th>
                  <td>
                    {editingSection === "basic" ? (
                      <input
                        className="form-control"
                        value={formData[field] ?? ""}
                        onChange={(e) => updateField(field, e.target.value)}
                      />
                    ) : (
                      employee[field as keyof Employee] || "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================
            CONTACT INFORMATION
        ============================ */}
        <div style={containerStyle}>
          <div className="d-flex justify-content-between">
            <Title text="Contact Information" />

            {editingSection !== "contact" ? (
              <button className="btn btn-primary" onClick={() => handleEdit("contact")}>
                Edit
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
            )}
          </div>

          <table className="table">
            <tbody>
              {[
                ["Email", "email"],
                ["Phone", "phone"],
                ["Alternate Phone", "alternate_phone"],
                ["Address", "address"],
              ].map(([label, field]) => (
                <tr key={field}>
                  <th>{label}</th>
                  <td>
                    {editingSection === "contact" ? (
                      <input
                        className="form-control"
                        value={formData[field] ?? ""}
                        onChange={(e) => updateField(field, e.target.value)}
                      />
                    ) : (
                      employee[field as keyof Employee] || "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================
            BANK DETAILS
        ============================ */}
        <div style={containerStyle}>
          <div className="d-flex justify-content-between">
            <Title text="Bank Details" />

            {editingSection !== "bank" ? (
              <button className="btn btn-primary" onClick={() => handleEdit("bank")}>
                Edit
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
            )}
          </div>

          <table className="table">
            <tbody>
              {[
                ["Bank Name", "bank_name"],
                ["Account Number", "bank_account_number"],
                ["IFSC Code", "bank_ifsc"],
                ["Branch", "bank_branch"],
              ].map(([label, field]) => (
                <tr key={field}>
                  <th>{label}</th>
                  <td>
                    {editingSection === "bank" ? (
                      <input
                        className="form-control"
                        value={formData[field] ?? ""}
                        onChange={(e) => updateField(field, e.target.value)}
                      />
                    ) : (
                      employee[field as keyof Employee] || "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add similar containers for:
            ✔ Identity Documents
            ✔ HR Extra
            ✔ Previous Experience
            ✔ Job Information
        */}

      </div>
    </div>
  );
};

export default EmployeeDetails;
