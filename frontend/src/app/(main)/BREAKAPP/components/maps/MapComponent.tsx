'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  vendors?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    distance?: number;
  }>;
  className?: string;
}

export default function MapComponent({
  center = [24.7136, 46.6753], // Riyadh, Saudi Arabia
  zoom = 12,
  onLocationSelect,
  vendors = [],
  className = '',
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const vendorMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler
    if (onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);

        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng)
            .addTo(map)
            .bindPopup('Selected Location')
            .openPopup();
        }
      });
    }

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update vendors
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing vendor markers
    vendorMarkersRef.current.forEach((marker) => marker.remove());
    vendorMarkersRef.current = [];

    // Add vendor markers
    vendors.forEach((vendor) => {
      if (!mapRef.current) return;

      const marker = L.marker([vendor.lat, vendor.lng], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<strong>${vendor.name}</strong><br/>` +
            (vendor.distance ? `Distance: ${Math.round(vendor.distance)}m` : '')
        );

      vendorMarkersRef.current.push(marker);
    });
  }, [vendors]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
