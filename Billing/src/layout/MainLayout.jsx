// import React, { useState } from "react";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import { Routes, Route } from "react-router-dom";

// // import Dashboard from "../pages/Dashboard";
// import Billing from "../pages/Billing";
// // import Settings from "../pages/Settings";
// import Printers from "../pages/PrinterMapping";

// const MainLayout = () => {
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <>
//       <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
//       <Navbar isOpen={isOpen} />

//       <div className={`content ${isOpen ? "open" : "closed"}`}>

//         <Routes>
//           {/* <Route path="/" element={<Dashboard />} /> */}
//           <Route path="/billing" element={<Billing />} />
//           {/* <Route path="/settings" element={<Settings />} /> */}
//           <Route path="/printers" element={<Printers />} />
//         </Routes>

//       </div>
//     </>
//   );
// };

// export default MainLayout;
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
      <Navbar isOpen={isOpen} />

      <div className={`content ${isOpen ? "open" : "closed"}`}>
        <Outlet /> 
      </div>
    </>
  );
};

export default MainLayout