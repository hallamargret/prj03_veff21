//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

const apiPath = '/api/';
const version = 'v1';

var nextBoardId = 4;
var nextTaskId = 4;

//The following is an example of an array of three boards. 
var boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0","1","2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] }
];

var tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];

//Your endpoints go here

// 1. Read/get all boards
app.get(apiPath + version +'/boards', (req, res) => {
    let boardarray = [];
    for (let i = 0; i < boards.length; i++){
        boardarray.push({id: boards[i].id, name: boards[i].name, description: boards[i].description});
    }
    console.log(req.query.sort);
    return res.status(200).json(boardarray);
})


// 2.  Read/get an individual board
app.get(apiPath + version + '/boards/:id', (req, res) =>{
    console.log('req.params', req.params); // to get the id
    
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error. Board id needs to be a number."});
    } 

    for ( let i = 0; i< boards.length; i++) {
        if (boards[i].id == req.params.id){
            return res.status(200).json(boards[i]);

        }
    }
    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."});
});


//3.  Create a new board
app.post(apiPath + version +'/boards' , (req, res) => {
    if (req.body === undefined ||
        req.body.name === undefined ||
        req.body.description === undefined
        ) {
            return res.status(400).json({"message": "name and description are required in the request body."});
        }
    
    if (req.body.name.trim() === ""){
        return res.status(400).json({"message": "name of the board may not be empty"})
    }
    
    var myNewBoard = { id: nextBoardId, name: req.body.name, description: req.body.description, tasks: []};
    
    boards.push(myNewBoard);

    nextBoardId = nextBoardId + 1;

    return res.status(201).json(myNewBoard);

});




// 4.   Update a board

app.put(apiPath + version +'/boards/:id', (req, res) => {
    if (req.body === undefined || req.body.name == undefined || req.body.description === undefined) 
        {
            return res.status(400).json({"message": "There has to be a name and a description in the request body."});
        }

    if (req.body.name.trim() === ""){
        return res.status(400).json({"message": "name of the board may not be empty"});
        }
    
    for (let i = 0; i < tasks.length; i++){
        if (tasks[i].boardId == req.params.id){
            if (tasks[i].archived == false) {
                return res.status(400).json({"message": "The existing tasks for the board has to be archived to be able to update the board"});
            }
        }
    }

    for (let i = 0; i < boards.length; i++){
        if (boards[i].id == req.params.id){ 
            boards[i].name = req.body.name;
            boards[i].description = req.body.description;
            return res.status(200).json(boards[i]);
        }
    }
    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."});
});




// 5.  Delete a board
app.delete(apiPath + version +'/boards/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error, id needs to be a number."});
    }

    for (let i = 0; i < tasks.length; i++){
        if (tasks[i].boardId == req.params.id){
            if (tasks[i].archived == false) {
                return res.status(400).json({"message": "The existing tasks for the board has to be archived to be able to delete the board"});
            }
        }
    }

    for (let i = 0; i < boards.length; i++){
        if (boards[i].id == req.params.id) {
            return res.status(200).json(boards.splice(i, 1));
        }
    }

    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."})
});




// 6.  Delete all boards
app.delete(apiPath + version + '/boards', (req, res) => {
    var returnBoardsArray = boards.splice(0, boards.length);
    //boards = [];

    for (let i = 0; i < returnBoardsArray.length; i++){
        //let taskIds = returnBoardsArray[i].tasks.slice();
        returnBoardsArray[i].tasks = [];

        for (let j = tasks.length - 1; j >= 0; j--){
            //if (taskIds.includes(task[j].id)) {
                if (tasks[j].boardId == returnBoardsArray[i].id) {
                returnBoardsArray[i].tasks.push(tasks.splice(j,1));
            }
        }
    }
    console.log(returnBoardsArray);
    return res.status(200).json(returnBoardsArray);
});




// Tasks



function cmpByID(id1, id2){
    return Number(id1) - Number(id2);

}

function cmpBydateCreated(date1, date2){
    return (date1 - date2);

}

function cmpByTaskName(tName1, tName2){
    //if (tName1 < tName2)
    return (tName1 < tName2);
}


// Endpoints for tasks


// 1. Read all tasks for a specified board
// GET /api/v1/boards/:id/tasks

app.get(apiPath + version +'/boards/:id/tasks', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error, id needs to be a number."});
    }

    for (let i=0; i < boards.length; i++){
        if (boards[i].id == req.params.id){
            break;
        }
        if (i == boards.length && req.params.id != boards[i].id) {
            return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."});
        }   
    }

    let taskArray = [];

    for (let i = 0; i < tasks.length; i++){
        if (tasks[i].boardId == req.params.id){
            taskArray.push({id: tasks[i].id, boardId: tasks[i].boardId, taskName: tasks[i].taskName, dateCreated:tasks[i].dateCreated, archived: tasks[i].archived});
        }
    }

    if (taskArray.length > 1){
        if (req.query.sort ==="taskName") {
            taskArray = taskArray.sort(cmpByTaskName);
        }
        if (req.query.sort === "dateCreated") {
            taskArray = taskArray.sort(cmpBydateCreated);
        }
        if (req.query.sort === "id") {
            taskArray = taskArray.sort(cmpByID);
        }
        if (req.query.sort !="taskName" && req.query.sort !="dateCreated" && req.query.sort !="id") {
            taskArray = taskArray.sort(cmpByID);
        }

    }
    

    //console.log(req.query.sort);
    return res.status(200).json(taskArray);
})



