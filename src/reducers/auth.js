import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_SUCCESS,
} from "../actions/auth.js";

const authenticated = localStorage.getItem("authenticated") === "true";
const storedEmail = localStorage.getItem("userEmail");

const initialState = {
  isFetching: false,
  isAuthenticated: authenticated,
  email: storedEmail || "",
  errorMessage: "",
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: true,
        email: action.payload?.email || "",
        errorMessage: "",
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.payload,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
        email: "",
      };
    default:
      return state;
  }
}
