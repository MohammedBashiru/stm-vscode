(function() {
  document.getElementById(
    "taskEntryDate"
  ).value = new Date().toISOString().slice(0, 10);

  const vscode = acquireVsCodeApi();

  addMoreButton = document.getElementById("addMore");
  addMoreButton.addEventListener("click", event => {
    cloneLi = document.createElement("li");
    cloneLi.classList.add("task");
    const cloneBody = `
                <div class="icon">
                    <span><i class="fa fa-trash-alt"></i></span>
                </div>
                <div class="input">
                    <textarea name="taskfield" cols="30" rows="2" value=""></textarea>
                </div>
        `;
    cloneLi.innerHTML = cloneBody;
    document.querySelector(".task-manager").appendChild(cloneLi);
    registerAllDeleteBtn();
  });

  const registerAllDeleteBtn = () => {
    const deleteBtns = document.querySelectorAll(".task .icon");
    if (deleteBtns.length > 1) {
      deleteBtns.forEach(element => {
        element.addEventListener("click", () => {
          const deleteBtns = document.querySelectorAll(".task .icon");
          if (deleteBtns.length > 1) {
            element.closest(".task").remove();
          }
        });
      });
    }
  };

  //Check and disable button if no task added
  const createTaskBtn = document.getElementById("createTask");
  createTaskBtn.addEventListener("click", () => {
    const taskEntryDate = document.getElementById("taskEntryDate").value;
    if (!taskEntryDate) {
      vscode.postMessage({
        command: "alert",
        text: "Please select task entry date"
      });
      return;
    }

    const taskInputs = document.querySelectorAll(".task textarea");
    let canCreate = true;
    taskInputs.forEach(element => {
      if (!element.value) {
        vscode.postMessage({
          command: "alert",
          text: "One of your Task has no value. Please do so or remove it."
        });
        canCreate = false;
        return;
      }
    });

    if (canCreate) {
      //Time to create task;
      const taskMaster = {
        date: taskEntryDate,
        type: "allday"
      };

      const taskBody = [];
      taskInputs.forEach(element => {
        taskBody.push(element.value);
      });

      //Time to send request
      const data = JSON.stringify({
        action: 102,
        data: {
          master: taskMaster,
          details: taskBody
        }
      });

      document.querySelector(".loader").classList.remove("hide");
      document.querySelector(".overlay").classList.remove("hide");

      setTimeout(() => {
        vscode.postMessage({
          command: "saveTask",
          data
        });
      }, 300);
    }
  });

  window.addEventListener("message", event => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case "success":
        clearTaskEntry();
        document.querySelector(".loader").classList.add("hide");
        document.querySelector(".overlay").classList.add("hide");
        break;

      case "error":
        document.querySelector(".loader").classList.add("hide");
        document.querySelector(".overlay").classList.add("hide");
        break;
    }
  });

  const clearTaskEntry = () => {
    const taskInputs = document.querySelectorAll(".task textarea");
    taskInputs.forEach(element => {
      element.closest(".task").remove();
    });
  };
})();
