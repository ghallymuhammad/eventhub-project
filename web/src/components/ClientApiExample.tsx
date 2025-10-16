"use client";

import { api } from "@/libs/api";
import { useEffect, useState } from "react";

interface ApiResponse {
  status: number;
  message: string;
  data: any[];
}

export default function ClientApiExample() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.samples.getAll();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Client-side API Example</h3>
      
      <button
        onClick={fetchData}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Fetch Data"}
      </button>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Status:</strong> {data.status}
          </div>
          <div className="text-sm">
            <strong>Message:</strong> {data.message}
          </div>
          <div className="text-sm">
            <strong>Data:</strong> {JSON.stringify(data.data)}
          </div>
        </div>
      )}
    </div>
  );
}
