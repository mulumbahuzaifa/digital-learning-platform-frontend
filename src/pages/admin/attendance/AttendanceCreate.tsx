import { Card } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import AttendanceForm from '../../../components/admin/AttendanceForm';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { CreateAttendanceData } from '../../../types';

const AttendanceCreate = () => {
  const navigate = useNavigate();
  const { createAttendance } = useAttendanceMutation();

  const handleCreateAttendance = async (data: CreateAttendanceData | any) => {
    await createAttendance.mutateAsync(data as CreateAttendanceData);
    navigate('/admin/attendance');
  };

  return (
    <Card size="4">
      <AttendanceForm
        mode="create"
        onSubmit={handleCreateAttendance}
        isSubmitting={createAttendance.isPending}
      />
    </Card>
  );
};

export default AttendanceCreate; 