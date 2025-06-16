import React from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../ui/sidebar/TeacherSidebar";
import FooterAdmin from "../ui/FooterAdmin";
import TeacherNavbar from "../ui/navbar/TeacherNavbar";

interface TeacherLayoutProps {
  children?: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSidebar />

      <div className="flex flex-col flex-1 w-full md:ml-64">
        <TeacherNavbar />

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

export default TeacherLayout;
