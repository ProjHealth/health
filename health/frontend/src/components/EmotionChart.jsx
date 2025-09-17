import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EmotionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const { id } = JSON.parse(storedUser);

        const res = await fetch(`http://localhost:5000/api/v1/mood/${id}`);
        if (!res.ok) throw new Error("Failed to fetch mood data");
        const data = await res.json();

        // Transform for recharts
        const formatted = data.map(entry => ({
          date: new Date(entry.createdAt).toLocaleDateString(),
          joy: entry.emotions?.joy || 0,
          sadness: entry.emotions?.sadness || 0,
          anger: entry.emotions?.anger || 0,
          fear: entry.emotions?.fear || 0,
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Error loading emotion data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  if (loading) return <p className="text-gray-500 text-center">Loading mood data...</p>;
  if (chartData.length === 0) return <p className="text-gray-500 text-center">No mood data yet. Log your first mood!</p>;

  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">Mood Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="joy" stroke="#22c55e" strokeWidth={2} />
          <Line type="monotone" dataKey="sadness" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="anger" stroke="#f97316" strokeWidth={2} />
          <Line type="monotone" dataKey="fear" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
