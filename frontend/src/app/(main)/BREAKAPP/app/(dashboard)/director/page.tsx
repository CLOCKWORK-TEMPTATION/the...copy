'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('../../../components/maps/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

interface Vendor {
  id: string;
  name: string;
  fixed_location: { lat: number; lng: number };
  distance?: number;
}

export default function DirectorDashboard() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setLoading(true);

    try {
      // Fetch nearby vendors
      const response = await axios.get(`${apiUrl}/geo/vendors/nearby`, {
        params: { lat, lng, radius: 3000 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedLocation || !projectId) {
      alert('Please select a location and enter project ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/geo/session`,
        {
          projectId,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSessionId(response.data.id);
      alert('Daily session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const vendorsForMap = vendors.map((v) => ({
    id: v.id,
    name: v.name,
    lat: v.fixed_location.lat,
    lng: v.fixed_location.lng,
    distance: v.distance,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Director Dashboard</h1>
          <p className="text-gray-600">Set today's filming location and view nearby vendors</p>
        </div>

        {/* Project ID Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project ID
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Enter project ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Filming Location</h2>
          <MapComponent
            center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : undefined}
            onLocationSelect={handleLocationSelect}
            vendors={vendorsForMap}
            className="mb-4"
          />
          
          {selectedLocation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Selected Location:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
              <button
                onClick={handleCreateSession}
                disabled={loading || !projectId}
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Daily Session'}
              </button>
            </div>
          )}

          {sessionId && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Session Created!</strong> Session ID: {sessionId}
              </p>
            </div>
          )}
        </div>

        {/* Vendors List */}
        {vendors.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Nearby Vendors ({vendors.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                  {vendor.distance && (
                    <p className="text-sm text-gray-600 mt-1">
                      Distance: {Math.round(vendor.distance)}m
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {vendor.fixed_location.lat.toFixed(4)}, {vendor.fixed_location.lng.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
