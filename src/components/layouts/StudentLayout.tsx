import React from "react";
import { Outlet } from "react-router-dom";
import FooterAdmin from "../ui/FooterAdmin";
import StudentNavbar from "../ui/navbar/StudentNavbar";
import StudentSidebar from "../ui/sidebar/StudentSidebar";

interface StudentLayoutProps {
  children?: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSidebar />

      <div className="flex flex-col flex-1 w-full md:ml-64">
        <StudentNavbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4">
            <Outlet />
          </div>
          <FooterAdmin />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
