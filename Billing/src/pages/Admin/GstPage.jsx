import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_URL;

const GstPage = () => {
  const [gstList, setGstList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    gst_name: "",
    gst_percent: "",
  });

  // ================= FETCH =================
  const fetchGST = async () => {
    try {
      const res = await fetch(`${API}/gst/list`);
      const data = await res.json();
      setGstList(data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGST();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= OPEN CREATE =================
  const openCreate = () => {
    setEditId(null);
    setForm({
      gst_name: "",
      gst_percent: "",
    });
    setShowModal(true);
  };

  // ================= OPEN EDIT =================
  const handleEdit = (gst) => {
    setForm({
      gst_name: gst.gst_name,
      gst_percent: gst.gst_percent,
    });
    setEditId(gst.id);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete GST?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${API}/gst/delete/${id}`, {
      method: "DELETE",
    });

    Swal.fire("Deleted!", "", "success");
    fetchGST();
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      let url = `${API}/gst/create`;
      let method = "POST";

      if (editId) {
        url = `${API}/gst/update/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gst_name: form.gst_name,
          gst_percent: parseFloat(form.gst_percent),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail);

      Swal.fire("Success", data.message || "Saved", "success");

      setShowModal(false);
      fetchGST();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ================= STATUS TOGGLE =================
  const toggleStatus = async (gst) => {
    await fetch(`${API}/gst/update/${gst.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_active: !gst.is_active,
      }),
    });

    fetchGST();
  };

  return (
    <div className="printer-page">

      {/* HEADER */}
      <div className="header">
        <h2>GST Details</h2>
        <button className="add-btn" onClick={openCreate}>
          + Add GST
        </button>
      </div>

      {/* TABLE */}
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Percent</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {gstList.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No GST found
                </td>
              </tr>
            ) : (
              gstList.map((g) => (
                <tr key={g.id}>
                  <td>{g.gst_name}</td>
                  <td>{g.gst_percent}%</td>

                  {/* STATUS */}
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={g.is_active ?? true}
                        onChange={() => toggleStatus(g)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>

                  {/* ACTION */}
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(g)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(g.id)}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>{editId ? "Edit GST" : "Add GST"}</h3>

            <input
              name="gst_name"
              placeholder="GST Name (Ex: GST 5%)"
              value={form.gst_name}
              onChange={handleChange}
            />

            <input
              name="gst_percent"
              placeholder="GST Percent"
              value={form.gst_percent}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button className="save" onClick={handleSave}>
                {editId ? "Update" : "Save"}
              </button>

              <button
                className="cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GstPage;