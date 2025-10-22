'use client';

import { useState, useEffect } from 'react';
import { api } from '@/libs/api';

export default function DebugEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching public events...');
        const publicResponse = await api.events.getAll();
        console.log('Public events response:', publicResponse.data);
        setEvents(publicResponse.data.data?.events || []);

        console.log('Fetching organizer events...');
        const token = localStorage.getItem('token');
        if (token) {
          const organizerResponse = await api.events.getOrganizerEvents();
          console.log('Organizer events response:', organizerResponse.data);
          setOrganizerEvents(organizerResponse.data.data?.events || []);
        }
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Events Data</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Public Events ({events.length})</h2>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="border p-4 rounded">
              <h3 className="font-medium">{event.name}</h3>
              <p>Category: {event.category}</p>
              <p>Location: {event.location}</p>
              <p>Start Date: {event.startDate}</p>
              <p>Organizer: {event.organizer?.firstName} {event.organizer?.lastName}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Organizer Events ({organizerEvents.length})</h2>
        <div className="space-y-2">
          {organizerEvents.map((event) => (
            <div key={event.id} className="border p-4 rounded">
              <h3 className="font-medium">{event.name}</h3>
              <p>Category: {event.category}</p>
              <p>Location: {event.location}</p>
              <p>Start Date: {event.startDate}</p>
              <p>Is Active: {event.isActive ? 'Yes' : 'No'}</p>
              <p>Tickets Count: {event._count?.tickets || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
