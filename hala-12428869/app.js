// File: js/app.js
// Student: Hala Madini (12428869)

const STUDENT_ID = "12428869";
const API_KEY = "nYs43u5f1oGK9";
const API_BASE = "https://portal.almasar101.com/assignment/api";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const statusDiv = document.getElementById("status");
const list = document.getElementById("task-list");

function setStatus(message, isError = false) {
    if (!statusDiv) return;
    statusDiv.textContent = message || "";
    statusDiv.style.color = isError ? "#d9363e" : "#666666";
}

let localTasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]');

function renderTask(task) {
    if (!list) return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id || Date.now();

    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-delete";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", async function () {
        if (!confirm("Delete this task?")) return;

        const taskId = li.dataset.id;

    
        try {
            setStatus("Deleting task...");
            const url = ${ API_BASE }/delete.php?stdid=${encodeURIComponent(STUDENT_ID)}&key=${encodeURIComponent(API_KEY)}&id=${encodeURIComponent(taskId)};
            await fetch(url, { method: "GET" });
        } catch (error) {
            console.log("Server delete failed, deleting locally only");
        }

  
        li.remove();
        localTasks = localTasks.filter(t => t.id != taskId);
        localStorage.setItem('todo_tasks', JSON.stringify(localTasks));
        setStatus("Task deleted");
    });

    actionsDiv.appendChild(deleteBtn);
    li.appendChild(titleSpan);
    li.appendChild(actionsDiv);
    list.appendChild(li);
}

document.addEventListener("DOMContentLoaded", async function () {
    setStatus("Loading...");

    try {
        const url = ${ API_BASE }/get.php?stdid=${encodeURIComponent(STUDENT_ID)}&key=${encodeURIComponent(API_KEY)};
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.tasks) {
                list.innerHTML = "";
                data.tasks.forEach(task => renderTask(task));
                setStatus(Loaded ${ data.tasks.length } tasks from server);
                return;
            }
        }
    } catch (error) {
        console.log("Server load failed, using local storage");
    }

    list.innerHTML = "";
    localTasks.forEach(task => renderTask(task));
    setStatus(Loaded ${ localTasks.length } local tasks);
});

if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = input.value.trim();
        if (!title) {
            setStatus("Please enter a task", true);
            return;
        }

        setStatus("Adding task...");

   
        const newTask = {
            id: Date.now(),
            title: title,
            created_at: new Date().toISOString()
        };

      
        renderTask(newTask);

        localTasks.push(newTask);
        localStorage.setItem('todo_tasks', JSON.stringify(localTasks));

       
        try {
            const url = ${ API_BASE }/add.php?stdid=${encodeURIComponent(STUDENT_ID)}&key=${encodeURIComponent(API_KEY)};
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title })
            });
            setStatus("Task added (saved to server)");
        } catch (error) {
            setStatus("Task added (local only - server unavailable)");
        }

        input.value = "";
        input.focus();
    });
}