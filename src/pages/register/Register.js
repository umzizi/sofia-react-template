import React, { useState } from "react";
import PropTypes from "prop-types";
import { withRouter, useHistory, Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import {
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  FormText,
  Input,
  Label,
} from "reactstrap";
import Widget from "../../components/Widget/Widget.js";
import Footer from "../../components/Footer/Footer.js";

import registerImage from "../../assets/registerImage.svg";
import SofiaLogo from "../../components/Icons/SofiaLogo.js";
//import { registerUser } from "../../actions/register.js";
import hasToken from "../../services/authService";

// 환경변수에서 백엔드 URL 가져오기
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://192.168.80.2:5000";

// 부서, 팀, 파트 데이터 구조
const departmentData = {
  기계사업부: {
    국내영업팀: ["국내영업파트", "영업기술파트"],
    해외영업팀: ["해외영업파트"],
    생산팀: ["생산기획파트", "생산관리파트", "생산운영파트", "자재파트"],
    구매팀: ["구매관리파트"],
    연구개발팀: [
      "MCT파트",
      "선반1파트",
      "선반2파트",
      "제어1파트",
      "제어2파트",
      "UNIT개발파트",
      "솔루션개발파트",
    ],
    품질보증팀: ["최종검사파트", "수입검사파트"],
  },
  ICT사업부: {
    ICT사업팀: ["사업1파트", "사업2파트", "기술지원파트", "연구개발파트"],
    ICT사업관리팀: null, // 파트 없음
  },
  융복합사업부: {
    융복합사업팀: ["기술영업파트", "기구파트", "제어파트"],
    융복합사업관리팀: null, // 파트 없음
  },
  경영기획실: {
    경영기획팀: null, // 파트 없음
    재경팀: ["재무파트", "원가파트"],
    경영정보팀: null, // 파트 없음
  },
  "R&D센터": {}, // 올바른 JSON 문법 적용
  스맥서비스: {
    관리팀: null, // 파트 없음
    UNIT조립팀: null, // 파트 없음
    서비스팀: null, // 파트 없음
  },
};

const Register = (props) => {
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    team: "",
    part: "",
    position: "",
  });
  const [errors, setErrors] = useState({});

  // 이메일 형식 검증 함수
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 비밀번호 형식 검증 (8자 이상, 영문 + 숫자 + 특수문자 포함)
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  // 입력값 변경 핸들러
  const handleChange = (event) => {
    const { name, value } = event.target;
    let newState = { ...state, [name]: value };

    // 입력값 유효성 검사사
    let newErrors = { ...errors };
    if (name === "email") {
      newErrors.email = validateEmail(value)
        ? ""
        : "올바른 이메일 형식이 아닙니다.";
    } else if (name === "password") {
      newErrors.password = validatePassword(value)
        ? ""
        : "비밀번호는 8자 이상, 영문 + 숫자 + 특수문자를 포함해야 합니다.";
    } else if (name === "confirmPassword") {
      newErrors.confirmPassword =
        value === state.password ? "" : "비밀번호가 일치하지 않습니다.";
    }

    // 부서 변경 시 팀과 파트 초기화
    if (name === "department") {
      newState.team = departmentData[value] ? "" : null; // R&D센터면 NULL 처리
      newState.part = departmentData[value] ? "" : null;
    }
    // 팀 변경 시 파트 초기화
    else if (name === "team") {
      newState.part =
        departmentData[state.department] &&
        departmentData[state.department][value]
          ? ""
          : null;
    }

    setState(newState);
    setErrors(newErrors);
  };

  // 선택 가능한 팀 리스트 (팀이 없는 부서는 빈 배열)
  const teamOptions =
    state.department && departmentData[state.department]
      ? Object.keys(departmentData[state.department])
      : [];

  // 선택 가능한 파트 리스트 (팀이 없거나 파트가 없으면 null)
  const partOptions =
    state.team &&
    departmentData[state.department] &&
    departmentData[state.department][state.team]
      ? departmentData[state.department][state.team]
      : null;

  // 팀이 없는 부서인지 체크
  const hasTeams = teamOptions.length > 0;

  // 회원가입 버튼 활성화 조건
  const isFormValid =
    state.name.trim() &&
    state.email &&
    validateEmail(state.email) &&
    state.password &&
    validatePassword(state.password) &&
    state.password === state.confirmPassword &&
    state.department &&
    state.position &&
    (!hasTeams || state.team) && // 팀이 있는 부서는 반드시 팀 선택해야 함
    (partOptions === null || state.part); // 파트가 있는 경우 반드시 선택해야 함

  const history = useHistory(); // React Router v6에서 페이지 이동을 위한 함수
  // 회원가입 요청 처리
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) {
      alert("입력값을 확인하세요.");
      return;
    }

    try {
      const response = await fetch("http://192.168.80.2:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          password: state.password,
          department: state.department,
          team: state.team || null,
          part: state.part || null,
          position: state.position,
        }),
      });

      if (response.ok) {
        alert("회원가입 성공!");
        props.history.push("/login"); // 로그인 페이지로 이동
      } else {
        const data = await response.json();
        setErrors({ ...errors, general: data.message || "회원가입 실패" });
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setErrors({ ...errors, general: "서버 오류가 발생했습니다." });
    }
  };

  const { from } = props.location.state || { from: { pathname: "/template" } };
  if (hasToken(JSON.parse(localStorage.getItem("authenticated")))) {
    return <Redirect to={from} />;
  }

  return (
    <div className="auth-page">
      <Container className="col-12">
        <Row className="d-flex align-items-center">
          <Col xs={12} lg={6} className="left-column">
            <Widget className="widget-auth widget-p-lg">
              <div className="d-flex align-items-center justify-content-between py-3">
                <p className="auth-header mb-0">Sign Up</p>
                <div className="logo-block">
                  <SofiaLogo />
                  <p className="mb-0">SMEC</p>
                </div>
              </div>
              <div className="auth-info my-2">
                <p>
                  <b>SMEC AI</b>를 이용하려면 회원가입하세요.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                {/* 이름 입력 */}
                <FormGroup className="my-3">
                  <FormText>이름</FormText>
                  <Input
                    type="text"
                    name="name"
                    value={state.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup className="my-3">
                  <FormText>Email</FormText>
                  <Input
                    id="email"
                    className={`input-transparent pl-3 ${
                      errors.email ? "input-error" : ""
                    }`}
                    value={state.email}
                    onChange={handleChange}
                    type="email"
                    required
                    name="email"
                    placeholder="SMEC@esmec.com"
                  />
                  {errors.email && (
                    <p className="error-message">{errors.email}</p>
                  )}
                </FormGroup>
                <FormGroup className="my-3">
                  <FormText>Password</FormText>
                  <Input
                    id="password"
                    className={`input-transparent pl-3 ${
                      errors.password ? "input-error" : ""
                    }`}
                    value={state.password}
                    onChange={handleChange}
                    type="password"
                    required
                    name="password"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="error-message">{errors.password}</p>
                  )}
                </FormGroup>
                <FormGroup className="my-3">
                  <FormText>Confirm Password</FormText>
                  <Input
                    id="confirmPassword"
                    className={`input-transparent pl-3 ${
                      errors.confirmPassword ? "input-error" : ""
                    }`}
                    value={state.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    required
                    name="confirmPassword"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="error-message">{errors.confirmPassword}</p>
                  )}
                </FormGroup>
                <FormGroup>
                  <FormText>직위</FormText> {/* ✅ 직위 추가 */}
                  <Input
                    type="text"
                    name="position"
                    value={state.position}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                {/* 사업부 선택 */}
                <FormGroup className="my-3">
                  <FormText>사업부</FormText>
                  <Input
                    type="select"
                    name="department"
                    onChange={handleChange}
                    value={state.department}
                    required
                  >
                    <option value="">선택하세요</option>
                    {Object.keys(departmentData).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                {/* 팀 선택 (팀이 있는 경우에만 표시) */}
                {hasTeams && (
                  <FormGroup className="my-3">
                    <FormText>팀</FormText>
                    <Input
                      type="select"
                      name="team"
                      onChange={handleChange}
                      value={state.team}
                      required
                    >
                      <option value="">선택하세요</option>
                      {teamOptions.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                )}

                {/* 파트 선택 */}
                {state.team && partOptions && (
                  <FormGroup className="my-3">
                    <FormText>파트</FormText>
                    <Input
                      type="select"
                      name="part"
                      onChange={handleChange}
                      value={state.part}
                    >
                      <option value="">선택하세요</option>
                      {partOptions.map((part) => (
                        <option key={part} value={part}>
                          {part}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                )}

                <div className="bg-widget d-flex justify-content-center">
                  <Button
                    className="rounded-pill my-3"
                    type="submit"
                    color="secondary-red"
                    disabled={!isFormValid}
                  >
                    Sign Up
                  </Button>
                </div>
                <Link to="/login">이미 가입되어 있습니까? Login</Link>
              </form>
            </Widget>
          </Col>
          <Col xs={0} lg={6} className="right-column">
            <div>
              <img src={registerImage} alt="Register" />
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

Register.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default withRouter(connect()(Register));
