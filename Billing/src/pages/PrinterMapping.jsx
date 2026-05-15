import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API = "http://127.0.0.1:8000";

const PrinterMapping = () => {

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const [categories, setCategories] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    printer_name: "",
    printer_type: "",
    ip_address: "",
    port: "",
    category_id: "",
  });

  const [editId, setEditId] = useState(null);

  // ---------------- FETCH CATEGORIES ----------------
  const fetchCategories = async () => {
    try {
      let url = `${API}/category/list`;

      if (user.role && user.shop_id) {
        url += `?role=${user.role}&shop_id=${user.shop_id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status) {
        setCategories(data.data);
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- FETCH PRINTERS ----------------
  const fetchPrinters = async () => {
    try {
      let url = `${API}/printers/list`;

      if (user.role === "shop_staff") {
        url += `?shop_id=${user.shop_id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status) {
        setPrinters(data.data);
      }

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPrinters();
  }, []);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- ADD / UPDATE ----------------
  const handleSave = async () => {
    try {

      if (
        !form.printer_name ||
        !form.printer_type ||
        !form.ip_address ||
        !form.port ||
        !form.category_id
      ) {
        return Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: "Please fill all fields",
        });
      }

      const payload = {
        ...form,
        category_id: Number(form.category_id),
        shop_id: user.shop_id || null,
      };

      let url = `${API}/printers/create`;
      let method = "POST";

      if (editId) {
        url = `${API}/printers/update/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error");
      }

      Swal.fire({
        icon: "success",
        title: editId ? "Updated!" : "Created!",
        text: editId
          ? "Printer updated successfully"
          : "Printer created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowModal(false);
      setEditId(null);

      setForm({
        printer_name: "",
        printer_type: "",
        ip_address: "",
        port: "",
        category_id: "",
      });

      fetchPrinters();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  // ---------------- EDIT ----------------
  const handleEdit = (p) => {
    setForm({
      printer_name: p.printer_name,
      printer_type: p.printer_type,
      ip_address: p.ip_address,
      port: p.port,
      category_id: p.category_id,
    });

    setEditId(p.id);
    setShowModal(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/printers/delete/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Delete failed");
      }

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Printer deleted successfully",
        timer: 1200,
        showConfirmButton: false,
      });

      fetchPrinters();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  // ---------------- TOGGLE STATUS ----------------
  const toggleStatus = async (p) => {
    try {

      const res = await fetch(`${API}/printers/update/${p.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...p,
          is_active: !p.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      fetchPrinters();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message,
      });
    }
  };

  // ---------------- HELPER ----------------
  const getCategoryName = (id) => {
    return (
      categories.find((c) => c.id === id)?.category_name || "-"
    );
  };

  return (
    <div className="printer-page">

      <div className="header">
        <h2>🖨️ Printer Management</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Printer
        </button>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>IP</th>
              <th>Port</th>
              <th>Category</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty">
                  No printers added
                </td>
              </tr>
            ) : (
              printers.map((p) => (
                <tr key={p.id}>
                  <td>{p.printer_name}</td>

                  <td>
                    <span className={`tag ${p.printer_type}`}>
                      {p.printer_type}
                    </span>
                  </td>

                  <td>{p.ip_address}</td>
                  <td>{p.port}</td>

                  <td>{getCategoryName(p.category_id)}</td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={p.is_active}
                        onChange={() => toggleStatus(p)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>

                  <td>
                    <button onClick={() => handleEdit(p)} className="btn btn-primary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>{editId ? "Edit Printer" : "Add Printer"}</h3>

            <input
              name="printer_name"
              placeholder="Printer Name"
              value={form.printer_name}
              onChange={handleChange}
            />

            <select
              name="printer_type"
              value={form.printer_type}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="KOT">KOT</option>
              <option value="Billing">Billing</option>
            </select>

            <input
              name="ip_address"
              placeholder="IP Address"
              value={form.ip_address}
              onChange={handleChange}
            />

            <input
              name="port"
              placeholder="Port"
              value={form.port}
              onChange={handleChange}
            />

            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="save" onClick={handleSave}>
                Save
              </button>
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterMapping;