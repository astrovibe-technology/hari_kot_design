import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API = "http://127.0.0.1:8000";

const MenuPermissionPage = () => {

  const [menus, setMenus] = useState([]);
  const [shops, setShops] = useState([]);        // ✅ NEW
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [role, setRole] = useState("Cashier");
  const [shopId, setShopId] = useState("");      // ✅ NEW

  // ---------------- FETCH MENUS ----------------
  const fetchMenus = async () => {
    const res = await fetch(`${API}/menus/list`);
    const data = await res.json();
    setMenus(data.data || []);
  };

  // ---------------- FETCH SHOPS ----------------
  const fetchShops = async () => {
    const res = await fetch(`${API}/shops/list`);
    const data = await res.json();
    setShops(data.data || []);
  };

  useEffect(() => {
    fetchMenus();
    fetchShops();   // ✅ NEW
  }, []);

  // ---------------- SELECT ----------------
  const handleSelect = (menuId) => {
    setSelectedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {
      if (selectedMenus.length === 0) {
        return Swal.fire("Error", "Select at least one menu", "error");
      }

      // ✅ VALIDATE SHOP (for staff use case)
      if (!shopId) {
        return Swal.fire("Error", "Select shop", "error");
      }

      const params = new URLSearchParams({
        role: role,
        shop_id: shopId,   // ✅ SEND SHOP ID
        can_view: true,
        can_add: false,
        can_edit: false,
        can_delete: false,
      });

      const res = await fetch(
        `${API}/menus/assign-permission?${params.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedMenus),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        let msg = "Something went wrong";

        if (Array.isArray(data.detail)) {
          msg = data.detail.map(e => e.msg).join(", ");
        } else if (typeof data.detail === "string") {
          msg = data.detail;
        }

        throw new Error(msg);
      }

      Swal.fire("Success", "Permissions updated", "success");
      setSelectedMenus([]);

    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="container mt-3">

      <h3>🔐 Menu Permission</h3>

      {/* ROLE */}
      <div className="mb-3">
        <select
          className="form-control"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Cashier">Cashier</option>
          <option value="admin">Admin</option>
          <option value="shop_staff">Staff</option> {/* optional */}
        </select>
      </div>

      {/* ✅ SHOP DROPDOWN */}
      <div className="mb-3">
        <select
          className="form-control"
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
        >
          <option value="">Select Shop</option>

          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.shop_name}
            </option>
          ))}
        </select>
      </div>

      {/* MENU LIST */}
      <div className="card p-3">
        {menus.map((menu) => (
          <div key={menu.id} className="form-check">

            <input
              type="checkbox"
              className="form-check-input"
              checked={selectedMenus.includes(menu.id)}
              onChange={() => handleSelect(menu.id)}
            />

            <label className="form-check-label">
              {menu.menu_name}
            </label>

          </div>
        ))}
      </div>

      {/* SAVE */}
      <button
        className="btn btn-success mt-3"
        onClick={handleSave}
      >
        Save Permission
      </button>

    </div>
  );
};

export default MenuPermissionPage;