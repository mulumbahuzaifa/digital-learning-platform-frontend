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
    <>
      <StudentSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
        <StudentNavbar />

        {/* Main Content */}
        <div className="px-4 md:px-6 py-4 w-full mx-auto min-h-[calc(100vh-64px)]">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <Outlet />
          </div>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
};

export default StudentLayout;
