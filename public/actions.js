var error = document.getElementById("error");

function createTodo(title, callback) {
    var today = new Date();
    var date = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
    var min;
    (today.getMinutes() < 10) ? min = "0" + today.getMinutes() : min = today.getMinutes().toString();
    var time = today.getHours() + ":" + min;
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