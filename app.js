
//Variables
let toDoList = JSON.parse(localStorage.getItem('toDoList'));
const listHolderElement = document.querySelector('#list-holder');
const addInput = document.querySelector('#addInput');

//init view
createListTemplate();

let draggables = document.querySelectorAll('.draggable');
const dragContainers = document.querySelectorAll('.drag-container');


//Event listeners

addInput.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        storeToDo();
    }
})

//Functions

function getIndexFromId(id) {
    return parseInt(id.slice(4));
}

function createListElement(index, element) {
    const listElementContainer = document.createElement('div')
    listElementContainer.setAttribute('id', 'row-' + index);
    listElementContainer.setAttribute('draggable', true);
    listElementContainer.classList.add('list-element-container', 'draggable');

    listElementContainer.addEventListener('dragstart', () => {
        listElementContainer.classList.add('dragging');
    });

    listElementContainer.addEventListener('dragend', () => {
        listElementContainer.classList.remove('dragging');
        const idList = [];
        draggables = document.querySelectorAll('.draggable');
        draggables.forEach((draggable) => {
            idList.push(getIndexFromId(draggable.id))
        });
        const updatedList = [];
        idList.forEach((e) => {
            updatedList.push(toDoList[e])
        });
        toDoList = updatedList;
        setListToStorage(toDoList);
        reRender();
    });
    listElementContainer.innerHTML =
     `
        <p id="${index}" ${element.isDone ? 
            'class="completed-todo todo-text"' :
            'class="todo-text"' }>${element.description}</p>
        <div class="control-button-holder">
            <img onclick="toggleTodo(${index})" ${element.isDone ? 
                'src="./assets/images/reset.png" class="todo-icon"' :
                'src="./assets/images/completed.png" class="todo-icon complete-icon"'}>
            <img onclick="deleteTodo(${index})" src="./assets/images/delete-icon.png" class="todo-icon delete-icon">
        </div>
    `
    return listElementContainer
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, child) =>{
        const box = child.getBoundingClientRect();
        //offset is the distance between the center of the box and our cursor
        const offset = y - box.top - box.height / 2
        if(offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

dragContainers.forEach(container => {
    container.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if(afterElement == null) {
            container.appendChild(draggable)
        } else {
            container.insertBefore(draggable, afterElement)
        }
    })
});

function render(todoElement, listHolderElement) {
    listHolderElement.appendChild(todoElement);
}

function reRender() {
    listHolderElement.innerHTML = '';
    for (const [index, element] of toDoList.entries()) {
        render(createListElement(index, element),listHolderElement);
    }
}

function storeToDo() {
    let inputValue = addInput?.value;
    if(inputValue) {
        const toDoElement = new ToDoElement(inputValue, false);
        if (toDoList.length === 0) {  
            toDoList = [toDoElement];        
        } else {
            toDoList.push(toDoElement);
        }
        setListToStorage(toDoList);
        reRender();
        addInput.value = '';
    }
}

function setListToStorage(listToSet) {
    localStorage.setItem('toDoList', JSON.stringify(listToSet));
}

function createListTemplate() {
    for (const [index, element] of toDoList.entries()) {
        render(createListElement(index, element),listHolderElement);
    }
}

function deleteTodo(indexToDelete) {
    toDoList.splice(indexToDelete, 1);
    setListToStorage(toDoList);
    reRender();
}

function toggleTodo(idToToggle) {
    toDoList[idToToggle].isDone ?
        document.getElementById(idToToggle).classList.add('completed-todo') :
        document.getElementById(idToToggle).classList.remove('completed-todo');
    toDoList[idToToggle].isDone = !toDoList[idToToggle].isDone;
    setListToStorage(toDoList);
    reRender();
}

function ToDoElement(description, isDone) {
    this.description = description;
    this.isDone = isDone;
}
