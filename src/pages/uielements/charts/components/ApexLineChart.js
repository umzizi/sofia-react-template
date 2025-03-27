import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_BASE_URL = "http://192.168.80.2:5000"; // 백엔드 API 주소

export default function ApexLineChart() {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      xaxis: {
        type: "category",
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        labels: { style: { colors: "#6B859E", opacity: 0.7 } },
      },
      yaxis: {
        labels: { style: { colors: ["#6B859E"], opacity: 0.7 } },
      },
      tooltip: { x: { show: false } },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 1,
          stops: [40, 90, 100],
        },
      },
      colors: ["#4D53E0", "#41D5E2"],
      chart: { toolbar: { show: false } },
      legend: { show: true, horizontalAlign: "center" },
    },
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stock`);
        if (!response.ok) throw new Error("Stock API 호출 실패");

        const data = await response.json();
        console.log("📊 Stock API 응답:", data);

        if (data.chart && data.chart.series) {
          setChartData((prevData) => ({
            ...prevData,
            series: data.chart.series,
            options: {
              ...prevData.options,
              xaxis: {
                categories:
                  data.chart.labels || prevData.options.xaxis.categories,
              },
            },
          }));
        } else {
          console.warn("📉 Stock API 데이터가 비어 있음.");
        }
      } catch (error) {
        console.error("❌ Stock 데이터 가져오기 오류:", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <ReactApexChart
      options={chartData.options}
      series={chartData.series}
      type="area"
      height={300}
    />
  );
}
