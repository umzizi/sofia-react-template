const hasToken = (token) => {
  return token && typeof token === "object" && "email" in token;
};

export default hasToken;
