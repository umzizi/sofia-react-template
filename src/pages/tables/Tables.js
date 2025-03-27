import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  Col,
  Row,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Badge,
} from "reactstrap";
import Widget from "../../components/Widget/Widget.js";
import ApexLineChart from "./components/ApexLineChart";
import RechartsPieChart from "./components/RechartsPieChart";
import ApexRadarChart from "./components/ApexRadarChart";
// import BootstrapTable from "react-bootstrap-table-next";
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import MUIDataTable from "mui-datatables";

import s from "./Tables.module.scss";

const Tables = function () {
  const ENDPOINT_URL = "http://192.168.80.101:8000";

  const [QATable, setQATable] = useState([]);
  const [QATableCurrentPage, setQATableCurrentPage] = useState(0);

  const pageSize = 6;
  const QATablePagesCount = Math.ceil(QATable.length / pageSize);

  const setQATablePage = (e, index) => {
    e.preventDefault();
    setQATableCurrentPage(index);
  };

  const [PdfTable, setPdfTable] = useState([]);
  const [PdfTableCurrentPage, setPdfTableCurrentPage] = useState(0);

  const PdfTablePagesCount = Math.ceil(PdfTable.length / pageSize);

  const setPdfTablePage = (e, index) => {
    e.preventDefault();
    setPdfTableCurrentPage(index);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ENDPOINT_URL + "/QA_info"); // FastAPI 엔드포인트로 요청
        const data = await response.json();
        setQATable(data.data); // 서버에서 받은 데이터를 상태로 설정
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ENDPOINT_URL + "/pdf_manager"); // FastAPI 엔드포인트로 요청
        const data = await response.json();
        setPdfTable(data.data); // 서버에서 받은 데이터를 상태로 설정
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Row>
        <Col>
          <Row className="gutter mb-4">
            <Col className="pr-grid-col" xs={12} lg={6}>
              <Widget className="widget-p-md">
                <div className="headline-2 mb-3">GPU 사용량</div>
                <ApexLineChart />
              </Widget>
            </Col>
            <Col className="mt-4 mt-xl-0" xs={12} xl={3}>
              <Widget className="widget-p-md">
                <div className="headline-2 mb-3">Temperature (°C)</div>
                <RechartsPieChart />
              </Widget>
            </Col>
            <Col className="mt-4 mt-xl-0" xs={12} xl={3}>
              <Widget className="widget-p-md">
                <div className="headline-2">Radar Chart</div>
                <ApexRadarChart />
              </Widget>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <Widget>
                <div className={s.tableTitle}>
                  <div className="headline-2">
                    Question & Answer Monitoring Table
                  </div>
                </div>
                <div className="widget-table-overflow">
                  <Table
                    className="table-striped table-borderless table-hover"
                    responsive
                  >
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Document</th>
                        <th>page</th>
                        <th>score</th>
                        <th>feedback</th>
                        <th>state</th>
                      </tr>
                    </thead>
                    <tbody>
                      {QATable.slice(
                        QATableCurrentPage * pageSize,
                        (QATableCurrentPage + 1) * pageSize
                      ).map((item) => (
                        <tr key={uuidv4()}>
                          <td>{item.user}</td>
                          <td>{item.question}</td>
                          <td>{item.answer}</td>
                          <td>{item.document}</td>
                          <td>{item.page}</td>
                          <td>{item.score}</td>
                          <td>{item.feedback}</td>
                          <td>
                            <Badge color={item.color}>{item.state}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination className="pagination-with-border">
                    <PaginationItem disabled={QATableCurrentPage <= 0}>
                      <PaginationLink
                        onClick={(e) =>
                          setQATablePage(e, QATableCurrentPage - 1)
                        }
                        previous
                        href="#top"
                      />
                    </PaginationItem>
                    {[...Array(QATablePagesCount)].map((page, i) => (
                      <PaginationItem active={i === QATableCurrentPage} key={i}>
                        <PaginationLink
                          onClick={(e) => setQATablePage(e, i)}
                          href="#top"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem
                      disabled={QATableCurrentPage >= QATablePagesCount - 1}
                    >
                      <PaginationLink
                        onClick={(e) =>
                          setQATablePage(e, QATableCurrentPage + 1)
                        }
                        next
                        href="#top"
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              </Widget>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <Widget>
                <div className={s.tableTitle}>
                  <div className="headline-2">PDF Manager Table</div>
                </div>
                <div className="widget-table-overflow">
                  <Table
                    className="table-striped table-borderless table-hover"
                    responsive
                  >
                    <thead>
                      <tr>
                        <th>PDF Name</th>
                        <th>PDF Summary</th>
                        <th>Total Page</th>
                        <th>Referenced Page</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PdfTable.slice(
                        PdfTableCurrentPage * pageSize,
                        (PdfTableCurrentPage + 1) * pageSize
                      ).map((item) => (
                        <tr key={uuidv4()}>
                          <td>{item.pdf_name}</td>
                          <td>{item.summary}</td>
                          <td>{item.total_page}</td>
                          <td>{item.referenced_page}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination className="pagination-with-border">
                    <PaginationItem disabled={PdfTableCurrentPage <= 0}>
                      <PaginationLink
                        onClick={(e) =>
                          setPdfTablePage(e, PdfTableCurrentPage - 1)
                        }
                        previous
                        href="#top"
                      />
                    </PaginationItem>
                    {[...Array(PdfTablePagesCount)].map((page, i) => (
                      <PaginationItem
                        active={i === PdfTableCurrentPage}
                        key={i}
                      >
                        <PaginationLink
                          onClick={(e) => setPdfTablePage(e, i)}
                          href="#top"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem
                      disabled={PdfTableCurrentPage >= PdfTablePagesCount - 1}
                    >
                      <PaginationLink
                        onClick={(e) =>
                          setPdfTablePage(e, PdfTableCurrentPage + 1)
                        }
                        next
                        href="#top"
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              </Widget>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Tables;
