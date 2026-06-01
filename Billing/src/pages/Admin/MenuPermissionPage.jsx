// import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";

// const API = "http://127.0.0.1:8000";

// const MenuPermissionPage = () => {

//   const [menus, setMenus] = useState([]);
//   const [shops, setShops] = useState([]);        // ✅ NEW
//   const [selectedMenus, setSelectedMenus] = useState([]);
//   const [role, setRole] = useState("Cashier");
//   const [shopId, setShopId] = useState("");      // ✅ NEW

//   // ---------------- FETCH MENUS ----------------
//   const fetchMenus = async () => {
//     const res = await fetch(`${API}/menus/list`);
//     const data = await res.json();
//     setMenus(data.data || []);
//   };

//   // ---------------- FETCH SHOPS ----------------
//   const fetchShops = async () => {
//     const res = await fetch(`${API}/shops/list`);
//     const data = await res.json();
//     setShops(data.data || []);
//   };

//   useEffect(() => {
//     fetchMenus();
//     fetchShops();   // ✅ NEW
//   }, []);

//   // ---------------- SELECT ----------------
//   const handleSelect = (menuId) => {
//     setSelectedMenus((prev) =>
//       prev.includes(menuId)
//         ? prev.filter((id) => id !== menuId)
//         : [...prev, menuId]
//     );
//   };

//   // ---------------- SAVE ----------------
//   const handleSave = async () => {
//     try {
//       if (selectedMenus.length === 0) {
//         return Swal.fire("Error", "Select at least one menu", "error");
//       }

//       // ✅ VALIDATE SHOP (for staff use case)
//       if (!shopId) {
//         return Swal.fire("Error", "Select shop", "error");
//       }

//       const params = new URLSearchParams({
//         role: role,
//         shop_id: shopId,   // ✅ SEND SHOP ID
//         can_view: true,
//         can_add: false,
//         can_edit: false,
//         can_delete: false,
//       });

//       const res = await fetch(
//         `${API}/menus/assign-permission?${params.toString()}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(selectedMenus),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         let msg = "Something went wrong";

//         if (Array.isArray(data.detail)) {
//           msg = data.detail.map(e => e.msg).join(", ");
//         } else if (typeof data.detail === "string") {
//           msg = data.detail;
//         }

//         throw new Error(msg);
//       }

//       Swal.fire("Success", "Permissions updated", "success");
//       setSelectedMenus([]);

//     } catch (err) {
//       Swal.fire("Error", err.message, "error");
//     }
//   };

//  return (
//   <div className="container-fluid mt-3">

//     <div className="card shadow-sm p-3">
//       <h4 className="mb-3 text-center">🔐 Menu Permission</h4>

//       {/* ROW */}
//       <div className="row">

//         {/* LEFT SIDE */}
//         <div className="col-md-4 col-12 mb-3">

//           {/* ROLE */}
//           <label className="form-label">Select Role</label>
//           <select
//             className="form-select mb-3"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//           >
//             <option value="Cashier">Cashier</option>
//             <option value="admin">Admin</option>
//             <option value="shop_staff">Staff</option>
//           </select>

//           {/* SHOP */}
//           <label className="form-label">Select Shop</label>
//           <select
//             className="form-select"
//             value={shopId}
//             onChange={(e) => setShopId(e.target.value)}
//           >
//             <option value="">Select Shop</option>
//             {shops.map((shop) => (
//               <option key={shop.id} value={shop.id}>
//                 {shop.shop_name}
//               </option>
//             ))}
//           </select>

//         </div>

//         {/* RIGHT SIDE - MENUS */}
//         <div className="col-md-8 col-12">

//           <div
//             className="card p-3"
//             style={{ maxHeight: "400px", overflowY: "auto" }}
//           >
//             <div className="row">
//               {menus.map((menu) => (
//                 <div key={menu.id} className="col-md-6 col-12 mb-2">

//                   <div className="form-check">
//                     <input
//                       type="checkbox"
//                       className="form-check-input"
//                       checked={selectedMenus.includes(menu.id)}
//                       onChange={() => handleSelect(menu.id)}
//                       id={`menu-${menu.id}`}
//                     />

