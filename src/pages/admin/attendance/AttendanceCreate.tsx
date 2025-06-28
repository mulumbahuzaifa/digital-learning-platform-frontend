import { Card } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AttendanceForm from '../../../components/admin/AttendanceForm';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { CreateAttendanceData } from '../../../types';
import toast from 'react-hot-toast';

const AttendanceCreate = () => {
  const navigate = useNavigate();
  const { createAttendance } = useAttendanceMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAttendance = async (data: CreateAttendanceData | any) => {
    try {
      setIsSubmitting(true);
      await createAttendance.mutateAsync(data as CreateAttendanceData);
      toast.success('Attendance record created successfully');
      navigate('/admin/attendance');
    } catch (error) {
      console.error('Error creating attendance:', error);
      toast.error('Failed to create attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card size="4">
      <AttendanceForm
        mode="create"
        onSubmit={handleCreateAttendance}
        isSubmitting={isSubmitting || createAttendance.isPending}
      />
    </Card>
  );
};

export default AttendanceCreate; 