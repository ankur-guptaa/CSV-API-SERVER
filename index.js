const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const {
  processAttendanceData,
  getSummary,
  getAttendanceTrends,
  getDepartmentAttendance,
} = require("./services/csvService");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Paths to CSV files
const ATTENDANCE_FILE = path.join(__dirname, "data/attendence.csv");
const EMPLOYEE_FILE = path.join(__dirname, "data/employee.csv");
const DEPARTMENT_FILE = path.join(__dirname, "data/department.csv");

// API Endpoints
app.post("/api/summary", async (req, res) => {
  try {
    const { date } = req.body;
    const { attendanceData, departmentData } = await processAttendanceData(
      ATTENDANCE_FILE,
      EMPLOYEE_FILE,
      DEPARTMENT_FILE
    );
    const summary = await getSummary(date, attendanceData, departmentData);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/trends", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const { attendanceData } = await processAttendanceData(
      ATTENDANCE_FILE,
      EMPLOYEE_FILE,
      DEPARTMENT_FILE
    );
    const trends = getAttendanceTrends(attendanceData, startDate, endDate);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/department-attendance", async (req, res) => {
  try {
    const { date } = req.body;
    const { attendanceData, departmentData } = await processAttendanceData(
      ATTENDANCE_FILE,
      EMPLOYEE_FILE,
      DEPARTMENT_FILE
    );
    const departmentAttendance = getDepartmentAttendance(
      date,
      attendanceData,
      departmentData
    );
    res.json(departmentAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//
app.get("/running", (req, res) => {
  res.send("Running");
})

const axios = require("axios");

setInterval(async () => {
  const res = await axios.get("https://csv-api-server.onrender.com/running");
  console.log(res.data);
}, 420000)
//


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
