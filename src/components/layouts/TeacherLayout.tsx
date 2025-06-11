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
    <>
      <TeacherSidebar />
      <div className="relative md:ml-64 bg-blueGray-100 min-h-screen">
        <TeacherNavbar />

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

export default TeacherLayout;
