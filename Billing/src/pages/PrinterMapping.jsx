import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_BASE_URL;

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

  const [search, setSearch] = useState("");

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

  // ---------------- SEARCH FILTER ----------------
  const filteredPrinters = printers.filter((p) => {
    const keyword = search.toLowerCase();

    return (
      p.printer_name?.toLowerCase().includes(keyword) ||
      p.printer_type?.toLowerCase().includes(keyword) ||
      p.ip_address?.toLowerCase().includes(keyword) ||
      String(p.port)?.toLowerCase().includes(keyword) ||
      categories
        .find((c) => c.id === p.category_id)
        ?.category_name?.toLowerCase()
        .includes(keyword)
    );
  });

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
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail);

      Swal.fire("Success", editId ? "Updated" : "Created", "success");

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
      Swal.fire("Error", err.message, "error");
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
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    await fetch(`${API}/printers/delete/${id}`, { method: "DELETE" });

    Swal.fire("Deleted!", "", "success");
    fetchPrinters();
  };

  // ---------------- TOGGLE STATUS ----------------
  const toggleStatus = async (p) => {
    await fetch(`${API}/printers/update/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, is_active: !p.is_active }),
    });

    fetchPrinters();
  };

  // ---------------- CATEGORY NAME ----------------
  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.category_name || "-";

  return (
    <div className="printer-page">

      {/* HEADER (RESPONSIVE) */}
      <div className="header d-flex justify-content-between align-items-center flex-wrap gap-2">

        <h3 className="mb-0">🖨️ Printer Management</h3>

        <div className="d-flex align-items-center gap-2 flex-wrap">

          {/* SEARCH */}
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search printer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "260px",
              borderRadius: "8px"
            }}
          />

          {/* ADD BUTTON */}
          <button
            className="add-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Printer
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="table-box">
        <div className="table-responsive">
          <table className="table table-hover mb-0">

            <thead className="table-primary">
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
              {filteredPrinters.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No printers found
                  </td>
                </tr>
              ) : (
                filteredPrinters.map((p) => (
                  <tr key={p.id}>
                    <td>{p.printer_name}</td>
                    <td>{p.printer_type}</td>
                    <td>{p.ip_address}</td>
                    <td>{p.port}</td>
                    <td>{getCategoryName(p.category_id)}</td>

                    <td>
                      <input
                        type="checkbox"
                        checked={p.is_active}
                        onChange={() => toggleStatus(p)}
                      />
                    </td>

                    <td className="text-nowrap">
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
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