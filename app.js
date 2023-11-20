const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMoviesDbObjectToResObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorsDbObjectToResObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET MOVIES API-1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT
          movie_name
        FROM
          movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// ADD A MOVIE API-2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
        INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES 
        (${directorId}, '${movieName}', '${leadActor}')
        `;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET A MOVIE API-3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT
          *  
        FROM 
          movie
        WHERE
          movie_id = ${movieId}
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMoviesDbObjectToResObject(movie));
});

// UPDATE MOVIE API-4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
        UPDATE 
          movie
        SET
          director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}',
        WHERE 
          movie_id = ${moviesId}
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE MOVIE API-5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM
          movie
        WHERE 
          movie_id = ${moviesId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET DIRECTORS API-6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT
          *
        FROM
          director;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorsDbObjectToResObject(eachDirector)
    )
  );
});

//ALL MOVIES OF A SPECIFIC DIRECTOR API-7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
        SELECT 
          movie_name
        FROM
          movie
        WHERE
          director_id = ${directorId}
    `;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
