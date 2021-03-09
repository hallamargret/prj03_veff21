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


//Create a new board
app.post(apiPath + version +'/boards' , (req, res) => {
    if (req.body === undefined ||
        req.body.name === undefined ||
        req.body.description === undefined
        ) {
            return res.status(400).json({"message": "name and description are required in the request body."});
        }
    
    if (req.body.name === ""){
        return res.status(400).json({"message": "name of the board may not be empty"})
    }
    
    var myNewBoard = { id: nextBoardId, name: req.body.name, description: req.body.description, tasks: []};
    
    boards.push(myNewBoard);

    nextBoardId = nextBoardId + 1;

    return res.status(201).json(myNewBoard);

});




// Update a board

app.put(apiPath + version +'/boards/:id', (req, res) => {
    if (req.body === undefined || req.body.name == undefined || req.body.description === undefined) 
        {
            return res.status(400).json({"message": "There has to be a name and a description in the request body."});
        }

    if (req.body.name === ""){
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
    return res.status(404).json({"message": "Board with id " + req.params.id + " does not exist."})
});


// Delete a board
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



//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});