import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import s from "../Charts.module.scss";

const MAX_TEMP = 100; // 최대 온도 (100도를 기준으로 설정)

const TemperaturePieChart = () => {
  const ENDPOINT_URL = "http://192.168.80.101:8000";
  const [tempData, setTempData] = useState([
    { name: "Current Temperature", value: 0, color: "#FF5668" },
    { name: "Remaining", value: MAX_TEMP - 0, color: "#E0E0E0" },
  ]);
  console.log(tempData);
  useEffect(() => {
    const fetchGpuInfoData = async () => {
      try {
        const response = await fetch(ENDPOINT_URL + "/cpu_info"); // FastAPI 엔드포인트로 요청
        const data = await response.json();
        setTempData([
          {
            name: "Current Temperature",
            value: data.CPU_Temperature,
            color: "#FF5668",
          },
          {
            name: "Remaining",
            value: MAX_TEMP - data.CPU_Temperature,
            color: "#E0E0E0",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGpuInfoData();
    const interval = setInterval(fetchGpuInfoData, 3000); // 3초
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100px", textAlign: "center" }}>
      <div style={{ textAlign: "left" }} className="my-3 body-3 muted">
        Different types of notifications for lots of use cases. Custom classes
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={tempData}
            cx="50%" // 중심을 가운데 정렬
            cy="80%" // 원래 위치보다 아래 배치하여 반원처럼 보이게 함
            innerRadius={60}
            outerRadius={80}
            startAngle={180} // 반원 형태로 조정
            endAngle={0}
            dataKey="value"
          >
            {tempData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className={s.donutLabels}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
          {tempData[0].value}°C
        </h2>
      </div>
      <div className={s.donutLabels}>
        <h2 style={{ fontSize: "15px", fontWeight: "bold" }}>현재 GPU 온도</h2>
      </div>
    </div>
  );
};

export default TemperaturePieChart;
