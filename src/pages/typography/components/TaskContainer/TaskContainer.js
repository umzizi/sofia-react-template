import React, { useState, useEffect } from "react";
import s from "./TaskContainer.module.scss";
import cx from "classnames";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const TaskContainer = ({ tasks, toggleTask }) => {
  const pageSize = 4;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(tasks.length / pageSize);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // 현재 페이지에 해당하는 tasks만 렌더링
  const displayedTasks = tasks.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // 선택된 task가 변경될 때 기존 스타일 제거
  useEffect(() => {
    // 기존 선택된 요소의 스타일을 제거
    document.querySelectorAll(`.${s.selected}`).forEach((el) => {
      el.classList.remove(s.selected);
    });

    // 새로운 선택된 요소에 스타일 추가
    if (selectedTaskId !== null) {
      const newSelectedTask = document.getElementById(`task-${selectedTaskId}`);
      if (newSelectedTask) {
        newSelectedTask.classList.add(s.selected);
      }
    }
  }, [selectedTaskId]); // selectedTaskId가 변경될 때 실행

  // 페이지 변경 함수
  const handlePageChange = (event, newPage) => {
    event.preventDefault();
    setCurrentPage(newPage);
  };

  // 단일 선택 토글 기능
  const handleToggle = (taskId, description) => {
    const newSelectedTaskId = selectedTaskId === taskId ? null : taskId;
    setSelectedTaskId(newSelectedTaskId);
    toggleTask(taskId, description);
  };

  return (
    <div>
      <ul>
        {displayedTasks.map((task) => (
          <li
            id={`task-${task.id}`} // 각 task 요소에 ID 추가
            className={cx(s.taskBlock, {
              [s.completed]: task.completed,
              [s.selected]: selectedTaskId === task.id, // 선택된 항목만 적용
            })}
            key={task.id}
          >
            <div className={s.taskDescription}>
              <div className="checkbox checkbox-primary mr-1">
                <input
                  onChange={() => handleToggle(task.id, task.description)}
                  checked={selectedTaskId === task.id}
                  className="styled"
                  id={`checkbox${task.id}`}
                  type="checkbox"
                />
                <label className="form-check-label" htmlFor={`checkbox${task.id}`} />
              </div>
              <div className="body-3">{task.description}</div>
            </div>
            <div className={s.time}>{task.time}</div>
          </li>
        ))}
      </ul>

      <Pagination className="pagination-with-border">
        <PaginationItem disabled={currentPage <= 0}>
          <PaginationLink
            onClick={(e) => handlePageChange(e, currentPage - 1)}
            previous
          />
        </PaginationItem>

        {[...Array(totalPages)].map((_, i) => (
          <PaginationItem active={i === currentPage} key={i}>
            <PaginationLink onClick={(e) => handlePageChange(e, i)}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem disabled={currentPage >= totalPages - 1}>
          <PaginationLink
            onClick={(e) => handlePageChange(e, currentPage + 1)}
            next
          />
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default TaskContainer;
