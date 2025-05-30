const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let dataSensor = [];
let waktuMakanTerakhir = null;

// Route dari ESP32
app.post("/kirim-data", (req, res) => {
    const { suhu, ph, kekeruhan, waktu_makan } = req.body;
    const waktu = new Date().toISOString();

    dataSensor.push({ suhu, ph, kekeruhan, waktu, waktu_makan });

    if (waktu_makan) {
        waktuMakanTerakhir = waktu_makan;
    }

    res.json({ status: "ok", data: req.body });
});

// Route untuk frontend
app.get("/data-sensor", (req, res) => {
    res.json(dataSensor);
});

// Route untuk waktu makan terakhir
app.get("/hasil-terakhir", (req, res) => {
    res.json({ waktu_makan: waktuMakanTerakhir || "Belum ada" });
});

// Server jalan
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
