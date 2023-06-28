import "./App.css";
import { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Star } from "@mui/icons-material";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/register/Register";
import Login from "./components/login/Login";

function App() {
  const myStorage = localStorage;
  const [pins, setPins] = useState([]);
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: 47.751569,
    longitude: 1.675063,
    zoom: 4,
  });

  useEffect(() => {
    if (currentUser) {
      const getPins = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/pins");
          setPins(res.data);
          // console.log(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      getPins();
    }
  });

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewState({ ...viewState, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    if (currentUser) {
      const longitude = e.lngLat.lng;
      const latitude = e.lngLat.lat;
      // console.log(longitude, latitude);
      setNewPlace({
        lat: latitude,
        long: longitude,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    myStorage.removeItem("user");
    setCurrentUser(null);
  };

  const handleLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };
  return (
    <div className="App">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        onDblClick={handleAddClick}
        transitionDuration="200"
      >
        {currentUser &&
          pins.map((p, idx) => (
            <div key={idx}>
              <Marker
                longitude={p.long}
                latitude={p.lat}
                color={currentUser === p.username ? "tomato" : "slateblue"}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
                style={{
                  cursor: "pointer",
                }}
              />
              {p._id === currentPlaceId && (
                <Popup
                  longitude={p.long}
                  latitude={p.lat}
                  anchor="top"
                  onClose={() => setCurrentPlaceId(null)}
                >
                  <div className="card">
                    <label>Place</label>
                    <h4 className="place">{p.title}</h4>
                    <label>Review</label>
                    <p className="">{p.desc}</p>
                    <label>Rating</label>
                    <div className="stars">
                      {Array(p.rating).fill(<Star className="star" />)}
                    </div>
                    <label>Information</label>
                    <span className="username">
                      Created by <b>{p.username}</b>
                    </span>
                    <span className="date">{format(p.createdAt)}</span>
                  </div>
                </Popup>
              )}
            </div>
          ))}
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            onClose={() => setNewPlace(null)}
            anchor="left"
          >
            <div>
              <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Enter a title"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Review</label>
                <textarea
                  type="text"
                  placeholder="Say us someting about this place."
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setRating(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button className="submitButton" type="submit">
                  Add Pin
                </button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={handleLogin}>
              Login
            </button>
            <button className="button register" onClick={handleRegister}>
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            myStorage={myStorage}
            setCurrentUser={setCurrentUser}
          />
        )}
      </Map>
    </div>
  );
}

export default App;
