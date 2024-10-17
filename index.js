
class TodoList {
    constructor() {
        this.tasks = [];
        this.doneTasks = [];
        this.observers = [];
        this.loadFromLocalStorage();
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify() {
        this.observers.forEach(observer => observer.update(this.tasks, this.doneTasks));
    }

    addTask(task) {
        this.tasks.push({ name: task, isDone: false });
        this.saveToLocalStorage();
        this.notify();
    }

    removeTask(taskName) {
        this.tasks.splice(this.tasks.findIndex(task => task.name === taskName), 1);
        this.saveToLocalStorage();
        this.notify();
    }

    removeDoneTask(taskName) {
        this.doneTasks.splice(this.doneTasks.findIndex(task => task.name === taskName), 1);
        this.saveToLocalStorage();
        this.notify();
    }
    removeAllDoneTask(){
        this.doneTasks = [];
        this.saveToLocalStorage();
        this.notify();
    }

    markTaskAsDone(taskName) {
        const taskIndex = this.tasks.findIndex(task => task.name === taskName);
        if (taskIndex !== -1) {
            const [doneTask] = this.tasks.splice(taskIndex, 1);
            this.doneTasks.push(doneTask);
            this.saveToLocalStorage();
            this.notify();
        }
    }

    markDoneTaskAsTask(taskName) {
        const taskIndex = this.doneTasks.findIndex(task => task.name === taskName);
        if (taskIndex !== -1) {
            const [task] = this.doneTasks.splice(taskIndex, 1);
            this.tasks.push(task);
            this.saveToLocalStorage();
            this.notify();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
        localStorage.setItem("doneTasks", JSON.stringify(this.doneTasks));
    }

    loadFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
        this.tasks = tasks;
        this.doneTasks = doneTasks;
    }
}

class TodoUI {
    constructor(todoListElement, doneListElement) {
        this.todoListElement = todoListElement;
        this.doneListElement = doneListElement;
    }

    // Обновление интерфейса
    update(tasks, doneTasks) {
        this.render(tasks, doneTasks);
    }

    // Рендер задач
    render(tasks, doneTasks) {
        this.todoListElement.innerHTML = '';
        this.doneListElement.innerHTML = '';

        tasks.forEach(task => this.setTask(task));
        doneTasks.forEach(task => this.setDoneTask(task));
    }

    setTask(task) {
        this.todoListElement.innerHTML += `
            <article class="tasks__task">
                <button class="task__check" data-action="check" data-name="${task.name}">
                    <img src="./images/check_icon.svg" alt="отметить выполненную задачу" class="check_img" style="display: none">
                </button>
                <p class="task__text">${task.name}</p>
                <button class="task__delete" data-action="delete" data-name="${task.name}">
                    <img src="./images/trashcan_icon.svg" alt="удалить задачу" class="trash_img">
                </button>
            </article>
        `;
    }

    setDoneTask(task) {
        this.doneListElement.innerHTML += `
            <article class="done_task">
                <button class="done_task__check" data-action="checkDone" data-name="${task.name}" style="background-color: #1E6F9F">
                    <img src="./images/check_icon.svg" alt="отметить выполненную задачу" class="check_img">
                </button>
                <p class="task__text done_task__text">${task.name}</p>
                <button class="done_task__delete" data-action="deleteDone" data-name="${task.name}">
                    <img src="./images/trashcan_icon.svg" alt="удалить задачу" class="trash_img">
                </button>
            </article>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const todoListElement = document.querySelector('.tasks__list');
    const doneListElement = document.querySelector('.done__list');

    const todoList = new TodoList();
    const todoUI = new TodoUI(todoListElement, doneListElement);


    todoList.subscribe(todoUI);
    todoList.notify();
    // Добавляем слушатели для кнопок
    document.querySelector('.form__btn').addEventListener('click', () => {
        const taskInput = document.querySelector('.form__input');
        const taskText = taskInput.value.trim();
        if (taskText) {
            todoList.addTask(taskText);
            taskInput.value = '';
        }
    });

    document.querySelector(`.delete_done`).addEventListener('click', () => {
        todoList.removeAllDoneTask();
    })

    // Делегирование событий для работы с задачами
    todoListElement.addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        const taskName = e.target.closest('button')?.dataset.name;

        if (action === 'check') {
            todoList.markTaskAsDone(taskName);
        } else if (action === 'delete') {
            todoList.removeTask(taskName);
        }
    });

    doneListElement.addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        const taskName = e.target.closest('button')?.dataset.name;

        if (action === 'deleteDone') {
            todoList.removeDoneTask(taskName);
        } else if (action === 'checkDone'){
            todoList.markDoneTaskAsTask(taskName);
        }
    });
});




