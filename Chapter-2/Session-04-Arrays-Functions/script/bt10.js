const tasks = [];

function addTask(title) {
  tasks.push(title);
}

function removeTask(index) {
  if (index >= 0 && index < tasks.length) {
    tasks.splice(index, 1);
  }
}

function displayTasks() {
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task}`);
  });
}

addTask("Học JavaScript");
addTask("Làm bài tập");
addTask("Đọc tài liệu");
displayTasks();

removeTask(1);
displayTasks();
