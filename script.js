//DOM elements
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("button-add-task");
const todosList = document.getElementById("todos-list");
const itemsLeft = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("button-clear-completed");
const emptyState = document.querySelector(".empty-state");
const dateElement = document.getElementById("date");
const filters = document.querySelectorAll(".filter");
const emptyMsg = document.getElementById("empty-task-message");

//array to hold todo items for to-do list
let todos = [];
//filter to determine what tasks are shown
let currentFilter = "all";

//check for add task button being pressed to add task
addTaskBtn.addEventListener("click", () => {
  addTodo(taskInput.value);
});

//check for Enter button being pressed to add task
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo(taskInput.value);
});

//check for Clear Completed button being pressed to call clearCompleted function
clearCompletedBtn.addEventListener("click", clearCompleted);

//add text from user input to to-do list
function addTodo(text){
  //if the input is empty, don't add to the list
  if(text.trim() === "") return;

  //otherwise, add the input to the list

  //const for the todo item to be added, unique id, input text, and completed boolean
  const todo = {
    id: Date.now(),
    text,
    completed:false,
  };

  //add the todo var to the list
  todos.push(todo);
  //update local storage
  saveTodos();
  //update the UI
  renderTodos();
  //reset the input display
  taskInput.value = "";
}

//save to-do list to local storage
function saveTodos(){
  //save to local storage
  localStorage.setItem("todos", JSON.stringify(todos));
  //update number of tasks
  updateItemsCount();
  //check if there are tasks to display
  checkEmptyState();
}

//update number of tasks
function updateItemsCount(){
  //save amount of tasks that are not complete
  const uncompletedTodos = todos.filter((todo) => !todo.completed);
  //update the text that displays how many tasks are left to complete
  itemsLeft.textContent = `${uncompletedTodos?.length} active item${
    uncompletedTodos?.length !== 1 ? "s" : ""
  } left`;
}

//check if there are tasks
function checkEmptyState(){
  //check if there are any active tasks
  const filteredTodos = filterTodos(currentFilter);
  //update message
  if(currentFilter === "all"){
    emptyMsg.textContent = `There are currently no tasks.`;
  } else {
    emptyMsg.textContent = `There are currently no ${currentFilter} tasks.`;
  }

  //if there are no tasks, show empty list
  if (filteredTodos?.length === 0){
    emptyState.classList.remove("hidden");
  } else{
    emptyState.classList.add("hidden");
  }
}

//return the state of the given todo
function filterTodos(filter) {
  switch (filter) {
    //if there are active todo tasks
    case "active":
      //return not completed
      return todos.filter((todo) => !todo.completed);
    //if the todo tasks are complete
    case "completed":
      //return completed
      return todos.filter((todo) => todo.completed);
    //else,
    default:
      //return unfiltered todo
      return todos;
  }
}

//show todo list
function renderTodos() {
  //clear UI
  todosList.innerHTML = "";

  //save the current filter state
  const filteredTodos = filterTodos(currentFilter);

  //for each todo item, create elements to display
  filteredTodos.forEach((todo) => {
    //create list item
    const todoItem = document.createElement("li");
    todoItem.classList.add("todo-item");
    //mark as completed if needed
    if (todo.completed) todoItem.classList.add("completed");

    //create checkbox container
    const checkboxContainer = document.createElement("label");
    checkboxContainer.classList.add("checkbox-container");

    //create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("todo-checkbox");
    //save completion status
    checkbox.checked = todo.completed;
    //add listener to see if it is checked
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    //create span for checkmark
    const checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");

    //add checkbox and mark to container
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);

    //create text to display task
    const todoText = document.createElement("span");
    todoText.classList.add("todo-item-text");
    //copy input text to display text
    todoText.textContent = todo.text;

    //create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("button-delete");
    //use icon for button display
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    //add listener to see if it is clicked
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    //add checkbox container, task text, and delete button to item
    todoItem.appendChild(checkboxContainer);
    todoItem.appendChild(todoText);
    todoItem.appendChild(deleteBtn);

    //add whole item to todo list
    todosList.appendChild(todoItem);
  });

  //check if the any of the current filter tasks are displayed
  checkEmptyState();
}

//clearCompleted function called when Clear Completed button is pressed
//removes any tasks that are marked completed
function clearCompleted(){
  //save only the todos that are active
  todos = todos.filter(todo => !todo.completed);
  //save todo without completed todos to local storage
  saveTodos();
  //render updated list
  renderTodos();
}

//toggle between active/completed
function toggleTodo(id){
  //get all todos, and
  todos = todos.map((todo) => {
    //if this todo id matches
    if (todo.id === id) {
      //update the completed field
      return { ...todo, completed: !todo.completed };
    }

    //else, return as is
    return todo;
  });

  //save todo to local storage
  saveTodos();
  //render updated list
  renderTodos();
}

//delete selected todo list task
function deleteTodo(id){
  //delete the todo selected
  todos = todos.filter((todo) => todo.id !== id);
  //save todo list without the deleted todo
  saveTodos();
  //render updated list
  renderTodos();
}

//return the stored todos from local storage
function loadTodos(){
  //get todo from local storage
  const storedTodos = localStorage.getItem("todos");
  //if there are todo in local storage, store them
  if(storedTodos) todos = JSON.parse(storedTodos);
  //check if empty
  checkEmptyState();
  //render them
  renderTodos();
}

filters.forEach((filter) => {
  //set listener for each filter,  if clicked then
  filter.addEventListener("click", () => {
    //set the clicked filter as active
    setActiveFilter(filter.getAttribute("data-filter"));
  });
});

//set the active filter given the filter that was clicked
function setActiveFilter(filter){
  //set the current filter as the one received
  currentFilter = filter;

  //for each filter,
  filters.forEach((item) => {
    //check if the filter matched the clicked on
    if (item.getAttribute("data-filter") === filter) {
      //and set as active
      item.classList.add("active");
    } else {
      //else, remove from active
      item.classList.remove("active");
    }
  });

  //update display of which filter was clicked
  renderTodos();
}

//set today's date for display
function setDate(){
  //set format of date to display
  const options = {weekday:"long", month:"long", day:"numeric", year:"numeric"};
  //save today's date
  const today = new Date();

  //set today's date
  dateElement.textContent = today.toLocaleDateString("en-US", options);
}

//check for local storage todos as soon as DOM loads
window.addEventListener("DOMContentLoaded", () => {
  //check if there are any todo, and render
  loadTodos();
  //update display of tasks left
  updateItemsCount();
  //add date to display
  setDate();
});
