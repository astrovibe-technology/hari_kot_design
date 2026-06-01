import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_BASE_URL;

const CreateShop = () => {
  let user = {};
try {
  user = JSON.parse(localStorage.getItem("user")) || {};
} catch {
  user = {};
}
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    shop_name: "",
    phone: "",
    address: "",
    gst_number: "",
    staff_username: "",
    staff_email: "",
    staff_password: "",
    staff_full_name: "",
    staff_phone: "",
  });

  // ---------------- FETCH ----------------
  const fetchShops = async () => {
    const res = await fetch(`${API}/shops/list`);
    const data = await res.json();
    setShops(data.data || []);
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // ---------------- SEARCH FILTER ----------------
  const filteredShops = shops.filter((s) =>
    s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  // ---------------- INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- OPEN CREATE ----------------
  const openCreate = () => {
    setEditId(null);
    setForm({
      shop_name: "",
      phone: "",
      address: "",
      gst_number: "",
      staff_username: "",
      staff_email: "",
      staff_password: "",
      staff_full_name: "",
      staff_phone: "",
    });
    setShowModal(true);
  };

  // ---------------- OPEN EDIT ----------------
  const handleEdit = (shop) => {
    setForm(shop);
    setEditId(shop.id);
    setShowModal(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await fetch(`${API}/shops/delete/${id}`, {
      method: "DELETE",
    });

    Swal.fire("Deleted!", "", "success");
    fetchShops();
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
  try {
    let url = `${API}/shops/create-shop?login_user_id=${user.id}`;
    let method = "POST";

    if (editId) {
      url = `${API}/shops/update/${editId}?login_user_id=${user.id}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail);

    Swal.fire("Success", data.message, "success");

    setShowModal(false);
    fetchShops();

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
  // ---------------- TOGGLE STATUS ----------------
  const toggleStatus = async (shop) => {
    try {
      await fetch(`${API}/shops/update/${shop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !shop.is_active
        }),
      });

      fetchShops();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-3">
      
      {/* HEADER */}
    {/* HEADER */}
<div className="header d-flex justify-content-between align-items-center flex-wrap gap-2">

  <h3 className="mb-0">🏪 Shop Management</h3>

  <div className="d-flex align-items-center gap-2">

    <input
      type="text"
      className="form-control"
      placeholder="🔍 Search shop or phone..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        width: "300px",
        borderRadius: "8px"
      }}
    />

    <button className="add-btn" onClick={openCreate}>
      + Create Shop
    </button>

  </div>

</div>

     
      {/* <div className="mb-3">
        <input
          className="form-control"
          placeholder="🔍 Search shop or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}

{/* SEARCH + TABLE WRAPPER */}
<div className="table-box">


  {/* RESPONSIVE TABLE */}
  <div className="table-responsive">
    <table className="table table-hover mb-0">

      <thead className="table-primary">
        <tr>
          <th>Shop</th>
          <th>Phone</th>
          <th>GST</th>
          <th>Staff</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredShops.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center">
              No shops found
            </td>
          </tr>
        ) : (
          filteredShops.map((s) => (
            <tr key={s.id}>
              <td>{s.shop_name}</td>
              <td>{s.phone}</td>
              <td>{s.gst_number}</td>

              <td>
                <div>{s.staff_username}</div>
                <small>{s.staff_email}</small>
              </td>

              <td>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={s.is_active ?? true}
                    onChange={() => toggleStatus(s)}
                  />
                </div>
              </td>

              <td className="text-nowrap">
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEdit(s)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(s.id)}
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

            <h4>{editId ? "Edit Shop" : "Create Shop"}</h4>

            <input name="shop_name" placeholder="Shop Name" value={form.shop_name} onChange={handleChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="gst_number" placeholder="GST Number" value={form.gst_number} onChange={handleChange} />

            <input name="staff_username" placeholder="Username" value={form.staff_username} onChange={handleChange} />
            <input name="staff_email" placeholder="Email" value={form.staff_email} onChange={handleChange} />
            <input type="password" name="staff_password" placeholder="Password" value={form.staff_password} onChange={handleChange} />
            <input name="staff_full_name" placeholder="Full Name" value={form.staff_full_name} onChange={handleChange} />
            <input name="staff_phone" placeholder="Phone" value={form.staff_phone} onChange={handleChange} />

            <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />

            <div className="mt-3">
              <button className="btn btn-success me-2" onClick={handleSave}>
                {editId ? "Update" : "Save"}
              </button>

              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CreateShop;