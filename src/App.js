// -- React and related libs
import React, { useEffect } from "react";
import { Switch, Route, Redirect, BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";

// -- Redux
import { connect } from "react-redux";

// -- Custom Components
import LayoutComponent from "./components/Layout/Layout";
import ErrorPage from "./pages/error/ErrorPage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";

// -- Redux Actions
import { logoutUser } from "./actions/auth";

// -- Third Party Libs
import { ToastContainer } from "react-toastify";

// -- Services
import isAuthenticated from "./services/authService";

// -- Component Styles
import "./styles/app.scss";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const dispatch = useDispatch();

  if (!isAuthenticated(JSON.parse(localStorage.getItem("authenticated")))) {
    dispatch(logoutUser());
    return <Redirect to="/login" replace />;
  }

  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const App = (props) => {
  // ✅ iframe 제거 useEffect 추가
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = document.querySelector("iframe");
      if (iframe) {
        iframe.remove();
        console.log("✅ iframe 자동 제거됨");
        clearInterval(interval); // 한 번만 실행되도록 중단
      }
    }, 300); // DOM 렌더링까지 약간 대기

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, []);
  return (
    <div>
      <ToastContainer />
      <BrowserRouter>
        <Switch>
          {" "}
          {/* ✅ v5에서는 `Switch` 사용 */}
          <Route
            path="/"
            exact
            render={() =>
              isAuthenticated(
                JSON.parse(localStorage.getItem("authenticated"))
              ) ? (
                <Redirect to="/template/dashboard" />
              ) : (
                <Redirect to="/login" />
              )
            }
          />
          <Route
            path="/template"
            exact
            render={() =>
              isAuthenticated(
                JSON.parse(localStorage.getItem("authenticated"))
              ) ? (
                <Redirect to="/template/dashboard" />
              ) : (
                <Redirect to="/login" />
              )
            }
          />
          <Route
            path="/template/*"
            render={(props) => (
              <PrivateRoute
                {...props}
                dispatch={props.dispatch}
                component={LayoutComponent}
              />
            )}
          />
          <Route path="/login" exact component={Login} />
          <Route path="/error" exact component={ErrorPage} />
          <Route path="/register" exact component={Register} />
          <Route path="*" render={() => <Redirect to="/error" />} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(App);
