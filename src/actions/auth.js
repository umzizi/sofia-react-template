export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";

export function receiveLogin(payload) {
  return {
    type: LOGIN_SUCCESS,
    payload,
  };
}

function loginError(payload) {
  return {
    type: LOGIN_FAILURE,
    payload,
  };
}

function requestLogout() {
  return {
    type: LOGOUT_REQUEST,
  };
}

export function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS,
  };
}

// logs the user out
export function logoutUser() {
  return (dispatch) => {
    dispatch(requestLogout());
    localStorage.removeItem("authenticated");
    dispatch(receiveLogout());
  };
}

export function loginUser({ email, password }) {
  return async (dispatch) => {
    try {
      const response = await fetch("http://192.168.80.2:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("로그인 응답 data:", data);

      if (response.ok) {
        // 로그인 성공 시 localStorage 저장
        localStorage.setItem(
          "authenticated",
          JSON.stringify({ email: data.user.email })
        );
        //Chatgpt.js에도 localStorage 저장
        localStorage.setItem("userEmail", data.user.email);
        // 로그인 성공 → 사용자 정보 저장 (auth reducer로)
        dispatch(receiveLogin({ email: data.user.email })); // data에는 email 포함되어야 함
      } else {
        dispatch(loginError(data.message || "로그인 실패"));
      }
    } catch (error) {
      dispatch(loginError("서버 오류: " + error.message));
    }
  };
}
