'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useSocket } from '../../../hooks/useSocket';
import axios from 'axios';

interface Task {
  id: string;
  vendorName: string;
  items: number;
  status: string;
}

export default function RunnerTrackPage() {
  const [runnerId, setRunnerId] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  
  const { position, error: geoError } = useGeolocation();
  const { connected, emit, on, off } = useSocket();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // Get or create runner ID
    let id = localStorage.getItem('runnerId');
    if (!id) {
      id = `runner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('runnerId', id);
    }
    setRunnerId(id);
  }, []);

  useEffect(() => {
    if (connected && runnerId) {
      // Register runner
      emit('runner:register', { runnerId });

      // Listen for new tasks
      const taskHandler = (task: Task) => {
        setTasks((prev) => [...prev, task]);
      };

      on('task:new', taskHandler);

      return () => {
        off('task:new', taskHandler);
      };
    }
  }, [connected, runnerId, emit, on, off]);

  useEffect(() => {
    if (isTracking && position && connected) {
      // Broadcast location every time it updates
      emit('runner:location', {
        runnerId,
        lat: position.latitude,
        lng: position.longitude,
        timestamp: position.timestamp,
      });
    }
  }, [position, isTracking, connected, runnerId, emit]);

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const fetchTasks = async () => {
    if (!sessionId) {
      alert('Please enter session ID');
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/orders/session/${sessionId}/batch`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const batchedTasks = response.data.map((batch: any) => ({
        id: batch.vendorId,
        vendorName: batch.vendorName,
        items: batch.totalItems,
        status: 'pending',
      }));

      setTasks(batchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );

    // Emit status update
    if (connected) {
      emit('order:status', { orderId: taskId, status });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Runner Dashboard</h1>
          <p className="text-gray-600">Track your location and manage delivery tasks</p>
        </div>

        {/* Runner Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Runner Info</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">Runner ID:</span>
              <p className="font-mono text-sm">{runnerId}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Socket Status:</span>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  connected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Session ID Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchTasks}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Load Tasks
            </button>
          </div>
        </div>

        {/* Location Tracking */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Location Tracking</h2>
          
          {geoError ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
              Error: {geoError}
            </div>
          ) : position ? (
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-sm text-gray-600">Latitude:</span>
                <p className="font-mono">{position.latitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Longitude:</span>
                <p className="font-mono">{position.longitude.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Accuracy:</span>
                <p>{Math.round(position.accuracy)}m</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">Waiting for location...</p>
          )}

          <button
            onClick={isTracking ? stopTracking : startTracking}
            disabled={!connected}
            className={`w-full px-6 py-3 text-white rounded-md font-semibold ${
              isTracking
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No tasks assigned yet</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.vendorName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.items} item(s) to collect
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      disabled={task.status !== 'pending'}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      disabled={task.status === 'completed'}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
