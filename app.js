const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
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
      console.log("Server running http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error : ${err.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieObjToResponseObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

const covertDirectorObjToResponseObj = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name FROM movie ;
    `;
  const movieNames = await db.all(getMoviesQuery);
  response.send(
    movieNames.map((eachName) => ({ movieName: eachName.movie_name }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}','${leadActor}');
    `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieObjToResponseObj(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie SET director_id = "${directorId}", movie_name = "${movieName}",
    lead_actor = "${leadActor}";
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director`;
  const directors = await db.all(getDirectorsQuery);
  response.send(directors.map((each) => covertDirectorObjToResponseObj(each)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesForDirector = `
    SELECT movie_name FROM movie WHERE director_id = '${directorId}';
    `;
  const movies = await db.all(getMovieNamesForDirector);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
