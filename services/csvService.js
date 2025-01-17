const fs = require("fs");
const csv = require("csv-parser");

// Utility to parse CSV into JSON
const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });

const processAttendanceData = async (
  attendanceFile,
  employeeFile,
  departmentFile
) => {
  const [attendanceData, employeeData, departmentData] = await Promise.all([
    parseCSV(attendanceFile),
    parseCSV(employeeFile),
    parseCSV(departmentFile),
  ]);

  return { attendanceData, employeeData, departmentData };
};

// Process API logic
const getSummary = async (date, attendanceData, departmentData) => {
  const totalEmployees = departmentData.reduce(
    (sum, dept) => sum + parseInt(dept.totalEmployees, 10),
    0
  );
  const totalVacancies = departmentData.reduce(
    (sum, dept) => sum + parseInt(dept.vacancies, 10),
    0
  );

  const presentEmployees = attendanceData.filter(
    (row) => row.date === date && row.attendanceStatus === "Present"
  );
  const absentEmployees = attendanceData.filter(
    (row) => row.date === date && row.attendanceStatus === "Absent"
  );
  const onLeaveEmployees = attendanceData.filter(
    (row) => row.date === date && row.attendanceStatus === "Leave"
  );

  return {
    totalEmployees,
    totalVacancies,
    totalPresent: presentEmployees.length,
    totalAbsent: absentEmployees.length,
    totalOnLeave: onLeaveEmployees.length,
  };
};

const getAttendanceTrends = (attendanceData, startDate, endDate) => {
  const filteredData = attendanceData.filter(
    (row) => row.date >= startDate && row.date <= endDate
  );

  const trends = {};
  filteredData.forEach((row) => {
    if (!trends[row.date])
      trends[row.date] = { present: 0, absent: 0, leave: 0 };
    if (row.attendanceStatus === "Present") trends[row.date].present++;
    if (row.attendanceStatus === "Absent") trends[row.date].absent++;
    if (row.attendanceStatus === "Leave") trends[row.date].leave++;
  });

  return trends;
};

const getDepartmentAttendance = (date, attendanceData, departmentData) => {
  const departmentAttendance = departmentData.map((dept) => {
    const deptAttendance = attendanceData.filter(
      (row) => row.date === date && row.departmentId === dept.departmentId
    );
    const presentCount = deptAttendance.filter(
      (row) => row.attendanceStatus === "Present"
    ).length;
    const absentCount = deptAttendance.filter(
      (row) => row.attendanceStatus === "Absent"
    ).length;
    const leaveCount = deptAttendance.filter(
      (row) => row.attendanceStatus === "Leave"
    ).length;

    return {
      departmentName: dept.departmentName,
      totalPresent: presentCount,
      totalAbsent: absentCount,
      totalOnLeave: leaveCount,
    };
  });

  return departmentAttendance;
};

module.exports = {
  parseCSV,
  processAttendanceData,
  getSummary,
  getAttendanceTrends,
  getDepartmentAttendance,
};
