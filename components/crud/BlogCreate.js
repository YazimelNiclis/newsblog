import Link from "next/link";
import React, { useState, useEffect } from "react";
import Router from "next/router";
//dynamic for rendering in client side
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getCookie, isAuth } from "../../actions/auth";
import { getCategories } from "../../actions/category";
import { getTags } from "../../actions/tag";
import { createBlog } from "../../actions/blog";
import { QuillModules, QuillFormats } from "../../helpers/quill";
import FormData from "form-data";
const ReactQuill = dynamic(() => import("react-quill", { ssr: false }));

/* const ReactQuill =
  typeof window === "object" ? require("react-quill") : () => false; */
import "react-quill/dist/quill.snow.css";

const BlogCreate = () => {
  const router = useRouter();
  let token = getCookie("token");
  const blogFromLS = () => {
    if (typeof window === "undefined") {
      return false;
    }
    if (localStorage.getItem("blog")) {
      return JSON.parse(localStorage.getItem("blog"));
    } else {
      return false;
    }
  };

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [checkedCat, setCheckedCat] = useState([]);
  const [checkedTag, setCheckedTag] = useState([]);
  const [body, setBody] = useState("");
  const [values, setValues] = useState({
    error: "",
    sizeError: "",
    success: "",
    formData: new FormData(),
    title: "",
    hidePublishButton: false,
  });

  const { error, sizeError, success, formData, title, hidePublishButton } =
    values;

  const publishBlog = (e) => {
    e.preventDefault();
    createBlog(formData, token).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error, success: "" });
      } else {
        setValues({
          ...values,
          title: "",
          error: "",
          success: `A new blog titled "${data.title}" is created`,
        });
        setBody("");
        setCheckedCat([]);
        setCheckedTag([]);
        setCategories([]);
        setTags([]);
        initCategories();
        initTags();
      }
    });
  };

  const handleChange = (name) => (e) => {
    const value = name === "photo" ? e.target.files[0] : e.target.value;
    formData.set(name, value);
    setValues({ ...values, [name]: value, formData, error: "" });
  };
  const handleBody = (e) => {
    setBody(e);
    setValues({ ...values, error: "" });
    formData.set("body", e);
    if (typeof window !== "undefined") {
      localStorage.setItem("blog", JSON.stringify(e));
    }
  };

  useEffect(() => {
    initCategories();
    initTags();
    setBody(blogFromLS());
  }, [router]);

  const initCategories = () => {
    getCategories(token).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setCategories(data);
      }
    });
  };
  const initTags = () => {
    getTags(token).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setTags(data);
      }
    });
  };

  const handleToggleCat = (c) => {
    setValues({ ...values, error: "" });

    const clickedCat = checkedCat.indexOf(c);
    const all = [...checkedCat];
    if (clickedCat === -1) {
      all.push(c);
    } else {
      all.splice(clickedCat, 1);
    }
    setCheckedCat(all);

    formData.set("categories", all);
  };

  const showCategories = () => {
    return (
      categories &&
      categories.map((c, i) => {
        return (
          <li key={i} className="list-unstyled">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => handleToggleCat(c._id)}
            />
            <label className="form-check-label">{c.name}</label>
          </li>
        );
      })
    );
  };

  const handleToggleTag = (t) => {
    setValues({ ...values, error: "" });

    const clickedTag = checkedTag.indexOf(t);
    const all = [...checkedTag];
    if (clickedTag === -1) {
      all.push(t);
    } else {
      all.splice(clickedTag, 1);
    }
    setCheckedTag(all);
    formData.set("tags", all);
  };

  const showTags = () => {
    return (
      tags &&
      tags.map((t, i) => {
        return (
          <li key={i} className="list-unstyled">
            <input
              type="checkbox"
              className="mr-2"
              onChange={() => handleToggleTag(t._id)}
            />
            <label className="form-check-label">{t.name}</label>
          </li>
        );
      })
    );
  };

  const showError = () =>
    error ? <div className="alert alert-danger">{error}</div> : "";
  const showSuccess = () =>
    success ? <div className="alert alert-info">{success}</div> : "";

  const createBlogForm = () => {
    return (
      <form onSubmit={publishBlog}>
        <div className="form-group">
          <label className="text-muted"> Title </label>
          <input
            type="text"
            className="form-control"
            onChange={handleChange("title")}
            value={title}
          ></input>
        </div>
        <div className="form-group">
          <ReactQuill
            modules={QuillModules}
            formats={QuillFormats}
            value={body}
            placeholder="Write something amazing..."
            onChange={handleBody}
          />
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Publish
          </button>
        </div>
      </form>
    );
  };
  return (
    <div className="container-fluid pb-5">
      <div className="row">
        <div className="col-md-8">
          {createBlogForm()}
          <div className="pt-3">
            {showError()}
            {showSuccess()}
          </div>
        </div>
        <div className="col-md-4">
          <div>
            <div className="form-group pb-2">
              <h5>Featured image</h5>
              <hr />
              <small className="text-muted">Max size: 1MB</small>
              <br />
              <label className="btn btn-outline-info">
                Upload featured image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange("photo")}
                  hidden
                />
              </label>
            </div>
          </div>
          <h5>Categories</h5>
          <hr />
          <ul style={{ maxHeight: "200px", overflowY: "scroll" }}>
            {showCategories()}
          </ul>

          <h5>Tags</h5>
          <hr />
          <ul style={{ maxHeight: "200px", overflowY: "scroll" }}>
            {showTags()}
          </ul>
          <hr />
        </div>
      </div>
    </div>
  );
};

export default BlogCreate;
