// File: js/app.js
// Student: Hala Madini (12428869)

const STUDENT_ID = "12428869";
const API_KEY = "nYs43u5f1oGK9";

const API_BASE = "https://corsproxy.io/?https://portal.almasar101.com/assignment/api";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const statusDiv = document.getElementById("status");
const list = document.getElementById("task-list");

function setStatus(message, isError = false) {
    if (!statusDiv) return;
    statusDiv.textContent = message || "";
    statusDiv.style.color = isError ? "#d9363e" : "#666666";
}

function appendTaskToList(task) {
    if (!task || !task.id) return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    const span = document.createElement("span");
    span.className = "task-title";
    span.textContent = task.title || "(no title)";

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const delBtn = document.createElement("button");
    delBtn.className = "task-delete";
    delBtn.type = "button";
    delBtn.textContent = "Delete";

    delBtn.addEventListener("click", function () {
        deleteTask(task.id, li);
    });

    actions.appendChild(delBtn);
    li.appendChild(span);
    li.appendChild(actions);
    list.appendChild(li);
}

function renderTasks(tasks) {
    list.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        setStatus("No tasks yet. Add one using the form above.");
        return;
    }

    setStatus("Loaded " + tasks.length + " tasks.");
    tasks.forEach(function (t) {
        appendTaskToList(t);
    });
}

async function loadTasks() {
    setStatus("Loading tasks...");
    const url = API_BASE + "/get.php?stdid=" + STUDENT_ID + "&key=" + API_KEY;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("HTTP error " + res.status);
        }
        const data = await res.json();

        if (data && data.tasks && Array.isArray(data.tasks)) {
            renderTasks(data.tasks);
        } else {
            renderTasks([]);
        }
    } catch (err) {
        console.error(err);
        setStatus("Error loading tasks", true);
    }
}

async function addTask(title) {
    if (!title || title.trim() === "") {
        setStatus("Please enter a task", true);
        return;
    }

    setStatus("Adding task...");
    const url = API_BASE + "/add.php?stdid=" + STUDENT_ID + "&key=" + API_KEY;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title.trim() })
        });

        if (!res.ok) {
            throw new Error("HTTP error " + res.status);
        }

        const data = await res.json();
        if (data && data.success) {
            if (data.task) {
                appendTaskToList(data.task);
            }
            input.value = "";
            setStatus("Task added");
        } else {
            setStatus("Failed to add task", true);
        }
    } catch (err) {
        console.error(err);
        setStatus("Error adding task", true);
    }
}

async function deleteTask(id, liElement) {
    if (!confirm("Delete this task?")) return;

    setStatus("Deleting...");
    const url = API_BASE + "/delete.php?stdid=" + STUDENT_ID + "&key=" + API_KEY + "&id=" + id;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("HTTP error " + res.status);
        }
        const data = await res.json();

        if (data && data.success) {
            if (liElement && liElement.parentNode === list) {
                liElement.remove();
            }
            setStatus("Task deleted");
        } else {
            setStatus("Failed to delete", true);
        }
    } catch (err) {
        console.error(err);
        setStatus("Error deleting task", true);
    }
}

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = input.value ? input.value.trim() : "";
        if (!title) {
            setStatus("Please enter a task title", true);
            return;
        }
        addTask(title);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
});