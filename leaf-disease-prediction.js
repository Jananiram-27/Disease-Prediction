const express = require("express");
const multer = require("multer");
const axios = require("axios");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

const FLASK_API_URL = "http://127.0.0.1:5000/predict";

const App = () => `
  <html>
    <head>
      <title>Leaf Disease Prediction</title>
      <style>
        body { text-align: center; font-family: Arial, sans-serif; }
        input, button { margin: 10px; padding: 8px; }
        h1 { color: #4CAF50; }
      </style>
    </head>
    <body>
      <h1>Leaf Disease Prediction App</h1>
      <form id="upload-form" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" />
        <button type="submit">Predict</button>
      </form>
      <div id="result"></div>
      <script>
        document.getElementById("upload-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const response = await fetch("/predict", { method: "POST", body: formData });
          const data = await response.json();
          document.getElementById("result").innerText = "Prediction: " + (data.prediction || "Error");
        });
      </script>
    </body>
  </html>
`;

app.get("/", (req, res) => {
  const html = ReactDOMServer.renderToString(React.createElement(App));
  res.send(html);
});

app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));

    const flaskResponse = await axios.post(FLASK_API_URL, formData, {
      headers: formData.getHeaders(),
    });

    fs.unlinkSync(filePath);

    res.json(flaskResponse.data);
  } catch (error) {
    console.error("Error predicting:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.listen(4000, () => console.log("App running at http://localhost:4000"));
