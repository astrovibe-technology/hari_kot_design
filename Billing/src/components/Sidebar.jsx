// import React from "react";
// import * as Icons from "react-icons/fa";
// import {
//   FaAngleLeft,
//   FaAngleRight
// } from "react-icons/fa";
// import { useNavigate, useLocation } from "react-router-dom";
// import logo from "../assets/hari.png";

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const menus = JSON.parse(localStorage.getItem("menus") || "[]");

//   return (
//     <div className={`sidebar ${isOpen ? "open" : "closed"}`}>

//       <div className="toggle-btn" onClick={toggleSidebar}>
//         {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
//       </div>

//       <div className="logo-container">
//         <img src={logo} alt="logo" />
//         {isOpen && <span>Hari Billing</span>}
//       </div>

//       <ul>
//         {menus.map((menu) => {
//           const IconComponent = Icons[menu.icon] || Icons.FaCircle;

//           return (
//             <li
//               key={menu.id}
//               className={location.pathname === menu.path ? "active" : ""}
//               onClick={() => navigate(menu.path)}
//             >
//               <IconComponent />
//               {isOpen && menu.name}
//             </li>
//           );
//         })}
//       </ul>

//     </div>
//   );
// };

// export default Sidebar;
import React, { useState } from "react";
import * as Icons from "react-icons/fa";
import {
  FaAngleLeft,
  FaAngleRight,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/hari.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = JSON.parse(localStorage.getItem("menus") || "[]");

  const [openMenu, setOpenMenu] = useState(null);

  // 🔥 BUILD TREE (parent → child)
  const buildTree = (menus) => {
    const map = {};
    const roots = [];

    menus.forEach((m) => {
      map[m.id] = { ...m, children: [] };
    });

    menus.forEach((m) => {
      if (m.parent_id) {
        map[m.parent_id]?.children.push(map[m.id]);
      } else {
        roots.push(map[m.id]);
      }
    });

    return roots;
  };

  const menuTree = buildTree(menus);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>

      {/* TOGGLE */}
      <div className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
      </div>

      {/* LOGO */}
      <div className="logo-container">
        <img src={logo} alt="logo" />
        {isOpen && <span>Hari Billing</span>}
      </div>

      {/* MENU */}
      <ul>
        {menuTree.map((menu) => {
          const IconComponent = Icons[menu.icon] || Icons.FaCircle;
          const hasChildren = menu.children.length > 0;

          const menuName = menu.menu_name || menu.name || "No Name";

          return (
            <li key={menu.id} style={{ display: "block" }}>

              {/* MAIN MENU */}
              <div
                className={location.pathname === menu.path ? "active" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (hasChildren) {
                    setOpenMenu(openMenu === menu.id ? null : menu.id);
                  } else {
                    navigate(menu.path || "#");
                  }
                }}
              >
                <IconComponent />

                {isOpen && (
                  <>
                    <span>{menuName}</span>

                    {hasChildren && (
                      <span style={{ marginLeft: "auto" }}>
                        {openMenu === menu.id ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* SUBMENU BELOW */}
              {hasChildren && openMenu === menu.id && isOpen && (
                <ul style={{ paddingLeft: "20px" }}>
                  {menu.children.map((child) => {
                    const ChildIcon =
                      Icons[child.icon] || Icons.FaRegCircle;

                    const childName =
                      child.menu_name || child.name || "No Name";

                    return (
                      <li
                        key={child.id}
                        onClick={(e) => {
                          e.stopPropagation(); // 🔥 prevent parent click
                          navigate(child.path || "#");
                        }}
                        className={
                          location.pathname === child.path
                            ? "active"
                            : ""
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px",
                          cursor: "pointer"
                        }}
                      >
                        <ChildIcon size={12} />
                        {isOpen && <span>{childName}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}

            </li>
          );
        })}
      </ul>

    </div>
  );
};

export default Sidebar;