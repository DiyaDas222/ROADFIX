import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

const API_URL = "http://127.0.0.1:5000";


function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("roadfix_access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem("roadfix_access_token");
        localStorage.removeItem("roadfix_user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (accessToken, loggedInUser) => {
    localStorage.setItem(
      "roadfix_access_token",
      accessToken
    );

    localStorage.setItem(
      "roadfix_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("roadfix_access_token");
    localStorage.removeItem("roadfix_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;