var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var toCompleteDiv = document.getElementById("count-label");
var buttonList = document.getElementById("button-list");
var active = true;
var completed = true;

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

function addDeleteCompleted() {
    var deleteCompletedButton = document.createElement("BUTTON");
    var t = document.createTextNode("Delete Completed");
    deleteCompletedButton.appendChild(t);
    deleteCompletedButton.onclick = function(e) {
        getTodoList(function(todos) {
            todos.forEach(function(todo) {
                if (todo.isComplete){
                    deleteToDo(todo.id, function() {
                        reloadTodoList();
                    });
                }
            });
        });
    }
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
    }
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
    }
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
    }
    buttonList.append(completedButton);
}

function reloadTodoList() {
    getTodoList(function(todos) {
        var toCompleteCount = 0;
        var completedCount = 0;
        toCompleteDiv.textContent = "No tasks to complete";
        if(completed && !active){
            toCompleteDiv.textContent = "No tasks completed";
        }
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }
        while(buttonList.firstChild){
            buttonList.removeChild(buttonList.firstChild);
        }
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            if ( (active && !todo.isComplete) || (completed && todo.isComplete) )
            {
                var listItem = document.createElement("li");
                listItem.textContent = todo.title;
                if (todo.isComplete) {
                    listItem.style.color = "green";
                    completedCount++;
                }
                else {
                    toCompleteCount++;
                    listItem.style.color = "blue";
                }
                addDeleteButton(listItem, todo);
                addCompleteButton(listItem, todo);
                todoList.appendChild(listItem);
            }
        });
            addShowAll();
            addShowToComplete();
            addShowCompleted();
        if (toCompleteCount !== 0) {
            toCompleteDiv.textContent = "Tasks left to complete: " + toCompleteCount;
        }
        if (completedCount !== 0) {
            toCompleteDiv.textContent = "Tasks completed: " + completedCount;
        }
        if (completedCount > 0) {
            addDeleteCompleted();
        } 
    });
}

reloadTodoList();
