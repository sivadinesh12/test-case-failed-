const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

app.use(express.json());

const intializeDataBase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

intializeDataBase()

const convertObjectTOArray = dbObject =>{
  return{
    movieName:dbObject.movie_name,
  }
}

//get movie

app.get('/movies/', async (request, response) => {
  const getMovieNames = `
  SELECT 
    movie_name
  FROM
    movie ;`;
  const movieNames = await db.all(getMovieNames);
  response.send(movieNames.map(eachItem => convertObjectTOArray(eachItem)));
})

// create movie
app.post('/movies/',async (request,response)=>{
  const {directorId,movieName,leadActor} = request.body
  const addNewMovie = `
  INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  VALUE
  ('${directorId}','${movieName}','${leadActor}');`;
  const NewMovie = await db.run(addNewMovie);
  response.send("Movie Successfully Added");
})

// get movie
app.get('/movies/:movieId',async (request,response) =>{
  const {movieId} = request.params
  const getMovieDetails = `
  SELECT *
  FROM movie
  WHERE 
  movie_id = ${movieId};`;
  const movie = await db.get(getMovieDetails);
  response.send(movie);
})

// update movie

app.put('/movies/:movieId',async (request,response)=>{
  const {movieId} = request.params
  const {directorId,movieName,leadActor} = request.body
  const updateMovie = `
  UPDATE movie
  SET 
  director_id = ${directorId}
  movie_name = ${movieName}
  lead_actor = ${leadActor}
  WHERE
  movie_id = ${movieId};`;
  const update = await db.run(updateMovie);
  response.send("Movie Details Updated");
})

// delete movie

app.delete('/movies/:movieId',async (request,response)=>{
  const {movieId} = request.params
  const deleteMovie =  `
  DELETE movie
  WHERE
  movie_id = ${movieId};`;
  const deleteMovieFormTable = await db.run(deleteMovie);
  response.send("Movie Removed");
})


// converts director objects in array 
const directorObject = dbObject=>{
  return{
    directorId:dbObject.director_id,
    directorName:dbObject.director_name,
  }
}

// get all directors 

app.get('/directors/',async (request,response)=>{
  const getAllDirectors = `
  SELECT *
  FROM
  director;`;
  const directors = await db.all(getAllDirectors);
  response.send(directors.map(eachItem => directorObject(eachItem))); 
})

// get movies based on director id 

app.get('/directors/:directorID/movies/',async (request,response)=>{
  const {directorId} = request.params
  const getMovies = `
  SELECT 
    movie_name
  FROM 
    movie
  WHERE
  director_id = ${directorId};`;
  const movies = await db.all(getMovies);
  response.send(movies.map(eachItem => eachItem ));
})

module.exports = app
