import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444"]; // green, yellow, red

const SentimentPieChart = ({ data }) => {
  if (!data) return null;

  const chartData = Object.keys(data).map((key) => ({
    name: key,
    value: data[key],
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-lg font-semibold text-center mb-2">
        Sentiment Distribution (Last 7 Days)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentPieChart;