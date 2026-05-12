// // import React from "react";
// // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// // import MainLayout from "./layout/MainLayout";
// // import Login from "./pages/Login";

// // // import Dashboard from "./pages/Dashboard";
// // import Billing from "./pages/Billing";
// // // import Settings from "./pages/Settings";
// // import Printers from "./pages/PrinterMapping";
// // import CreateShop from "./pages/Admin/CreateShop";


// // const PrivateRoute = ({ children }) => {
// //   const isLoggedIn = localStorage.getItem("isLoggedIn");
// //   return isLoggedIn ? children : <Navigate to="/login" />;
// // };

// // function App() {
// //   return (
// //     <BrowserRouter>

// //       <Routes>

// //         {/* LOGIN */}
// //         <Route path="/login" element={<Login />} />
         
// //         {/* PROTECTED ROUTES */}
// //         <Route
// //           path="/*"
// //           element={
// //             <PrivateRoute>
// //               <MainLayout>
// //                 <Routes>
// //                   {/* <Route path="/" element={<Dashboard />} /> */}
// //                   <Route path="/billing" element={<Billing />} />
// //                   {/* <Route path="/settings" element={<Settings />} /> */}
// //                   <Route path="/printers" element={<Printers />} />
// //                   <Route path="/create-shop" element={<CreateShop />} />
// //                 </Routes>
// //               </MainLayout>
// //             </PrivateRoute>
// //           }
// //         />

// //       </Routes>

// //     </BrowserRouter>
// //   );
// // }

// // export default App;
// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import MainLayout from "./layout/MainLayout";
// import Login from "./pages/Login";
// import Billing from "./pages/Billing";
// import Printers from "./pages/PrinterMapping";
// import CreateShop from "./pages/Admin/CreateShop";
// import GstPage from "./pages/Admin/GstPage";
// import CategoryPage from "./pages/Admin/CategoryPage";
// import ItemPage from "./pages/Admin/ItemPage";
// import MenuPermissionPage from "./pages/Admin/MenuPermissionPage";

// const PrivateRoute = ({ children }) => {
//   const isLoggedIn = localStorage.getItem("isLoggedIn");
//   return isLoggedIn ? children : <Navigate to="/login" />;
// };

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* LOGIN */}
//         <Route path="/login" element={<Login />} />

//         {/* PROTECTED LAYOUT */}
//         <Route
//           path="/"
//           element={
//             <PrivateRoute>
//               <MainLayout />
//             </PrivateRoute>
//           }
//         >
//           {/* CHILD ROUTES */}
//           <Route path="billing" element={<Billing />} />
//           <Route path="printers" element={<Printers />} />
//           <Route path="create-shop" element={<CreateShop />} />
//           <Route path="gstdetails" element={<GstPage />} />
//           <Route path="category-details" element={<CategoryPage />} />
//           <Route path="item-details" element={<ItemPage />} />
//           <Route path="menus-permission" element={<MenuPermissionPage />} />
//         </Route>

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Printers from "./pages/PrinterMapping";
import CreateShop from "./pages/Admin/CreateShop";
import GstPage from "./pages/Admin/GstPage";
import CategoryPage from "./pages/Admin/CategoryPage";
import ItemPage from "./pages/Admin/ItemPage";
import MenuPermissionPage from "./pages/Admin/MenuPermissionPage";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./layout/ProtectedRoute";
import Reports from "./pages/Admin/Reports";
import ItemWiseReport from "./pages/Admin/ItemWiseReport";
import BranchReport from "./pages/Admin/BranchReport";
import AdminDashboard from "./pages/Admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Login Page */}
        <Route path="/" element={<Login />} />

        {/* ✅ Protected Pages */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        > 

      
           <Route path="billing" element={<Billing />} />
           <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="printers" element={<Printers />} />
           <Route path="create-shop" element={<CreateShop />} />
           <Route path="gstdetails" element={<GstPage />} />
           <Route path="category-details" element={<CategoryPage />} />
           <Route path="item-details" element={<ItemPage />} />
           <Route path="menus-permission" element={<MenuPermissionPage />} />
           <Route path="overall-reports" element={<Reports />} />
           <Route path="itemwise-reports" element={<ItemWiseReport />} />
           <Route path="branch-reports" element={<BranchReport />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;