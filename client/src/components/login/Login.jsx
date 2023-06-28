import "./login.css";
import { useRef, useState } from "react";
import { Place, Cancel } from "@mui/icons-material";
import axios from "axios";

export default function Login({ setShowLogin, myStorage, setCurrentUser }) {
  const [error, setError] = useState(false);
  const nameRef = useRef();
  const pwRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      username: nameRef.current.value,
      password: pwRef.current.value,
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        user
      );
      myStorage.setItem("user", res.data.username);
      setCurrentUser(res.data.username);
      setShowLogin(false);
      setError(false);
    } catch (err) {
      setError(true);
    }
  };
  return (
    <div className="loginContainer">
      <div className="logoLogin">
        <Place />
        <span>MAPPIN</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="username" ref={nameRef} />
        <input type="password" placeholder="password" ref={pwRef} />
        <button type="submit" className="loginBtn">
          Login
        </button>
        {error && <span className="failure">Wrong credentials!</span>}
      </form>
      <Cancel className="loginCancel" onClick={() => setShowLogin(false)} />
    </div>
  );
}
