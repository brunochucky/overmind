

import { MeetingDetailClient } from '@/components/meeting-detail-client';

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
  return <MeetingDetailClient meetingId={params.id} />;
}
