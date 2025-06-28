import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@radix-ui/themes';
import { useState, useEffect } from 'react';
import AttendanceForm from '../../../components/admin/AttendanceForm';
import { useAttendanceMutation } from '../../../hooks/useAttendanceMutation';
import { attendanceService } from '../../../services/attendanceService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Attendance, UpdateAttendanceData } from '../../../types';
import toast from 'react-hot-toast';

const AttendanceEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateAttendance, submitAttendance } = useAttendanceMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  // Fetch attendance data for editing
  const { data: attendance, isLoading, error } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => (id ? attendanceService.getAttendanceById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
    retry: 1
  });

  // Handle error case
  useEffect(() => {
    if (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance record');
      navigate('/admin/attendance');
    }
  }, [error, navigate]);

  const handleUpdateAttendance = async (data: UpdateAttendanceData | any) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await updateAttendance.mutateAsync({ id, data: data as UpdateAttendanceData });
      toast.success('Attendance record updated successfully');
      navigate(`/admin/attendance/${id}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAttendance = async (attendanceId: string) => {
    try {
      setIsSubmittingAttendance(true);
      await submitAttendance.mutateAsync(attendanceId);
      toast.success('Attendance record submitted successfully');
      navigate(`/admin/attendance/${attendanceId}`);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to submit attendance record');
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !attendance) {
    return (
      <Card size="4">
        <div>Failed to load attendance record. Please try again.</div>
      </Card>
    );
  }

  // Type assertion to ensure attendance is treated as Attendance type
  const attendanceData = attendance as Attendance;

  // Don't allow editing if attendance is already submitted or verified
  if (attendanceData.isSubmitted || attendanceData.isVerified) {
    navigate(`/admin/attendance/${id}`);
    return null;
  }

  return (
    <Card size="4">
      <AttendanceForm
        mode="edit"
        initialData={attendanceData}
        onSubmit={handleUpdateAttendance}
        onSubmitAttendance={handleSubmitAttendance}
        isSubmitting={isSubmitting || updateAttendance.isPending}
        isSubmitAttendancePending={isSubmittingAttendance || submitAttendance.isPending}
      />
    </Card>
  );
};

export default AttendanceEdit; 