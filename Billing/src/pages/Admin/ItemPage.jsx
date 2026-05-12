import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_URL;

const ItemPage = () => {

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [gstList, setGstList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    item_name: "",
    price: "",
    gst_percent: "",
    item_type: "veg",
    description: "",
    category_id: "",
    shop_id: "",
    gst_id: ""
  });

  // ---------------- FETCH ----------------
  const fetchItems = async () => {
    const res = await fetch(`${API}/items/all`);
    const data = await res.json();
    setItems(data.data || []);
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API}/category/list`);
    const data = await res.json();
    setCategories(data.data || []);
  };

  const fetchShops = async () => {
    const res = await fetch(`${API}/shops/list`);
    const data = await res.json();
    setShops(data.data || []);
  };

  const fetchGST = async () => {
    const res = await fetch(`${API}/gst/list`);
    const data = await res.json();
    setGstList(data.data || []);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchShops();
    fetchGST();
  }, []);

  // ---------------- INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGSTChange = (e) => {
    const id = e.target.value;
    const gst = gstList.find(g => g.id == id);

    setForm({
      ...form,
      gst_id: id,
      gst_percent: gst?.gst_percent || 0
    });
  };

  // ---------------- OPEN CREATE ----------------
  const openCreate = () => {
    setEditId(null);
    setForm({
      item_name: "",
      price: "",
      gst_percent: "",
      item_type: "veg",
      description: "",
      category_id: "",
      shop_id: "",
      gst_id: ""
    });
    setShowModal(true);
  };

  // ---------------- OPEN EDIT ----------------
  const handleEdit = (i) => {
    setEditId(i.id);

    const gstObj = gstList.find(g => g.gst_percent === i.gst_percent);

    setForm({
      item_name: i.item_name,
      price: i.price,
      gst_percent: i.gst_percent,
      item_type: i.item_type,
      description: i.description,
      category_id: i.category_id,
      shop_id: i.shop_id,
      gst_id: gstObj?.id || ""
    });

    setShowModal(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Item?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${API}/items/delete/${id}`, {
      method: "DELETE"
    });

    Swal.fire("Deleted!", "", "success");
    fetchItems();
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {

      let url = `${API}/items/create`;
      let method = "POST";

      if (editId) {
        url = `${API}/items/update/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: form.item_name,
          price: Number(form.price),
          gst_percent: Number(form.gst_percent),
          item_type: form.item_type,
          description: form.description,
          category_id: Number(form.category_id),
          shop_id: Number(form.shop_id)
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail);

      Swal.fire("Success", editId ? "Updated" : "Created", "success");

      setShowModal(false);
      fetchItems();

    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ---------------- HELPERS ----------------
  const getCategoryName = (id) =>
    categories.find(c => c.id === id)?.category_name || "-";

  const getShopName = (id) =>
    shops.find(s => s.id === id)?.shop_name || "-";

  return (
    <div className="printer-page">

      {/* HEADER */}
      <div className="header">
        <h2>🛒 Item Management</h2>
        <button className="add-btn" onClick={openCreate}>
          + Add Item
        </button>
      </div>

      {/* TABLE */}
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Code</th>
              <th>Price</th>
              <th>GST</th>
              <th>Category</th>
              <th>Shop</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="8">No Items Found</td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i.id}>
                  <td>{i.item_name}</td>
                  <td>{i.item_code}</td>
                  <td>₹ {i.price}</td>
                  <td>{i.gst_percent}%</td>
                  <td>{getCategoryName(i.category_id)}</td>
                  <td>{getShopName(i.shop_id)}</td>
                  <td>{i.item_type}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(i)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(i.id)}
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

            <h3>{editId ? "Edit Item" : "Add Item"}</h3>

            <input
              name="item_name"
              placeholder="Item Name"
              value={form.item_name}
              onChange={handleChange}
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
            />

            {/* GST */}
            <select value={form.gst_id} onChange={handleGSTChange}>
              <option value="">Select GST</option>
              {gstList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.gst_name} ({g.gst_percent}%)
                </option>
              ))}
            </select>

            <select
              name="item_type"
              value={form.item_type}
              onChange={handleChange}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <select
              name="shop_id"
              value={form.shop_id}
              onChange={handleChange}
            >
              <option value="">Select Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shop_name}
                </option>
              ))}
            </select>

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

export default ItemPage;