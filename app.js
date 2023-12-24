const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error DB:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
  SELECT  movie_name FROM movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
INSERT INTO movie(director_id,movie_name,lead_actor) values(${directorId},"${movieName}","${leadActor}");
    `;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (request,response)=>{
    const {movieId}=request.params;
    const {directorId,movieName.leadActor}=request.body;
    const updateMovieQuery=`
    UPDATE 
    movie
     SET 
     director_id=${directorId},
     movie_name="${directorName}",
     lead_actor="${leadActor}"
     WHERE
     movie_id=${movieId};
    `;

    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/", async (request, response) => {
    const {movieId}=request.params;
  const deleteMovieQuery = `
  DELETE FROM movie WHERE movie_id=${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
  SELECT  * FROM director;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>convertDirectorDbObjectToResponseObject(eachDirector))
  );
});

app.get("/directors/:directorId/movies", async (request, response) => {
    const {directorId}=request.params;
  const getDirectorMovieQuery = `
  SELECT  movie_name FROM movie
  WHERE director_id=${directorId};
    `;
  const moviesArray = await db.all(getDirectorMovieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});


module.exports=app;