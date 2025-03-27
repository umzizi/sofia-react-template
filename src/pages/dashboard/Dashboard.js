import React, { useState, useEffect } from "react";
import ApexLineChart from "./components/ApexLineChart";
import { v4 as uuidv4 } from "uuid";
import {
  Col,
  Row,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import Widget from "../../components/Widget/Widget.js";
// import user from "../../assets/user.svg";
import user from "../../assets/sksj0111.png";
// import ReactBigCalendar from "./ReactBigCalendar";
import s from "./Dashboard.module.scss";

const Dashboard = () => {
  const ENDPOINT_URL = "http://192.168.80.101:8000";

  const [firstTable, setFirstTable] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [firstTableCurrentPage, setFirstTableCurrentPage] = useState(0);

  const pageSize = 4;
  const firstTablePagesCount = Math.ceil(firstTable.length / pageSize);

  const setFirstTablePage = (e, index) => {
    e.preventDefault();
    setFirstTableCurrentPage(index);
  };
  // 서버에서 데이터를 받아오는 useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ENDPOINT_URL + "/news"); // FastAPI 엔드포인트로 요청
        const data = await response.json();
        setFirstTable(data.data); // 서버에서 받은 데이터를 상태로 설정
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          ENDPOINT_URL + "/user_info/sksj0111@naver.com"
        );
        console.log(response);
        const data = await response.json();
        setUserInfo(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Row>
        <Col className="pr-grid-col" xs={12} lg={8}>
          <Row className="gutter mb-4">
            <Col className="mb-4 mb-md-0" xs={12} md={12}>
              <Widget className="" style={{ minHeight: "400px" }}>
                <div className="headline-2 mb-3">Stock</div>
                <ApexLineChart />
              </Widget>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12}>
              <Widget className="widget-p-none">
                <div className={s.tableTitle}>
                  <div className="headline-2">MACHINE TOOLS NEWS</div>
                </div>
                <div className="widget-table-overflow">
                  <Table
                    className={`table-striped table-borderless table-hover ${s.statesTable}`}
                    responsive
                  >
                    <thead>
                      <tr>
                        <th className="w-25">TITLE</th>
                        <th className="w-25">SECTOR</th>
                        <th className="w-25">COMPANY</th>
                        <th className="w-25">DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {firstTable
                        .slice(
                          firstTableCurrentPage * pageSize,
                          (firstTableCurrentPage + 1) * pageSize
                        )
                        .map((item) => (
                          <tr key={uuidv4()}>
                            <td className="d-flex align-items-center">
                              <a
                                href={item.href}
                                className="ml-3"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.news_title}
                              </a>
                            </td>
                            <td>{item.sector}</td>
                            <td>{item.company}</td>
                            <td>{item.date}</td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                  <Pagination
                    className="pagination-borderless"
                    aria-label="Page navigation example"
                  >
                    <PaginationItem disabled={firstTableCurrentPage <= 0}>
                      <PaginationLink
                        onClick={(e) =>
                          setFirstTablePage(e, firstTableCurrentPage - 1)
                        }
                        previous
                        href="#top"
                      />
                    </PaginationItem>
                    {[...Array(firstTablePagesCount)].map((page, i) => (
                      <PaginationItem
                        active={i === firstTableCurrentPage}
                        key={i}
                      >
                        <PaginationLink
                          onClick={(e) => setFirstTablePage(e, i)}
                          href="#top"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem
                      disabled={
                        firstTableCurrentPage >= firstTablePagesCount - 1
                      }
                    >
                      <PaginationLink
                        onClick={(e) =>
                          setFirstTablePage(e, firstTableCurrentPage + 1)
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
        <Col className="mt-4 mt-lg-0 pl-grid-col" xs={12} lg={4}>
          <Widget className="widget-p-lg">
            <div className="d-flex">
              <img className={s.image} src={user} alt="..." />
              <div className={s.userInfo}>
                <p className="headline-3">{userInfo.name}</p>
                <p className="body-3 muted">{userInfo.position}</p>
              </div>
            </div>
            <div className={s.userParams}>
              <div className="d-flex flex-column">
                <p className="headline-3">{userInfo.division}</p>
                <p className="body-3 muted">사업부</p>
              </div>
              <div className="d-flex flex-column">
                <p className="headline-3">{userInfo.department}</p>
                <p className="body-3 muted">부서</p>
              </div>
              <div className="d-flex flex-column">
                <p className="headline-3">{userInfo.team}</p>
                <p className="body-3 muted">파트</p>
              </div>
            </div>
            <div style={{ marginTop: "80px" }}>
              {/* <ReactBigCalendar /> */}
            </div>
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
