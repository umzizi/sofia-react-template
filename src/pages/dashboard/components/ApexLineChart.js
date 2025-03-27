import React, { useState, useEffect } from "react";
import axios from "axios";
import ApexCharts from "react-apexcharts";

const series = [
  {
    name: "Website Blog Visits",
    data: [670, 720, 770, 690, 900, 970, 1030],
  },
  {
    name: "Social Media Visits",
    data: [760, 590, 910, 850, 700, 1050, 920],
  },
];

const chartSettings = {
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  xaxis: {
    type: "category",
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    labels: {
      style: {
        colors: "#6B859E",
        opacity: 0.7,
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: ["#6B859E"],
        opacity: 0.7,
      },
    },
  },
  tooltip: {
    x: {
      show: false,
    },
  },
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
  chart: {
    toolbar: {
      show: false,
    },
  },
  legend: {
    show: true,
    horizontalAlign: "center",
  },
};

export default function ApexCandlestickChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          "/api/v8/finance/chart/099440.KQ?interval=1d&range=6mo"
        );

        console.log("Stock API Response:", response.data); // 응답 데이터 확인

        const chartData = response.data.chart.result[0];
        const timestamps = chartData.timestamp; // 타임스탬프 데이터
        const opens = chartData.indicators.quote[0].open;
        const highs = chartData.indicators.quote[0].high;
        const lows = chartData.indicators.quote[0].low;
        const closes = chartData.indicators.quote[0].close;

        // 캔들 차트에 필요한 데이터 포맷으로 변환
        const formattedData = timestamps.map((time, index) => ({
          x: new Date(time * 1000).toLocaleDateString(), // 날짜 변환
          y: [opens[index], highs[index], lows[index], closes[index]], // [시가, 고가, 저가, 종가]
        }));

        setData([{ name: "스맥 주식", data: formattedData }]);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60000); // 1분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const chartSettings = {
    chart: {
      type: "candlestick", // 차트 타입을 캔들 차트로 변경
      height: 300,
    },
    xaxis: {
      type: "category", // 날짜를 문자열로 인식하도록 설정
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "(주) SMEC 실시간 주식 차트",
      align: "center",
    },
  };

  return (
    <ApexCharts
      options={chartSettings}
      series={data}
      type="candlestick"
      height={300}
    />
  );
}
