function simulateTask(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Task failed"));
        return;
      }

      resolve("Task Completed!");
    }, 2000);
  });
}

async function runTask() {
  try {
    const message = await simulateTask();
    console.log(message);
  } catch (error) {
    console.error(error.message);
  }
}

runTask();
