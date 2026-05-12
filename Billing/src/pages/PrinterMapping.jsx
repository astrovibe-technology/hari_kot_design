import React, { useState } from "react";

const PrinterMapping = () => {
  const categories = ["Fruits", "Vegetables", "Drinks", "Snacks", "Food"];

  const [printers, setPrinters] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    printer_name: "",
    printer_type: "",
    ip_address: "",
    port: "",
    category: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddPrinter = () => {
    if (
      !form.printer_name ||
      !form.printer_type ||
      !form.ip_address ||
      !form.port ||
      !form.category
    ) {
      alert("Fill all fields");
      return;
    }

    setPrinters([
      ...printers,
      { id: Date.now(), ...form, is_active: true },
    ]);

    setShowModal(false);

    setForm({
      printer_name: "",
      printer_type: "",
      ip_address: "",
      port: "",
      category: "",
    });
  };

  const toggleStatus = (id) => {
    setPrinters(
      printers.map((p) =>
        p.id === id ? { ...p, is_active: !p.is_active } : p
      )
    );
  };

  return (
    <div className="printer-page">

      {/* HEADER */}
      <div className="header">
        <h2>🖨️ Printer Management</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Printer
        </button>
      </div>

      {/* TABLE */}
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
            </tr>
          </thead>

          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
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
                  <td>{p.category}</td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={p.is_active}
                        onChange={() => toggleStatus(p.id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Add Printer</h3>

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
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="save" onClick={handleAddPrinter}>
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