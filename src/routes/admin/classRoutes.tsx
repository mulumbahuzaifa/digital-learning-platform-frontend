import { Route } from "react-router-dom";
import ClassManagement from "../../pages/admin/classes/ClassManagement";
import ClassCreate from "../../pages/admin/classes/ClassCreate";
import ClassEdit from "../../pages/admin/classes/ClassEdit";
import ClassView from "../../pages/admin/classes/ClassView";
import AddSubjectToClass from "../../pages/admin/classes/AddSubjectToClass";
import AddStudentToClass from "../../pages/admin/classes/AddStudentToClass";
import AssignTeacherToSubject from "../../pages/admin/classes/AssignTeacherToSubject";
import AssignPrefect from "../../pages/admin/classes/AssignPrefect";

export const classRoutes = (
  <>
    <Route path="classes" element={<ClassManagement />} />
    <Route path="classes/create" element={<ClassCreate />} />
    <Route path="classes/:id" element={<ClassView />} />
    <Route path="classes/:id/edit" element={<ClassEdit />} />
    <Route path="classes/:id/subjects/add" element={<AddSubjectToClass />} />
    <Route path="classes/:id/students/add" element={<AddStudentToClass />} />
    <Route 
      path="classes/:id/subjects/:subjectId/teachers/assign" 
      element={<AssignTeacherToSubject />} 
    />
    <Route path="classes/:id/prefects/assign" element={<AssignPrefect />} />
  </>
); 