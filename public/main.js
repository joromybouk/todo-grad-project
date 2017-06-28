var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var toCompleteDiv = document.getElementById("count-label");
var buttonList = document.getElementById("button-list");
var active = true;
var completed = true;
var lastDeleted;

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var today = new Date();
    var date = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();
    fetch("./api/todo", {method: "post", headers: {"Content-type": "application/json"},
        body: JSON.stringify({title: title, isComplete: false, isFavourite: false, date: date, time: time})
    }).then(function(response) {
        if (response.status !== 201) {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    }).then(callback);
}

function deleteToDo(id, callback) {
    var api = "/api/todo/" + id;
    fetch(api, {method: "delete"}).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to delete todo item";
        }
    }).then(callback);
}

function updateCompleted(id, callback) {
    var api = "/api/todo/" + id;
    fetch(api, {method: "put"}).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to make item completed";
        }
    }).then(callback);
}

function updateFavourite(id, callback) {
    var api = "/api/todo/fav/" + id;
    fetch(api, {method: "put"}).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to favourite item";
        }
    }).then(callback);
}

function getTodoList(callback) {
    fetch("./api/todo").then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to get todo list";
        }
        else {
            response.json().then(callback);
        }
    });
}

//appends delete button element to todo list item
function addDeleteButton(listItem, todo) {
    var deleteButton = document.createElement("BUTTON");
    deleteButton.className = "delete";
    deleteButton.innerHTML = "X";
    //click delete button -> the id of the todo is taken and used to delete the todo
    deleteButton.onclick = function(e) {
        e.preventDefault();
        lastDeleted = todo;
        deleteToDo(todo.id, function() {
            reloadTodoList();
        });
    };
    listItem.append(deleteButton);
    return listItem;
}

function addFavouriteButton(listItem, todo) {
    var favButton = document.createElement("P");
    favButton.className = "fav";
    var text = "&#9734;";
    if (todo.isFavourite) {
        text = "&#9733;";
    }
    favButton.innerHTML = text;
    favButton.onclick = function(e) {
        e.preventDefault();
        updateFavourite(todo.id, function() {
            reloadTodoList();
        });
    };
    listItem.append(favButton);
    return listItem;
}

function addCompleteButton(listItem, todo) {
    var completeButton = document.createElement("BUTTON");
    var text = "&#10004;";
    if (todo.isComplete) {
        text = "&#9100;";
    }
    completeButton.className = "completed";
    completeButton.innerHTML = text;
    completeButton.onclick = function(e) {
        e.preventDefault();
        updateCompleted(todo.id, function() {
            reloadTodoList();
        });
    };
    listItem.append(completeButton);
    return listItem;
}

function addDeleteCompleted(classIn) {
    var deleteCompletedButton = document.createElement("BUTTON");
    var t = document.createTextNode("Delete Completed");
    deleteCompletedButton.appendChild(t);
    deleteCompletedButton.className = classIn;
    deleteCompletedButton.onclick = function(e) {
        getTodoList(function(todos) {
            todos.forEach(function(todo) {
                if (todo.isComplete) {
                    deleteToDo(todo.id, function() {
                        reloadTodoList();
                    });
                }
            });
        });
    };
    buttonList.append(deleteCompletedButton);
}

function addShowToComplete() {
    var toComp = document.createElement("BUTTON");
    var t = document.createTextNode("Active");
    toComp.appendChild(t);
    toComp.onclick = function(e) {
        e.preventDefault();
        active = true;
        completed = false;
        reloadTodoList();
    };
    buttonList.append(toComp);
}

function addShowAll() {
    var allButton = document.createElement("BUTTON");
    var t = document.createTextNode("All");
    allButton.appendChild(t);
    allButton.onclick = function(e) {
        e.preventDefault();
        active = true;
        completed = true;
        reloadTodoList();
    };
    buttonList.append(allButton);
}

function addShowCompleted() {
    var completedButton = document.createElement("BUTTON");
    var t = document.createTextNode("Completed");
    completedButton.appendChild(t);
    completedButton.onclick = function(e) {
        e.preventDefault();
        active = false;
        completed = true;
        reloadTodoList();
    };
    buttonList.append(completedButton);
}

function reloadTodoList() {
    getTodoList(function(todos) {
        var toCompleteCount = 0;
        var completedCount = 0;
        toCompleteDiv.textContent = "No tasks to complete";
        if (completed && !active) {
            toCompleteDiv.textContent = "No tasks completed";
        }
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }
        while (buttonList.firstChild) {
            buttonList.removeChild(buttonList.firstChild);
        }
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            if ((active && !todo.isComplete) || (completed && todo.isComplete)) {
                var listItem = document.createElement("li");
                listItem.className = "todolist";
                addFavouriteButton(listItem, todo);
                var para = document.createElement("P");
                para.className = "todoName";
                para.innerHTML = todo.title;
                listItem.appendChild(para);
                if (todo.isComplete) {
                    listItem.style.color = "green";
                    completedCount++;
                }
                else {
                    toCompleteCount++;
                    listItem.style.color = "blue";
                }
                var todoinfo = document.createElement("P");
                todoinfo.className = "date";
                todoinfo.innerHTML = todo.date + "&nbsp;&nbsp&nbsp;&nbsp;&nbsp;" + todo.time;
                listItem.appendChild(todoinfo);
                addCompleteButton(listItem, todo);
                addDeleteButton(listItem, todo);
                todoList.appendChild(listItem);
            }
        });
        addShowAll();
        addShowToComplete();
        addShowCompleted();
        if (toCompleteCount !== 0) {
            toCompleteDiv.textContent = "Tasks left to complete: " + toCompleteCount;
        }
        if (completedCount !== 0 && completed && !active) {
            toCompleteDiv.textContent = "Tasks completed: " + completedCount;
        }
        if (completedCount > 0) {
            addDeleteCompleted("buttonList");
        }
        else {
            addDeleteCompleted("noDeleteComplete");
        }
    });
}
reloadTodoList();
