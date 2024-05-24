<script setup>
import { ref, onMounted, reactive } from "vue";
import { useToDoStore } from "@/stores/todo";

const myTodo = ref("");
const myTodoUpdateId = ref(null);

const todoStore = useToDoStore();

let todos = ref([]);

onMounted(async () => {
    await todoStore.initDatabase();
    await getData();
});

const getData = async () => {
    todos.value = await todoStore.getTodos();
}

const submit = async () => {
    if (myTodo.value.value) {
        try {
            const data = {
                id: myTodoUpdateId.value ?? new Date().getTime(),
                data: myTodo.value.value
            };
            await todoStore.createTodo(data);
            await getData();

            // reset value
            myTodo.value.value = '';
            myTodoUpdateId.value = null;
        } catch (error) {
            alert(error)
        }
    }
}

const getTodo = async (id) => {
    let todo = await todoStore.getTodo(id);
    if (todo) {
        myTodo.value.value = todo.data;
        myTodoUpdateId.value = todo.id;
    }
}

const removeTodo = async (id) => {
    try {
        await todoStore.deleteTodo(id);
        await getData();
    } catch (error) {
        alert(error)
    }
}
</script>
<template>
<h1>TODOS</h1>
<div class="pure-g" style="padding: 10px;">
    <div class="pure-u-1-2">
        <h3>My todo list</h3>
        <ul v-if="todos.length">
            <li v-for="(td, index) in todos" style="margin: 4px;">
                {{ index + 1 }}. {{ td.data }}
                <button type="button" class="margin-left: 5px;" @click.prevent="getTodo(td.id)">Edit</button>
                <button type="button" class="margin-left: 5px;" @click.prevent="removeTodo(td.id)">Delete</button>
            </li>
        </ul>
    </div>
    <div class="pure-u-1-2">
        <h3>Add todo list</h3>
        <form @submit.prevent="submit">
            <label>Todo: </label>
            <textarea ref="myTodo" style="width: 100%;" required></textarea>
            <button type="submit">Save</button>
        </form>
    </div>
</div>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css" crossorigin="anonymous"/>
</template>