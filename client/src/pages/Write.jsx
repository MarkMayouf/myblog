import React, { useContext, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { AuthContext } from "../context/authContext";

const Write = () => {
  const state = useLocation().state;
  const [value, setValue] = useState(state?.desc || "");
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");
 


  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please log in to publish.");
      return;
    }

    const imgUrl = file ? await upload() : state?.img || ""

    try {
      if (state) {
        await axios.put(`/posts/${state.id}`, {
          title,
          desc: value,
          cat,
          img: imgUrl,
        });
      } else {
        await axios.post(`/posts/`, {
          title,
          desc: value,
          cat,
          img: imgUrl,
          date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        });
      }

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!currentUser}
        />
        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={setValue}
            readOnly={!currentUser}
          />
        </div>
      </div>

      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status: </b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            disabled={!currentUser}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label className={`file ${!currentUser ? "disabled" : ""}`} htmlFor="file">
            Upload Image
          </label>
          <div className="buttons">
            <button disabled={!currentUser}>Save as a draft</button>
            <button onClick={handleClick} disabled={!currentUser}>
              Publish
            </button>
          </div>
          {!currentUser && <h3 style={{ color: "crimson" }}>Please Log in to write and publish posts.</h3>}
        </div>

        <div className="item">
          <h1>Category</h1>
          {[ "futurology","science", "technology","philosophy"].map((c) => (
            <div className="cat" key={c}>
              <input
                type="radio"
                checked={cat === c}
                name="cat"
                value={c}
                id={c}
                onChange={(e) => setCat(e.target.value)}
                disabled={!currentUser}
              />
              <label htmlFor={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Write;