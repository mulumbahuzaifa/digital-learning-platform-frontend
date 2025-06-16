import Sidebar from "../ui/sidebar/Sidebar";
import AdminNavbar from "../ui/navbar/AdminNavbar";
import FooterAdmin from "../ui/FooterAdmin";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="h-screen bg-gray-50">
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
        <AdminNavbar />

        {/* Main Content */}
        <div className="px-4 md:px-6 py-4 w-full mx-auto min-h-[calc(100vh-64px)]">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <Outlet />
          </div>
          <FooterAdmin />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
