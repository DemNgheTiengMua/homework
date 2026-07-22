const attendance = Number(prompt("Nhập phần trăm chuyên cần:"));
const averageScore = Number(prompt("Nhập điểm trung bình:"));
const hasSpecialPermit = confirm("Sinh viên có giấy phép đặc biệt không?");

if (Number.isNaN(attendance) || Number.isNaN(averageScore)) {
  alert("Dữ liệu không hợp lệ.");
  console.log("Dữ liệu không hợp lệ.");
} else {
  const isEligible =
    (attendance > 80 && averageScore >= 5) || hasSpecialPermit;

  if (isEligible) {
    alert("Sinh viên được dự thi.");
    console.log("Sinh viên được dự thi.");
  } else {
    alert("Sinh viên không được dự thi.");
    console.log("Sinh viên không được dự thi.");
  }
}
