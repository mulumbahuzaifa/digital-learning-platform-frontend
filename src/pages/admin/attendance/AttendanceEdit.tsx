import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@radix-ui/themes';
import AttendanceForm from '../../../components/admin/AttendanceForm';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { attendanceService } from '../../../services/attendanceService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { UpdateAttendanceData } from '../../../types';

const AttendanceEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateAttendance, submitAttendance } = useAttendanceMutation();

  // Fetch attendance data for editing
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => (id ? attendanceService.getAttendanceById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });

  const handleUpdateAttendance = async (data: UpdateAttendanceData | any) => {
    if (id) {
      await updateAttendance.mutateAsync({ id, data: data as UpdateAttendanceData });
      navigate(`/admin/attendance/${id}`);
    }
  };

  const handleSubmitAttendance = async (attendanceId: string) => {
    await submitAttendance.mutateAsync(attendanceId);
    navigate(`/admin/attendance/${attendanceId}`);
  };

  if (isLoading || !attendance) {
    return <LoadingSpinner />;
  }

  // Don't allow editing if attendance is already submitted or verified
  if (attendance.isSubmitted || attendance.isVerified) {
    navigate(`/admin/attendance/${id}`);
    return null;
  }

  return (
    <Card size="4">
      <AttendanceForm
        mode="edit"
        initialData={attendance}
        onSubmit={handleUpdateAttendance}
        onSubmitAttendance={handleSubmitAttendance}
        isSubmitting={updateAttendance.isPending}
        isSubmitAttendancePending={submitAttendance.isPending}
      />
    </Card>
  );
};

export default AttendanceEdit; 