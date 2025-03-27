import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Col,
  Row,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import classnames from "classnames";
import Widget from "../../components/Widget/Widget";
import s from "./Notifications.module.scss";
import TaskContainer from "./components/TaskContainer/TaskContainer.js";
import statsPie from "../../assets/dashboard/statsPie.svg";
import * as Icons from "@material-ui/icons";

const Typography = () => {
  const pageSize = 6;
  const ENDPOINT_URL = "http://192.168.80.101:8000";
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [UploadedTable, setUploadedTable] = useState([]);
  const [UploadedTableCurrentPage, setUploadedTableCurrentPage] = useState(0);
  const UploadedTablePagesCount = Math.ceil(UploadedTable.length / pageSize);
  const [selectedTaskName, setSelectedTaskName] = useState(null);

  const setUploadedTablePage = (e, index) => {
    e.preventDefault();
    setUploadedTableCurrentPage(index);
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsUploading(true);
      setIsUploadComplete(false);
      uploadFile(selectedFile);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          ENDPOINT_URL + "/Uploaded_file_lists/sksj0111"
        );
        const data = await response.json();

        setUploadedTable(data.data);
        console.log(data.data);

        const formattedTasks = data.data.map((item, index) => ({
          id: index + 1,
          description: item.file_name,
          time: item.uploaded_at,
          completed: false,
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const uploadFile = (file) => {
    const userId = "sksj0111";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    fetch(ENDPOINT_URL + "/uploading", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setIsUploadComplete(true);
        } else {
          alert("Upload failed");
        }
      })
      .catch(() => {
        alert("Error during upload");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const toggleTask = (id, name) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          task.completed = !task.completed;
        }
        return task;
      })
    );
    setSelectedTaskName(name);
  };

  const [report_url, setreport_url] = useState(null);
  const handleClick = async () => {
    try {
      // 서버에 POST 요청 보내기
      const response = await fetch(ENDPOINT_URL + "/autoEDA", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          userId: "sksj0111", // 여기에서 실제 userId를 사용
          file_name: selectedTaskName,
          file_type: "text/csv", // 실제 파일 타입으로 변경
        }),
      });

      if (!response.ok) {
        throw new Error("Error while sending the request");
      }

      const data = await response.json();
      console.log(data);
      setreport_url(data.file_path);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenReport = async () => {
    const formData = new FormData();
    formData.append("path", report_url);

    try {
      const response = await fetch(ENDPOINT_URL + "/load_report/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the report");
      }

      // 응답을 Blob 객체로 변환
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // 새 창에서 HTML 파일 열기
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error while opening the report:", error);
    }
  };

  return (
    <div>
      <Row className="gutter mb-4">
        <Col xs={12} lg={12}>
          <Widget className="widget-p-md">
            <div className="headline-2">File Upload</div>
            <div className={s.widgetText}>
              You can upload a file by clicking the button below. After
              selecting a file, it will be uploaded:
            </div>
            <div className={s.layoutContainer}>
              <div className={s.layoutText}>
                <label
                  htmlFor="file-upload"
                  className={classnames(s.layoutButton, {
                    [s.layoutButtonActive]: !!file,
                  })}
                >
                  {file ? "Click to Upload File" : "Click to Upload File"}
                </label>
              </div>
              <input
                id="file-upload"
                type="file"
                className="fileElem"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
            {isUploading && <p>Uploading...</p>}
            {isUploadComplete && <p>Upload Complete: {file.name}</p>}
          </Widget>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Widget className="widget-p-md">
            <div className={s.tableTitle}>
              <div className="headline-2">Uploaded Files</div>
            </div>
            <div className={s.widgetText}>
              The table below shows the currently uploaded files.
            </div>
            <div className="widget-table-overflow">
              <Table
                className="table-striped table-borderless table-hover"
                responsive
              >
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>File Size</th>
                    <th>File Type</th>
                    <th>Upload Date</th>
                  </tr>
                </thead>
                <tbody>
                  {UploadedTable.slice(
                    UploadedTableCurrentPage * pageSize,
                    (UploadedTableCurrentPage + 1) * pageSize
                  ).map((item) => (
                    <tr key={uuidv4()}>
                      <td>{item.file_name}</td>
                      <td>{item.file_size}</td>
                      <td>{item.file_type}</td>
                      <td>{item.uploaded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination className="pagination-with-border">
                <PaginationItem disabled={UploadedTableCurrentPage <= 0}>
                  <PaginationLink
                    onClick={(e) =>
                      setUploadedTablePage(e, UploadedTableCurrentPage - 1)
                    }
                    previous
                    href="#top"
                  />
                </PaginationItem>
                {[...Array(UploadedTablePagesCount)].map((page, i) => (
                  <PaginationItem
                    active={i === UploadedTableCurrentPage}
                    key={i}
                  >
                    <PaginationLink
                      onClick={(e) => setUploadedTablePage(e, i)}
                      href="#top"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem
                  disabled={
                    UploadedTableCurrentPage >= UploadedTablePagesCount - 1
                  }
                >
                  <PaginationLink
                    onClick={(e) =>
                      setUploadedTablePage(e, UploadedTableCurrentPage + 1)
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
        <Col xs={12} xl={8} className="pl-grid-col mt-4 mt-xl-0">
          <Widget className="widget-p-md">
            <div className={s.tableTitle}>
              <div className="headline-2">Select Data To Analyze</div>
            </div>
            <div className={s.widgetText}>
              When you select data and click the Analyze button, the selected
              data is automatically analyzed.
            </div>
            <div className={s.widgetContentBlock}>
              <TaskContainer tasks={tasks} toggleTask={toggleTask} />
            </div>
          </Widget>
        </Col>
        <Col xs={12} xl={4} className="pr-grid-col">
          <Widget className="widget-p-md">
            <a
              className={`btn-secondary-red ${s.statsBtn}`}
              role="button"
              onClick={handleClick}
            >
              <img className={s.pieImg} src={statsPie} alt="..." />
              <div>
                <p className="headline-2">Start Automatic Analysis</p>
                <p className="body-3">Click Button</p>
              </div>
            </a>
            <a className={s.statsBtn2} role="button" onClick={handleOpenReport}>
              <Icons.Assessment className={s.pieImg} />
              <div>
                <p className="headline-2">Go To The Analyzed Page</p>
                <p className="body-3">Click Button</p>
              </div>
            </a>
          </Widget>
        </Col>
      </Row>
    </div>
  );
};

export default Typography;
