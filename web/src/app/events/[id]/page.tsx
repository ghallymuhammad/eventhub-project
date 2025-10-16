import EventDetailPage from '@/components/EventDetailPage';

export default function EventPage({ params }: { params: { id: string } }) {
  return <EventDetailPage eventId={params.id} />;
}