//                     <label
//                       className="form-check-label"
//                       htmlFor={`menu-${menu.id}`}
//                     >
//                       {menu.menu_name}
//                     </label>
//                   </div>

//                 </div>
//               ))}
//             </div>
//           </div>

//         </div>

//       </div>

//       {/* SAVE BUTTON */}
//       <div className="text-center mt-3">
//         <button
//           className="btn btn-success px-4"
//           onClick={handleSave}
//         >
//           Save Permission
//         </button>
//       </div>

//     </div>

//   </div>
// );
// };

// export default MenuPermissionPage;
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_BASE_URL;

const MenuPermissionPage = () => {
  const [menus, setMenus] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [role, setRole] = useState("Cashier");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= FETCH MENUS =================
  const fetchMenus = async () => {
    const res = await fetch(`${API}/menus/list`);
    const data = await res.json();
    setMenus(data.data || []);
  };

  // ================= FETCH SHOPS =================
  const fetchShops = async () => {
    const res = await fetch(`${API}/shops/list`);
    const data = await res.json();
    setShops(data.data || []);
  };

  // ================= FETCH PERMISSIONS =================
  const fetchPermissions = async () => {
    try {
      setLoading(true);

      let url = "";

      // ✅ STAFF → requires shop
      if (role === "shop_staff") {
        if (!shopId) {
          setSelectedMenus([]); // clear
          return;
        }
        url = `${API}/menus/role/${role}?shop_id=${shopId}`;
      } 
      // ✅ ADMIN / CASHIER → no shop
      else {
        url = `${API}/menus/role/${role}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status) {
        const ids = data.data.map((m) => m.menu_id);
        setSelectedMenus(ids);
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= INIT =================
  useEffect(() => {
    fetchMenus();
    fetchShops();
  }, []);

  // ================= LOAD WHEN CHANGE =================
  useEffect(() => {
    fetchPermissions();
  }, [role, shopId]);

  // ================= TOGGLE =================
  const handleSelect = (menuId) => {
    setSelectedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      let params = new URLSearchParams({
        role: role,
        can_view: true,
        can_add: false,
        can_edit: false,
        can_delete: false,
      });

      // ✅ only for staff
      if (role === "shop_staff") {
        if (!shopId) {
          return Swal.fire("Error", "Select shop", "error");
        }
        params.append("shop_id", shopId);
      }

      const res = await fetch(
        `${API}/menus/assign-permission?${params.toString()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedMenus),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed");

      Swal.fire("Success", "Permissions updated", "success");

    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ================= UI =================
  return (
    <div className="container-fluid mt-3">

      <div className="card shadow p-3">

        <h4 className="text-center mb-3">🔐 Menu Permission</h4>

        <div className="row">

          {/* LEFT PANEL */}
          <div className="col-md-4 col-12 mb-3">

            {/* ROLE */}
            <label className="form-label">Select Role</label>
            <select
              className="form-select mb-3"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setShopId(""); // reset shop
                setSelectedMenus([]); // reset menus
              }}
            >
              <option value="Cashier">Cashier</option>
              <option value="admin">Admin</option>
              <option value="shop_staff">Staff</option>
            </select>

            {/* SHOP (ONLY FOR STAFF) */}
            {role === "shop_staff" && (
              <>
                <label className="form-label">Select Shop</label>
                <select
                  className="form-select"
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
              </>
            )}

          </div>

          {/* RIGHT PANEL */}
          <div className="col-md-8 col-12">

            <div
              className="card p-3"
              style={{ maxHeight: "450px", overflowY: "auto" }}
            >

              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div className="row">

                  {menus.map((menu) => (
                    <div key={menu.id} className="col-md-6 col-12 mb-2">

                      <div className="form-check">

                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedMenus.includes(menu.id)}
                          onChange={() => handleSelect(menu.id)}
                          id={`menu-${menu.id}`}
                        />

                        <label
                          className="form-check-label"
                          htmlFor={`menu-${menu.id}`}
                        >
                          {menu.menu_name}
                        </label>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="text-center mt-3">
          <button className="btn btn-success px-4" onClick={handleSave}>
            Save Permission
          </button>
        </div>

      </div>

    </div>
  );
};

export default MenuPermissionPage;