// 2. Read an individaul task for the selected board
// GET /api/v1/boards/:id/tasks/:taskId

app.get(apiPath + version + '/boards/:id/tasks/:taskId', (req, res) =>{
    
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error. Board id needs to be a number."});
    } 

    if (isNaN(req.params.taskId)) {
        return res.status(400).json({"message": "Error. task id needs to be a number."});
    } 

    for (let j = 0; j < boards.length ; j++){
        if (boards[j].id == req.params.id){

            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].id == req.params.taskId && tasks[i].boardId == req.params.id){
                    return res.status(200).json(tasks[i]);
                }
            }
        }
    }
    
    return res.status(404).json({"message": "Board with id " + req.params.id + " and task id " + req.params.taskId + " does not exist."});
});


// 3. Create a new task for a specified board
 // POST /api/v1/boards/:id/tasks

 app.post(apiPath + version +'/boards/:id/tasks' , (req, res) => {
    if (req.body === undefined || req.body.taskName === undefined) {
            return res.status(400).json({"message": "Error, task name is required in the request body."});
        }

    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error. Board id needs to be a number."});
    } 
    
    if (req.body.taskName === ""){
        return res.status(400).json({"message": "name of the task may not be empty"})
    }
    
    for (let i=0; i < boards.length; i++){
        if (req.params.id == boards[i].id){
            var myNewTask = {id: nextTaskId, boardId: req.params.id, taskName: req.body.taskName, dateCreated: Date.now(), archived: false};
            // need to add the date to the new task, need to figure out how to make the date
            
            boards[i].tasks.push(myNewTask.id);
            tasks.push(myNewTask);

            nextTaskId = nextTaskId + 1;

            return res.status(201).json(myNewTask);
        }
    }

    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."});

});

//{ id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }


// 4. Delete a task for a specified board
// DELETE  /api/v1/boards/:id/tasks/:taskID

app.delete(apiPath + version +'/boards/:id/tasks/:taskID', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error, id needs to be a number."});
    }

    if (isNaN(req.params.taskID)) {
        return res.status(400).json({"message": "Error, task id needs to be a number."});
    }

    for (let j = 0; j < boards.length; j++){
        if (boards[j].id == req.params.id) {
            if (boards[j].tasks.includes(req.params.taskID)) {
                for (let i = 0; i < tasks.length; i++){
                    if (tasks[i].id == req.params.taskID){
                        return res.status(200).json(tasks.splice(i, 1));
                    }
                }
            }
        }
    }

    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist or does not have a task with task id " + req.params.taskID + "."})
});


// 5. Partially update a task for a board
// PATCH /api/v1/boards/:id/tasks/:taskid

app.patch(apiPath + version + '/boards/:id/tasks/:taskID', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error, id needs to be a number."});
    }

    if (isNaN(req.params.taskID)) {
        return res.status(400).json({"message": "Error, task id needs to be a number."});
    }
    if (req.body === undefined || (req.body.taskName == undefined && req.body.archived == undefined
        && req.body.boardId == undefined )){
            return res.status(400).json({"message": "There has to be at least a taskName, archived or boardId in the request body."})
        }

    if (req.body.archived !== undefined && req.body.archived !== true && req.body.archived !== false){
        return res.status(400).json({"message": "Archived has to be true or false"});
    }

    for (let j = 0; j < boards.length; j++){
        if (boards[j].id == req.params.id) {
            // if (boards[j].tasks.includes(req.params.taskID)) {
                for (let i = 0; i < tasks.length; i++){
                    if (tasks[i].id == req.params.taskID && tasks[i].boardId == req.params.id){
                        if (req.body.boardId !== undefined){
                            //remove the task from the old board
                            var oldBoardId = tasks[i].boardId;
                            for (let k = 0; k < boards.length; k++){
                                if (boards[k].id == oldBoardId){
                                    for (let j = 0; j < boards[k].tasks.length; j++){
                                        if(boards[k].tasks[j] == req.params.taskID){
                                            boards[k].tasks.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                            }
                            // add the task to the new board
                            for (let l = 0; l < boards.length; l++){
                                if (boards[l].id == req.body.boardId){
                                    tasks[i].boardId = req.body.boardId;
                                    boards[l].tasks.push(tasks[i].id);
                                }
                                else if (l == boards.length - 1){
                                    return res.status(404).json({"message": "Board with id " + req.body.boardId + " does not exist."})
                                }
                            }
                        }
                        if (req.body.archived !== undefined && (req.body.archived == true || req.body.archived == false)){
                            tasks[i].archived = req.body.archived;
                        }
                        if (req.body.taskName !== undefined){
                            tasks[i].taskName = req.body.taskName;
                        }
                        return res.status(200).json(tasks[i]);
                    }
                }
        }
    }
    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist or does not have a task with task id " + req.params.taskID + "."})
});




//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});