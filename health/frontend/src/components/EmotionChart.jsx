import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EmotionChart = () => {
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    const fetchMoods = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);

      const res = await fetch(
        `http://localhost:5000/api/v1/mood/${parsedUser.id}`
      );
      const data = await res.json();
      setMoods(data);
    };

    fetchMoods();
  }, []);

  const chartData = {
    labels: moods.map((m) =>
      new Date(m.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Stress",
        data: moods.map((m) => m.emotions?.stress || 0),
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.2)",
      },
      {
        label: "Joy",
        data: moods.map((m) => m.emotions?.joy || 0),
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.2)",
      },
      {
        label: "Sadness",
        data: moods.map((m) => m.emotions?.sadness || 0),
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.2)",
      },
    ],
  };

  return (
    <div className="p-4 mt-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Your Mood Trends</h2>
      <Line data={chartData} />
    </div>
  );
};

export default EmotionChart;
