import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";

const chartSettings = {
  dataLabels: {
    enabled: false, // 데이터 레이블 비활성화
  },
  stroke: {
    curve: "smooth", // 부드러운 선
    width: 2, // 선 굵기
  },
  xaxis: {
    type: "category", // 카테고리 타입으로 설정
    categories: [], // 데이터에 맞는 카테고리로 동적으로 설정 (시간 데이터로 대체 가능)
    labels: {
      style: {
        colors: "#6B859E", // x축 레이블 색상
        opacity: 0.7, // 레이블 투명도
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "#6B859E", // y축 레이블 색상
        opacity: 0.7, // 레이블 투명도
      },
      formatter: (value) => {
        // 예시: 메모리 사용량을 0-100 범위로 표시 (퍼센트 형식으로 변경)
        return `${Math.round(value)}%`;
      },
    },
  },
  tooltip: {
    x: {
      show: false, // 툴팁에서 x축 값 숨기기
    },
  },
  fill: {
    type: "gradient", // 그라디언트 채우기
    gradient: {
      shadeIntensity: 1, // 그라디언트 음영 강도
      opacityFrom: 0.7, // 시작 투명도
      opacityTo: 1, // 끝 투명도
      stops: [40, 90, 100], // 그라디언트의 색상 전환 지점
    },
  },
  colors: ["#4D53E0", "#41D5E2"], // 라인 색상 설정
  chart: {
    toolbar: {
      show: false, // 툴바 숨기기
    },
  },
  legend: {
    show: true, // 범례 표시
    horizontalAlign: "center", // 범례 중앙 정렬
  },
  title: {
    text: "Memory Usage Over Time", // 차트 제목
    align: "center", // 제목 중앙 정렬
    style: {
      fontSize: "16px", // 제목 글꼴 크기
      fontWeight: "bold", // 제목 글꼴 두께
      color: "#6B859E", // 제목 글꼴 색상
    },
  },
};

export default function ApexLineChart() {
  const ENDPOINT_URL = "http://192.168.80.101:8000";
  const [memory, setMemoryData] = useState([
    {
      name: "Website Blog Visits",
      data: [],
    },
  ]);
  useEffect(() => {
    const fetchGpuInfoData = async () => {
      try {
        const response = await fetch(ENDPOINT_URL + "/cpu_info"); // FastAPI 엔드포인트로 요청
        const data = await response.json();
        setMemoryData((prevState) => [
          {
            name: "Memory Usage",
            data: [...prevState[0].data, data.Memory_Usage], // 이전 데이터를 복사하고 새로운 데이터 추가
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
    <ApexCharts
      options={chartSettings}
      series={memory}
      type="area"
      height={300}
    />
  );
}
