
//Variables
let toDoList = JSON.parse(localStorage.getItem('toDoList'));
const listHolderElement = document.querySelector('#list-holder');
const addInput = document.querySelector('#addInput');

//init view
createListTemplate();

let draggables = document.querySelectorAll('.draggable');
const dragContainers = document.querySelectorAll('.drag-container');

//Event listeners

const config = { attributes: true, childList: true, subtree: true };
const callback = function(mutationsList, observer) {
    draggables = document.querySelectorAll('.draggable');
    draggables.forEach((draggable) => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });
    
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    })
}

const observer = new MutationObserver(callback);
observer.observe(listHolderElement, config);

addInput.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        storeToDo();
    }
})

draggables.forEach((draggable) => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
    });
})

dragContainers.forEach(container => {
    container.addEventListener('dragover', e => {
        e.preventDefault()
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if(afterElement == null) {
            container.appendChild(draggable)
        } else {
            container.insertBefore(draggable, afterElement)
        }
    })

    container.addEventListener('drop', () => {
        const idList = [];
        draggables.forEach((draggable) => {
            idList.push(getIndexFromId(draggable.id))
        });
        const updatedList = [];
        idList.forEach((e) => {
            updatedList.push(toDoList[e])
        });
        setListToStorage(updatedList);

    })
});

//Functions

function getIndexFromId(id) {
    return parseInt(id.slice(4));
}

function getDragAfterElement(container, y) {
    //ignore everything we currently dragging
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    //végigiterálok a tömbön, és megnézem, hogy melyik draggable element-ek lesznek az egerem fölött
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

function createListElement(index, element) {
    if(element.isDone) {
        return `
        <div id="${'row-' + index}" class="list-element-container draggable" draggable="true">
            <p id="${index}" class="completed-todo todo-text">${element.description}</p>
            <div class="control-button-holder">
                <img onclick="reactivateTodo(${index})" src="./assets/images/reset.png" class="todo-icon">
                <img onclick="deleteTodo(${index})" src="./assets/images/delete-icon.png" class="todo-icon delete-icon">
            </div>
        </div>
        `
    } else {
        return `
        <div id="${'row-' + index}" class="list-element-container draggable" draggable="true">
            <p id="${index}" class="todo-text">${element.description}</p>
            <div class="control-button-holder">
                <img id="${'complete-btn-' + index}" onclick="completeTodo(${index})" src="./assets/images/completed.png" class="todo-icon complete-icon">
                <img onclick="deleteTodo(${index})" src="./assets/images/delete-icon.png" class="todo-icon delete-icon">
            </div>
        </div>
        `
    }
}

function render(templateString, element) {
    element.innerHTML += templateString;
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
            toDoList = [];
            toDoList.push(toDoElement);            
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

function completeTodo(idToComplete) {
    document.getElementById(idToComplete).classList.add('completed-todo');
    toDoList[idToComplete].isDone = true;
    setListToStorage(toDoList);
    reRender();
}

function reactivateTodo(idToReactivate) {
    document.getElementById(idToReactivate).classList.remove('completed-todo');
    toDoList[idToReactivate].isDone = false;
    setListToStorage(toDoList);
    reRender();
}

function ToDoElement(description, isDone) {
    this.description = description;
    this.isDone = isDone;
}
