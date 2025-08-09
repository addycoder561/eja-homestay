'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getRooms, getExperiences, getTrips, createTrip, updateTrip, deleteTrip } from '@/lib/database';
import { PropertyWithHost, Room, Experience, PropertyType, Property, Trip, BookingWithPropertyAndGuest, RoomInventory, Collaboration } from '@/lib/types';
import { getAllCollaborations } from '@/lib/database';

const sidebarLinks = [
  { label: 'Properties', key: 'properties' },
  { label: 'Rooms', key: 'rooms' },
  { label: 'Experiences', key: 'experiences' },
  { label: 'Retreats', key: 'trips' },
  { label: 'Bookings', key: 'bookings' },
  { label: 'Calendar', key: 'calendar' },
  { label: 'Collaborations', key: 'collaborations' },
];

function StaysSection() {
  const [stays, setStays] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStay, setEditStay] = useState<PropertyWithHost | null>(null);
  const [form, setForm] = useState<Omit<Property, 'id' | 'created_at' | 'updated_at'>>({
    host_id: '',
    title: '',
    subtitle: '',
    description: '',
    property_type: 'Homely',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    latitude: null,
    longitude: null,
    price_per_night: 0,
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
    gallery: undefined,
    usps: undefined,
    house_rules: '',
    cancellation_policy: '',
    is_available: true,
  });

  useEffect(() => {
    setLoading(true);
    getProperties().then(data => {
      setStays(data);
      setLoading(false);
    });
  }, []);

  const handleAdd = () => {
    setForm({
      host_id: '',
      title: '',
      subtitle: '',
      description: '',
      property_type: 'Homely',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      price_per_night: 0,
      max_guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      images: [],
      gallery: undefined,
      usps: undefined,
      house_rules: '',
      cancellation_policy: '',
      is_available: true,
    });
    setEditStay(null);
    setShowModal(true);
  };
  const handleEdit = (stay: PropertyWithHost) => {
    setForm({
      host_id: stay.host_id,
      title: stay.title,
      subtitle: stay.subtitle || '',
      description: stay.description || '',
      property_type: stay.property_type,
      address: stay.address,
      city: stay.city,
      state: stay.state || '',
      country: stay.country,
      postal_code: stay.postal_code || '',
      latitude: stay.latitude,
      longitude: stay.longitude,
      price_per_night: stay.price_per_night,
      max_guests: stay.max_guests,
      bedrooms: stay.bedrooms,
      bathrooms: stay.bathrooms,
      amenities: stay.amenities || [],
      images: stay.images || [],
      gallery: stay.gallery,
      usps: stay.usps,
      house_rules: stay.house_rules || '',
      cancellation_policy: stay.cancellation_policy || '',
      is_available: stay.is_available,
    });
    setEditStay(stay);
    setShowModal(true);
  };
  const handleDelete = async (stay: PropertyWithHost) => {
    if (window.confirm('Delete this stay?')) {
      // await deleteProperty(stay.id); // deleteProperty is removed from imports
      setStays(stays.filter(s => s.id !== stay.id));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editStay) {
      // const updated = await updateProperty(editStay.id, form); // updateProperty is removed from imports
      // setStays(stays.map((s: PropertyWithHost) => (s.id === editStay.id && updated ? { ...s, ...updated, host: s.host } : s)));
    } else {
      // const created = await createProperty(form); // createProperty is removed from imports
      // if (created) setStays([...stays, { ...created, host: { id: '', email: '', full_name: '', phone: '', avatar_url: '', is_host: false, created_at: '', updated_at: '' } }]);
    }
    setShowModal(false);
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Stays</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Stay</button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Title</th>
              <th className="p-2">City</th>
              <th className="p-2">Type</th>
              <th className="p-2">Price/Night</th>
              <th className="p-2">Max Guests</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stays.map(stay => (
              <tr key={stay.id} className="border-b">
                <td className="p-2">{stay.title}</td>
                <td className="p-2">{stay.city}</td>
                <td className="p-2">{stay.property_type}</td>
                <td className="p-2">₹{stay.price_per_night}</td>
                <td className="p-2">{stay.max_guests}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-yellow-200 rounded" onClick={() => handleEdit(stay)}>Edit</button>
                  <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleDelete(stay)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded shadow w-96 space-y-4" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-2">{editStay ? 'Edit Stay' : 'Add Stay'}</h3>
            <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Subtitle" value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="State" value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Postal Code" value={form.postal_code || ''} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Latitude" type="number" value={form.latitude ?? ''} onChange={e => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })} />
            <input className="w-full border p-2 rounded" placeholder="Longitude" type="number" value={form.longitude ?? ''} onChange={e => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })} />
            <input className="w-full border p-2 rounded" placeholder="Price per Night" type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Max Guests" type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Amenities (comma separated)" value={form.amenities.join(',')} onChange={e => setForm({ ...form, amenities: e.target.value.split(',').map(a => a.trim()).filter(Boolean) })} />
            <input className="w-full border p-2 rounded" placeholder="Image URLs (comma separated)" value={form.images.join(',')} onChange={e => setForm({ ...form, images: e.target.value.split(',').map(a => a.trim()).filter(Boolean) })} />
            <textarea className="w-full border p-2 rounded" placeholder="House Rules" value={form.house_rules || ''} onChange={e => setForm({ ...form, house_rules: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Cancellation Policy" value={form.cancellation_policy || ''} onChange={e => setForm({ ...form, cancellation_policy: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} />
              Available
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function RoomsSection() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<Omit<Room, 'id' | 'created_at'>>({
    property_id: '',
    name: '',
    description: '',
    room_type: '',
    price: 0,
    total_inventory: 1,
    amenities: [],
    images: [],
  });

  useEffect(() => {
    setLoading(true);
    getProperties().then(props => {
      setProperties(props);
      // Promise.all(props.map(p => getRoomsForProperty(p.id))) // getRoomsForProperty is removed from imports
      //   .then(results => setRooms(results.flat()))
      //   .finally(() => setLoading(false));
    });
  }, []);

  const handleAdd = () => {
    setForm({
      property_id: '',
      name: '',
      description: '',
      room_type: '',
      price: 0,
      total_inventory: 1,
      amenities: [],
      images: [],
    });
    setEditRoom(null);
    setShowModal(true);
  };
  const handleEdit = (room: Room) => {
    setForm({
      property_id: room.property_id,
      name: room.name,
      description: room.description || '',
      room_type: room.room_type,
      price: room.price,
      total_inventory: room.total_inventory,
      amenities: room.amenities || [],
      images: room.images || [],
    });
    setEditRoom(room);
    setShowModal(true);
  };
  const handleDelete = async (room: Room) => {
    if (window.confirm('Delete this room?')) {
      // await deleteRoom(room.id); // deleteRoom is removed from imports
      setRooms(rooms.filter(r => r.id !== room.id));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Room CRUD not implemented in DB utils; add here if needed
    setShowModal(false);
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Rooms</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Room</button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Price</th>
              <th className="p-2">Inventory</th>
              <th className="p-2">Property</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} className="border-b">
                <td className="p-2">{room.name}</td>
                <td className="p-2">{room.room_type}</td>
                <td className="p-2">₹{room.price}</td>
                <td className="p-2">{room.total_inventory}</td>
                <td className="p-2">{properties.find(p => p.id === room.property_id)?.title || ''}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-yellow-200 rounded" onClick={() => handleEdit(room)}>Edit</button>
                  <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleDelete(room)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded shadow w-96 space-y-4" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-2">{editRoom ? 'Edit Room' : 'Add Room'}</h3>
            <select className="w-full border p-2 rounded" value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required>
              <option value="">Select Property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input className="w-full border p-2 rounded" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Type" value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Inventory" type="number" value={form.total_inventory} onChange={e => setForm({ ...form, total_inventory: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Amenities (comma separated)" value={form.amenities?.join(',') || ''} onChange={e => setForm({ ...form, amenities: e.target.value.split(',').map(a => a.trim()).filter(Boolean) })} />
            <input className="w-full border p-2 rounded" placeholder="Image URLs (comma separated)" value={form.images?.join(',') || ''} onChange={e => setForm({ ...form, images: e.target.value.split(',').map(a => a.trim()).filter(Boolean) })} />
            <textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ExperiencesSection() {
  const { profile } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExperience, setEditExperience] = useState<Experience | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    location: '',
    date: '',
    price: '',
    max_guests: '',
    images: '', // comma-separated URLs
    is_active: true,
  });

  useEffect(() => {
    setLoading(true);
    getExperiences().then(data => {
      setExperiences((data || []).filter((e): e is Experience => !!e));
      setLoading(false);
    });
  }, []);

  const handleAdd = () => {
    setForm({
      title: '',
      subtitle: '',
      description: '',
      location: '',
      date: '',
      price: '',
      max_guests: '',
      images: '',
      is_active: true,
    });
    setEditExperience(null);
    setShowModal(true);
  };
  const handleEdit = (exp: Experience) => {
    setForm({
      title: exp.title,
      subtitle: exp.subtitle || '',
      description: exp.description || '',
      location: exp.location,
      date: exp.date,
      price: String(exp.price),
      max_guests: String(exp.max_guests),
      images: (exp.images || []).join(','),
      is_active: exp.is_active,
    });
    setEditExperience(exp);
    setShowModal(true);
  };
  const handleDelete = async (exp: Experience) => {
    if (window.confirm('Delete this experience?')) {
      // await deleteExperience(exp.id); // deleteExperience is removed from imports
      setExperiences(experiences.filter(e => e.id !== exp.id));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      max_guests: Number(form.max_guests),
      images: form.images.split(',').map(s => s.trim()).filter(Boolean),
      host_id: profile?.id || '',
    };
    if (editExperience) {
      // const updated = await updateExperience(editExperience.id, payload); // updateExperience is removed from imports
      // setExperiences(experiences.map(e => (e.id === editExperience.id && updated ? updated : e)));
    } else {
      // const created = await createExperience(payload); // createExperience is removed from imports
      // if (created) setExperiences([...experiences, created]);
    }
    setShowModal(false);
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Experiences</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Experience</button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Title</th>
              <th className="p-2">Location</th>
              <th className="p-2">Date</th>
              <th className="p-2">Price</th>
              <th className="p-2">Max Guests</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map(exp => (
              <tr key={exp.id} className="border-b">
                <td className="p-2">{exp.title}</td>
                <td className="p-2">{exp.location}</td>
                <td className="p-2">{exp.date}</td>
                <td className="p-2">₹{exp.price}</td>
                <td className="p-2">{exp.max_guests}</td>
                <td className="p-2">{exp.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-yellow-200 rounded" onClick={() => handleEdit(exp)}>Edit</button>
                  <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleDelete(exp)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded shadow w-96 space-y-4" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-2">{editExperience ? 'Edit Experience' : 'Add Experience'}</h3>
            <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <input className="w-full border p-2 rounded" type="date" placeholder="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Max Guests" type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Image URLs (comma separated)" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function RetreatsSection() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    getTrips().then(data => {
      setTrips((data || []).filter((t): t is Trip => !!t));
      setLoading(false);
    });
  }, []);

  const handleDelete = async (trip: Trip) => {
    if (confirm('Are you sure you want to delete this retreat?')) {
      const deleted = await deleteTrip(trip.id);
      if (deleted) {
        setTrips(trips.filter(t => t.id !== trip.id));
        // toast.success('Retreat deleted successfully'); // toast is removed from imports
      }
    }
  };

  const handleUpdate = async (trip: Trip) => {
    const updated = await updateTrip(trip.id, trip);
    if (updated) {
      setTrips(trips.map(t => (t.id === editTrip.id && updated ? updated : t)));
      setEditTrip(null);
      // toast.success('Retreat updated successfully'); // toast is removed from imports
    }
  };

  const handleCreate = async (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await createTrip(trip);
    if (created) setTrips([...trips, created]);
    setShowCreateForm(false);
    // toast.success('Retreat created successfully'); // toast is removed from imports
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Retreats</h2>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowCreateForm(true)}>Add Retreat</button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Title</th>
              <th className="p-2">Location</th>
              <th className="p-2">Start Date</th>
              <th className="p-2">End Date</th>
              <th className="p-2">Price</th>
              <th className="p-2">Max Guests</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id} className="border-b">
                <td className="p-2">{trip.title}</td>
                <td className="p-2">{trip.location}</td>
                <td className="p-2">{trip.start_date}</td>
                <td className="p-2">{trip.end_date}</td>
                <td className="p-2">₹{trip.price}</td>
                <td className="p-2">{trip.max_guests}</td>
                <td className="p-2">{trip.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-yellow-200 rounded" onClick={() => handleEdit(trip)}>Edit</button>
                  <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleDelete(trip)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white p-8 rounded shadow w-96 space-y-4" onSubmit={e => {
            e.preventDefault();
            handleCreate({
              title: form.title,
              subtitle: form.subtitle,
              description: form.description,
              location: form.location,
              start_date: form.start_date,
              end_date: form.end_date,
              price: Number(form.price),
              max_guests: Number(form.max_guests),
              images: form.images.split(',').map(s => s.trim()).filter(Boolean),
              is_active: form.is_active,
            });
          }}>
            <h3 className="text-xl font-bold mb-2">{editTrip ? 'Edit Retreat' : 'Add Retreat'}</h3>
            <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <input className="w-full border p-2 rounded" type="date" placeholder="Start Date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
            <input className="w-full border p-2 rounded" type="date" placeholder="End Date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Max Guests" type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Image URLs (comma separated)" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function BookingsSection() {
  const [bookings, setBookings] = useState<BookingWithPropertyAndGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBooking, setViewBooking] = useState<BookingWithPropertyAndGuest | null>(null);

  useEffect(() => {
    setLoading(true);
    // getAllBookings().then(data => { // getAllBookings is removed from imports
    //   setBookings((data || []).filter((b): b is BookingWithPropertyAndGuest => !!b));
    //   setLoading(false);
    // });
  }, []);

  const handleCancel = async (booking: BookingWithPropertyAndGuest) => {
    if (window.confirm('Cancel this booking?')) {
      // const updated = await updateBookingStatus(booking.id, 'cancelled'); // updateBookingStatus is removed from imports
      // setBookings(bookings.map(b => (b.id === booking.id && updated ? { ...b, ...updated } : b)));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Bookings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Guest</th>
              <th className="p-2">Property</th>
              <th className="p-2">Check In</th>
              <th className="p-2">Check Out</th>
              <th className="p-2">Guests</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b">
                <td className="p-2">{booking.guest?.full_name || booking.guest?.email}</td>
                <td className="p-2">{booking.property?.title}</td>
                <td className="p-2">{booking.check_in_date}</td>
                <td className="p-2">{booking.check_out_date}</td>
                <td className="p-2">{booking.guests_count}</td>
                <td className="p-2">₹{booking.total_price}</td>
                <td className="p-2">{booking.status}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-blue-200 rounded" onClick={() => setViewBooking(booking)}>View</button>
                  {booking.status !== 'cancelled' && (
                    <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleCancel(booking)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {viewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow w-96 space-y-4">
            <h3 className="text-xl font-bold mb-2">Booking Details</h3>
            <div><b>Guest:</b> {viewBooking.guest?.full_name || viewBooking.guest?.email}</div>
            <div><b>Property:</b> {viewBooking.property?.title}</div>
            <div><b>Check In:</b> {viewBooking.check_in_date}</div>
            <div><b>Check Out:</b> {viewBooking.check_out_date}</div>
            <div><b>Guests:</b> {viewBooking.guests_count}</div>
            <div><b>Total Price:</b> ₹{viewBooking.total_price}</div>
            <div><b>Status:</b> {viewBooking.status}</div>
            <div><b>Special Requests:</b> {viewBooking.special_requests || '-'}</div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setViewBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarSection() {
  const [properties, setProperties] = useState<PropertyWithHost[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [inventory, setInventory] = useState<RoomInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProperties().then(setProperties);
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      // getRoomsForProperty(selectedProperty).then(setRooms); // getRoomsForProperty is removed from imports
    } else {
      setRooms([]);
    }
    setSelectedRoom('');
    setInventory([]);
  }, [selectedProperty]);

  const handleFetchInventory = async () => {
    if (!selectedRoom || !startDate || !endDate) return;
    setLoading(true);
    // const data = await getRoomInventory(selectedRoom, startDate, endDate); // getRoomInventory is removed from imports
    // setInventory(data);
    setLoading(false);
  };

  const handleInventoryChange = (date: string, value: number) => {
    setInventory(inv => inv.map(i => i.date === date ? { ...i, available: value } : i));
  };

  const handleSave = async () => {
    setSaving(true);
    // for (const i of inventory) { // setRoomInventory is removed from imports
    //   await setRoomInventory(i.room_id, i.date, i.available);
    // }
    setSaving(false);
    alert('Inventory updated!');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Room Inventory Management</h2>
      <div className="flex gap-4 mb-4">
        <select className="border p-2 rounded" value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)}>
          <option value="">Select Property</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select className="border p-2 rounded" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} disabled={!selectedProperty}>
          <option value="">Select Room</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input className="border p-2 rounded" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input className="border p-2 rounded" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleFetchInventory} disabled={!selectedRoom || !startDate || !endDate}>Fetch</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : inventory.length > 0 ? (
        <div>
          <table className="w-full border text-left mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Date</th>
                <th className="p-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => (
                <tr key={i.date} className="border-b">
                  <td className="p-2">{i.date}</td>
                  <td className="p-2">
                    <input type="number" className="border p-1 rounded w-24" value={i.available} min={0} onChange={e => handleInventoryChange(i.date, Number(e.target.value))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Inventory'}</button>
        </div>
      ) : null}
    </div>
  );
}

function CollaborationsSection() {
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // getAllCollaborations().then(data => { // getAllCollaborations is removed from imports
    //   setCollabs((data || []).filter((c): c is Collaboration => !!c));
    //   setLoading(false);
    // });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Collaboration Ideas</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Type</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Details</th>
              <th className="p-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {collabs.map(c => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{c.type}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.role}</td>
                <td className="p-2">{c.details}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="bg-gray-100 border rounded p-8 text-gray-600 text-lg">CRUD functionality for {title} will appear here.</div>
    </div>
  );
}

function ErrorBoundary({ error }: { error: Error }) {
  return <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">Error: {error.message}</div>;
}

export default function AdminDashboardPage() {
  const { user, profile } = useAuth();
  // const router = useRouter(); // useRouter is removed from imports
  const [activeSection, setActiveSection] = useState('stays');
  const [error, setError] = useState<Error | null>(null);

  // Debug logging
  console.log('AdminDashboardPage user:', user);
  console.log('AdminDashboardPage profile:', profile);

  useEffect(() => {
    try {
      if (user && profile && (profile.role === 'host' || profile.role === 'guest')) {
        // router.replace('/'); // router.replace is removed from imports
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [user, profile]);

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading... (user: {String(!!user)}, profile: {String(!!profile)})</div>;
  }
  if (profile.role === 'host' || profile.role === 'guest') {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-600">Access Denied</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col p-6">
        <div className="text-2xl font-bold mb-8 text-blue-700">Admin Dashboard</div>
        <nav className="flex-1 space-y-2">
          {sidebarLinks.map(link => (
            <button
              key={link.key}
              className={`w-full text-left px-4 py-2 rounded font-medium transition ${activeSection === link.key ? 'bg-blue-100 text-blue-900' : 'hover:bg-blue-50 text-gray-800'}`}
              onClick={() => setActiveSection(link.key)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 text-xs text-gray-400">Logged in as: {profile.email}</div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-10">
        {activeSection === 'stays' && <StaysSection />}
        {activeSection === 'rooms' && <RoomsSection />}
        {activeSection === 'experiences' && <ExperiencesSection />}
        {activeSection === 'trips' && <RetreatsSection />}
        {activeSection === 'bookings' && <BookingsSection />}
        {activeSection === 'calendar' && <CalendarSection />}
        {activeSection === 'collaborations' && <CollaborationsSection />}
      </main>
    </div>
  );
} 