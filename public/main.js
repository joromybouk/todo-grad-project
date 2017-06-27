var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete: false,
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function deleteToDo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send();
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to delete item";
        }
    };
}

function updateCompleted(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send();
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to make item completed";
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

//appends delete button element to todo list item
function addDeleteButton(listItem, todo) {
    var deleteButton = document.createElement("BUTTON");
    var t = document.createTextNode("DELETE");
    deleteButton.appendChild(t);
    //click delete button -> the id of the todo is taken and used to delete the todo
    deleteButton.onclick = function(e) {
        e.preventDefault();
        deleteToDo(todo.id, function() {
            reloadTodoList();
        });
    };
    listItem.append(deleteButton);
    return listItem;
}

function addCompleteButton(listItem, todo) {
    var completeButton = document.createElement("BUTTON");
    var text = "Complete";
    if (todo.isComplete) {
        text = "Undo Complete";
    }
    var t = document.createTextNode(text);
    completeButton.appendChild(t);
    completeButton.onclick = function(e) {
        e.preventDefault();
        updateCompleted(todo.id, function() {
            reloadTodoList();
        });
    };
    listItem.append(completeButton);
    return listItem;
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            if (todo.isComplete) {
                listItem.style.color = "green";
            }
            addDeleteButton(listItem, todo);
            addCompleteButton(listItem, todo);
            todoList.appendChild(listItem);

        });
    });
}

reloadTodoList();
