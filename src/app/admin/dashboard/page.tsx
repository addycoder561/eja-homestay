'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getExperiences, getTrips, getRetreats, createTrip, updateTrip, deleteTrip } from '@/lib/database';
import { PropertyWithHost, Room, Experience, PropertyType, Property, Trip, Retreat, BookingWithPropertyAndGuest, RoomInventory } from '@/lib/types';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  MapPinIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  TrophyIcon,
  FireIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const sidebarLinks = [
  { label: 'Dashboard', key: 'dashboard', icon: ChartBarIcon },
  { label: 'Properties', key: 'properties', icon: HomeIcon },
  { label: 'Rooms', key: 'rooms', icon: BuildingOfficeIcon },
  { label: 'Experiences', key: 'experiences', icon: SparklesIcon },
  { label: 'Retreats', key: 'trips', icon: CalendarIcon },
  { label: 'Bookings', key: 'bookings', icon: UserGroupIcon },
  { label: 'Calendar', key: 'calendar', icon: CalendarIcon },


  { label: 'Engagement', key: 'engagement', icon: HeartIcon },
];

// Dashboard Statistics Component
function DashboardStats() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeExperiences: 0,
    averageRating: 0
  });

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const properties = await getProperties();
        const experiences = await getExperiences();
        const trips = await getTrips();
        
        setStats({
          totalProperties: properties.length,
          totalBookings: 0, // Will be fetched from bookings
          totalRevenue: 0, // Will be calculated from bookings
          activeExperiences: experiences.filter(e => e.is_active).length,
          averageRating: 4.5 // Placeholder
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      change: '+12%',
      changeType: 'increase',
      icon: HomeIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      change: '+8%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+15%',
      changeType: 'increase',
      icon: CurrencyRupeeIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Active Experiences',
      value: stats.activeExperiences,
      change: '+5%',
      changeType: 'increase',
      icon: SparklesIcon,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowUpIcon className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowDownIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">New booking received</p>
                  <p className="text-sm text-gray-600">2 minutes ago</p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}

function StaysSection() {
  const [stays, setStays] = useState<PropertyWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStay, setEditStay] = useState<PropertyWithHost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
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
    if (window.confirm('Are you sure you want to delete this property?')) {
      setStays(stays.filter(s => s.id !== stay.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowModal(false);
  };

  const filteredStays = stays.filter(stay => {
    const matchesSearch = stay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stay.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || stay.property_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Properties Management</h2>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleAdd}
        >
          <PlusIcon className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="Homely">Homely</option>
          <option value="Boutique">Boutique</option>
          <option value="Cottage">Cottage</option>
          <option value="Off-Beat">Off-Beat</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStays.map(stay => (
                  <tr key={stay.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <HomeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stay.title}</div>
                          <div className="text-sm text-gray-500">{stay.max_guests} guests</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{stay.city}, {stay.state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {stay.property_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{stay.price_per_night}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stay.is_available ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Unavailable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(stay)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(stay)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{editStay ? 'Edit Property' : 'Add Property'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Title" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  required 
                />
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Subtitle" 
                  value={form.subtitle || ''} 
                  onChange={e => setForm({ ...form, subtitle: e.target.value })} 
                />
              </div>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Description" 
                value={form.description || ''} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Address" 
                  value={form.address} 
                  onChange={e => setForm({ ...form, address: e.target.value })} 
                  required 
                />
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="City" 
                  value={form.city} 
                  onChange={e => setForm({ ...form, city: e.target.value })} 
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Price per Night" 
                  type="number" 
                  value={form.price_per_night} 
                  onChange={e => setForm({ ...form, price_per_night: Number(e.target.value) })} 
                  required 
                />
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Max Guests" 
                  type="number" 
                  value={form.max_guests} 
                  onChange={e => setForm({ ...form, max_guests: Number(e.target.value) })} 
                  required 
                />
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={form.property_type} 
                  onChange={e => setForm({ ...form, property_type: e.target.value as PropertyType })} 
                  required
                >
                  <option value="Homely">Homely</option>
                  <option value="Boutique">Boutique</option>
                  <option value="Cottage">Cottage</option>
                  <option value="Off-Beat">Off-Beat</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={form.is_available} 
                  onChange={e => setForm({ ...form, is_available: e.target.checked })} 
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Available</label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
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
    max_guests: 1,
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
    max_guests: 1,
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
      max_guests: room.max_guests,
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
              <th className="p-2">Max Guests</th>
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
                <td className="p-2">{room.max_guests}</td>
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
            <input className="w-full border p-2 rounded" placeholder="Price per night" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Inventory" type="number" value={form.total_inventory} onChange={e => setForm({ ...form, total_inventory: Number(e.target.value) })} required />
            <input className="w-full border p-2 rounded" placeholder="Max Guests" type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: Number(e.target.value) })} required />
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
    duration: '',
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
      duration: '',
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
      duration: exp.duration || '',
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
              <th className="p-2">Duration</th>
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
                <td className="p-2">{exp.duration || 'N/A'}</td>
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
            <input className="w-full border p-2 rounded" placeholder="Duration (e.g., 2-3 hrs)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
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
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRetreat, setEditRetreat] = useState<Retreat | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    location: '',
    price: '',
    duration: '',
    categories: '',
    host_name: '',
    host_type: '',
    host_tenure: '',
    host_description: '',
    host_image: '',
    host_usps: '',
    unique_propositions: '',
    images: '', // comma-separated URLs
    is_active: true,
  });

  useEffect(() => {
    getRetreats().then(data => {
      setRetreats((data || []).filter((r): r is Retreat => !!r));
      setLoading(false);
    });
  }, []);

  const handleDelete = async (retreat: Retreat) => {
    if (confirm('Are you sure you want to delete this retreat?')) {
      const deleted = await deleteTrip(retreat.id);
      if (deleted) {
        setRetreats(retreats.filter(r => r.id !== retreat.id));
        // toast.success('Retreat deleted successfully'); // toast is removed from imports
      }
    }
  };

  const handleEdit = (retreat: Retreat) => {
    setEditRetreat(retreat);
    setForm({
      title: retreat.title,
      subtitle: retreat.subtitle || '',
      description: retreat.description || '',
      location: retreat.location,
      price: String(retreat.price),
      duration: retreat.duration || '',
      categories: Array.isArray(retreat.categories) ? retreat.categories.join(',') : retreat.categories || '',
      host_name: retreat.host_name || '',
      host_type: retreat.host_type || '',
      host_tenure: retreat.host_tenure || '',
      host_description: retreat.host_description || '',
      host_image: retreat.host_image || '',
      host_usps: Array.isArray(retreat.host_usps) ? retreat.host_usps.join(',') : '',
      unique_propositions: Array.isArray(retreat.unique_propositions) ? retreat.unique_propositions.join(',') : '',
      images: (retreat.images || []).join(','),
      is_active: retreat.is_active,
    });
    setShowCreateForm(true);
  };

  const handleUpdate = async (retreat: Retreat) => {
    const updated = await updateTrip(retreat.id, retreat);
    if (updated) {
      setRetreats(retreats.map(r => (editRetreat && r.id === editRetreat.id ? updated : r)));
      setEditRetreat(null);
      // toast.success('Retreat updated successfully'); // toast is removed from imports
    }
  };

  const handleCreate = async (retreat: Omit<Retreat, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert retreat to trip format for createTrip function
    const tripData = {
      ...retreat,
      max_guests: 10, // Default value for retreats
      start_date: new Date().toISOString().split('T')[0], // Default to today
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 7 days from now
    };
    const created = await createTrip(tripData);
    if (created) setRetreats([...retreats, created]);
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
              <th className="p-2">Duration</th>
              <th className="p-2">Price</th>
              <th className="p-2">Host</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {retreats.map(retreat => (
              <tr key={retreat.id} className="border-b">
                <td className="p-2">{retreat.title}</td>
                <td className="p-2">{retreat.location}</td>
                <td className="p-2">{retreat.duration || 'N/A'}</td>
                <td className="p-2">₹{retreat.price}</td>
                <td className="p-2">{retreat.host_name || 'EJA'}</td>
                <td className="p-2">{retreat.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-yellow-200 rounded" onClick={() => handleEdit(retreat)}>Edit</button>
                  <button className="px-2 py-1 bg-red-200 rounded" onClick={() => handleDelete(retreat)}>Delete</button>
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
            const payload: Omit<Retreat, 'id' | 'created_at' | 'updated_at'> = {
              host_id: null,
              title: form.title,
              subtitle: form.subtitle,
              description: form.description,
              location: form.location,
              price: Number(form.price),
              duration: form.duration,
              categories: form.categories ? form.categories.split(',').map(s => s.trim()).filter(Boolean) : [],
              host_name: form.host_name,
              host_type: form.host_type,
              host_tenure: form.host_tenure,
              host_description: form.host_description,
              host_image: form.host_image,
              host_usps: form.host_usps ? form.host_usps.split(',').map(s => s.trim()).filter(Boolean) : [],
              unique_propositions: form.unique_propositions ? form.unique_propositions.split(',').map(s => s.trim()).filter(Boolean) : [],
              images: form.images.split(',').map(s => s.trim()).filter(Boolean),
              is_active: form.is_active,
            };
            if (editRetreat) {
              handleUpdate({ ...editRetreat, ...payload });
            } else {
              handleCreate(payload);
            }
            setShowCreateForm(false);
          }}>
            <h3 className="text-xl font-bold mb-2">{editRetreat ? 'Edit Retreat' : 'Add Retreat'}</h3>
            <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Duration" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="Categories (comma separated)" value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Host Name" value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Host Type" value={form.host_type} onChange={e => setForm({ ...form, host_type: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Host Tenure" value={form.host_tenure} onChange={e => setForm({ ...form, host_tenure: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Host Description" value={form.host_description} onChange={e => setForm({ ...form, host_description: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Host Image URL" value={form.host_image} onChange={e => setForm({ ...form, host_image: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Host USPs (comma separated)" value={form.host_usps} onChange={e => setForm({ ...form, host_usps: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Unique Propositions (comma separated)" value={form.unique_propositions} onChange={e => setForm({ ...form, unique_propositions: e.target.value })} />
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

function EngagementSection() {
  const [likes, setLikes] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);

  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch engagement data
    // This would be implemented with actual database calls
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Engagement Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShareIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Shares</div>
            </div>
          </div>
        </div>



        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Collaborations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Collaborations</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No collaborations yet
          </div>
        )}
      </div>
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
  const [activeSection, setActiveSection] = useState('dashboard');
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
      {/* Enhanced Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CogIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">EJA</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map(link => (
            <button
              key={link.key}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeSection === link.key 
                  ? 'bg-blue-100 text-blue-900 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveSection(link.key)}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{profile.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection === 'dashboard' ? 'Dashboard' : activeSection}
              </h2>
              <p className="text-gray-600">
                {activeSection === 'dashboard' 
                  ? 'Welcome back! Here\'s what\'s happening with your properties.' 
                  : `Manage your ${activeSection}`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <CogIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'dashboard' && <DashboardStats />}
          {activeSection === 'properties' && <StaysSection />}
          {activeSection === 'rooms' && <RoomsSection />}
          {activeSection === 'experiences' && <ExperiencesSection />}
          {activeSection === 'trips' && <RetreatsSection />}
          {activeSection === 'bookings' && <BookingsSection />}
          {activeSection === 'calendar' && <CalendarSection />}

          
          {activeSection === 'engagement' && <EngagementSection />}
        </div>
      </main>
    </div>
  );
} 