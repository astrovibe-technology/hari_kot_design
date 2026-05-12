import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_URL;

const CategoryPage = () => {

  const [categories, setCategories] = useState([]);
  const [gstList, setGstList] = useState([]);
  const [shopList, setShopList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    category_name: "",
    gst_id: "",
    shop_id: ""
  });

  // ---------------- FETCH ----------------
  const fetchGST = async () => {
    const res = await fetch(`${API}/gst/list`);
    const data = await res.json();
    setGstList(data.data || []);
  };

  const fetchShops = async () => {
    const res = await fetch(`${API}/shops/list`);
    const data = await res.json();
    setShopList(data.data || []);
  };

  const fetchCategory = async () => {
    const res = await fetch(`${API}/category/list`);
    const data = await res.json();
    setCategories(data.data || []);
  };

  useEffect(() => {
    fetchGST();
    fetchShops();
    fetchCategory();
  }, []);

  // ---------------- INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- OPEN CREATE ----------------
  const openCreate = () => {
    setEditId(null);
    setForm({
      category_name: "",
      gst_id: "",
      shop_id: ""
    });
    setShowModal(true);
  };

  // ---------------- OPEN EDIT ----------------
  const handleEdit = (c) => {
    setEditId(c.id);

    setForm({
      category_name: c.category_name,
      gst_id: c.gst?.id || "",
      shop_id: c.shop?.id || ""
    });

    setShowModal(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Category?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${API}/category/delete/${id}`, {
      method: "DELETE"
    });

    Swal.fire("Deleted!", "", "success");
    fetchCategory();
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {

      if (!form.category_name || !form.gst_id || !form.shop_id) {
        return Swal.fire("Error", "All fields required", "error");
      }

      let url = `${API}/category/create`;
      let method = "POST";

      if (editId) {
        url = `${API}/category/update/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_name: form.category_name,
          gst_id: Number(form.gst_id),
          shop_id: Number(form.shop_id)
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail);

      Swal.fire("Success", editId ? "Updated" : "Created", "success");

      setShowModal(false);
      fetchCategory();

    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="printer-page">

      {/* HEADER */}
      <div className="header">
        <h2>📦 Category Management</h2>
        <button className="add-btn" onClick={openCreate}>
          + Add Category
        </button>
      </div>

      {/* TABLE */}
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Shop</th>
              <th>GST</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4">No Categories Found</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.category_name}</td>
                  <td>{c.shop?.shop_name || "-"}</td>
                  <td>{c.gst?.gst_name} ({c.gst?.gst_percent}%)</td>

                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c.id)}
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

            <h3>{editId ? "Edit Category" : "Add Category"}</h3>

            <input
              name="category_name"
              placeholder="Category Name"
              value={form.category_name}
              onChange={handleChange}
            />

            {/* SHOP */}
            <select
              name="shop_id"
              value={form.shop_id}
              onChange={handleChange}
            >
              <option value="">Select Shop</option>
              {shopList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shop_name}
                </option>
              ))}
            </select>

            {/* GST */}
            <select
              name="gst_id"
              value={form.gst_id}
              onChange={handleChange}
            >
              <option value="">Select GST</option>
              {gstList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.gst_name} ({g.gst_percent}%)
                </option>
              ))}
            </select>

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

export default CategoryPage;