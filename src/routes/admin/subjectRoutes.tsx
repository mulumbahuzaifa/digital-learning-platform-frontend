import { Route } from "react-router-dom";
import SubjectManagement from "../../pages/admin/subjects/SubjectManagement";
import CreateSubject from "../../pages/admin/subjects/CreateSubject";
import EditSubject from "../../pages/admin/subjects/EditSubject";
import SubjectDetail from "../../pages/admin/subjects/SubjectDetail";

export const subjectRoutes = (
  <>
    <Route path="subjects" element={<SubjectManagement />} />
    <Route path="subjects/create" element={<CreateSubject />} />
    <Route path="subjects/:id" element={<SubjectDetail />} />
    <Route path="subjects/:id/edit" element={<EditSubject />} />
  </>
); 