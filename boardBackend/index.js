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
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: (new Date(Date.UTC(2021, 00, 21, 15, 48))).getTime(), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: (new Date(Date.UTC(2021, 00, 21, 16, 48))).getTime(), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: (new Date(Date.UTC(2021, 00, 21, 14, 48))).getTime(), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: (new Date(Date.UTC(2021, 00, 10, 16, 00))).getTime(), archived: true }
];



//Your endpoints go here

// Endpoints for bords

// 1. Read/get all boards
// GET /api/v1/boards

app.get(apiPath + version +'/boards', (req, res) => {
    let boardArray = [];
    for (let i = 0; i < boards.length; i++){
        boardArray.push({id: boards[i].id, name: boards[i].name, description: boards[i].description});
    }
    return res.status(200).json(boardArray);
})


// 2.  Read/get an individual board
// GET /api/v1/boards/:id

app.get(apiPath + version + '/boards/:id', (req, res) =>{
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error. Board id needs to be a number."});
    } 

    for ( let i = 0; i < boards.length; i++) {
        if (boards[i].id == req.params.id){
            return res.status(200).json(boards[i]);

        }
    }
    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."});
});


//3.  Create a new board
// POST /api/v1/boards
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
// PUT /api/v1/boards/:id
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
// DELETE /api/v1/boards/:id
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
            // delete the tasks that belong to the board that is being deleted
            for (let j = tasks.length - 1; j >= 0; j--){
                if (tasks[j].boardId == req.params.id) {
                    tasks.splice(j,1);
                }
            }
            return res.status(200).json(boards.splice(i, 1));
        }
    }

    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."})
});





// 6.  Delete all boards
// DELETE /api/v1/boards
app.delete(apiPath + version + '/boards', (req, res) => {
    var returnBoardsArray = boards.splice(0, boards.length);

    for (let i = 0; i < returnBoardsArray.length; i++){
        returnBoardsArray[i].tasks = [];

        for (let j = tasks.length - 1; j >= 0; j--){
                if (tasks[j].boardId == returnBoardsArray[i].id) {
                returnBoardsArray[i].tasks.push(tasks.splice(j,1));
            }
        }
    }

    return res.status(200).json(returnBoardsArray);
});




// Tasks


// the next 3 functions are helper functions for sorting when getting all the tasks for a board
function cmpByID(t1, t2){
    return Number(t1.id) - Number(t2.id);

}

function cmpBydateCreated(t1, t2){
    if (t1.dateCreated < t2.dateCreated){
        return -1;
    }
    else if (t1.dateCreated == t2.dateCreated){
        return 0;
    }
    else {
        return 1;
    }

}

function cmpByTaskName(t1, t2){
    if (t1.taskName < t2.taskName){
        return -1;
    }
    else if (t1.taskName == t2.taskName){
        return 0;
    }
    else {
        return 1;
    }
}


// Endpoints for tasks


// 1. Read all tasks for a specified board
// GET /api/v1/boards/:id/tasks?sort=id (/taskName/dateCreated)

app.get(apiPath + version +'/boards/:id/tasks', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error, id needs to be a number."});
    }

    for (let i=0; i < boards.length; i++){
        if (boards[i].id == req.params.id){
            break;
        }
        if (i == (boards.length-1) && req.params.id != boards[i].id) {
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
        if (req.query.sort === "taskName") {
            taskArray = taskArray.sort(cmpByTaskName);
        }
        if (req.query.sort === "dateCreated") {
            taskArray = taskArray.sort(cmpBydateCreated);
        }
        if (req.query.sort === "id") {
            taskArray = taskArray.sort(cmpByID);
        }
        // if there is no parameter for sorting, then the tasks are sorted by ids by default
        if (req.query.sort != "taskName" && req.query.sort != "dateCreated" && req.query.sort != "id") {
            taskArray = taskArray.sort(cmpByID);
        }
    }

    return res.status(200).json(taskArray);
})



// 2. Read an individaul task for the selected board
// GET /api/v1/boards/:id/tasks/:taskId

app.get(apiPath + version + '/boards/:id/tasks/:taskId', (req, res) =>{
    
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error. Board id needs to be a number."});
    } 

    if (isNaN(req.params.taskId)) {
        return res.status(400).json({"message": "Error. Task id needs to be a number."});
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
    
    for (let i=0; i < boards.length; i++){
        if (req.params.id == boards[i].id){
            var myNewTask = {id: nextTaskId, boardId: req.params.id, taskName: req.body.taskName, dateCreated: (new Date).getTime(), archived: false};
            
            boards[i].tasks.push(myNewTask.id);
            tasks.push(myNewTask);

            nextTaskId = nextTaskId + 1;

            return res.status(201).json(myNewTask);
        }
    }

    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."});

});



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
                // find where the task is located in the task array inside board
                for (let k = 0; k < boards[j].tasks.length; k++){
                    if (boards[j].tasks[k] == req.params.taskID){
                        boards[j].tasks.splice(k,1);
                    }
                }
            }
            else{
                return res.status(404).json({"message": "Board with id " + req.params.id + " does not have a task with task id " + req.params.taskID + "."})
            }
        }
    }

    for (let i = 0; i < tasks.length; i++){
        if (tasks[i].id == req.params.taskID && tasks[i].boardId == req.params.id){
            
            return res.status(200).json(tasks.splice(i, 1));
        }
    }

    return res.status(404).json({"message": "Board with id " + req.params.id + " and with task id " + req.params.taskID + " does not exist."})
});


// 5. Partially update a task for a board
// PATCH /api/v1/boards/:id/tasks/:taskid

app.patch(apiPath + version + '/boards/:id/tasks/:taskID', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({"message": "Error, board id needs to be a number."});
    }

    if (isNaN(req.params.taskID)) {
        return res.status(400).json({"message": "Error, task id needs to be a number."});
    }
    if (req.body === undefined || (req.body.taskName == undefined && req.body.archived == undefined
        && req.body.boardId == undefined )){
            return res.status(400).json({"message": "There has to be at least a taskName, archived or boardId in the request body."})
        }

    if (req.body.archived !== undefined && req.body.archived !== true && req.body.archived !== false){
        return res.status(400).json({"message": "Archived has to be true or false."});
    }

    if (req.body.boardId !== undefined && isNaN(req.body.boardId)){
        return res.status(400).json({"message": "BoardID has to be a number."});
    }

    

    for (let j = 0; j < boards.length; j++){
        if (boards[j].id == req.params.id) {
            for (let i = 0; i < tasks.length; i++){
                if (tasks[i].id == req.params.taskID && tasks[i].boardId == req.params.id){
                    if (req.body.boardId !== undefined){
                        // add the task to the board with the new boardId
                        for (let l = 0; l < boards.length; l++){
                            if (boards[l].id == req.body.boardId){
                                tasks[i].boardId = req.body.boardId;
                                boards[l].tasks.push(tasks[i].id);
                                break;
                            }
                            // The board with the new boardId does not exist
                            else if (l == boards.length - 1){
                                return res.status(404).json({"message": "Board with id " + req.body.boardId + " does not exist."})
                            }
                        }
                        //remove the task from the old board
                        for (let k = 0; k < boards[j].tasks.length; k++){
                            if(boards[j].tasks[k] == req.params.taskID){
                                boards[j].tasks.splice(k, 1);
                                break;
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


app.use('*', (req, res) => {
    res.status(405).json({"message": "Opperation not allowed"});
});

//Start the server
app.listen(port, () => {
    console.log('Board app listening...');
});