import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
const app = express();
const port = 3000;


const db = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'world',
  user: 'postgres',
  password: 'fake_password'
});
db.connect()




app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  try {
    // Run your query here to fetch countries from the database
    const queryResult = await db.query('SELECT country_code FROM visited_countries');
    let country_code_array = []
    // Extract country names from the query result and populate countries_list
    queryResult.rows.forEach((country) => {
      country_code_array.push(country.country_code);
    });
    console.log(country_code_array)
    // Render your template or send response
    res.render("index.ejs", { countries: country_code_array , total: country_code_array.length});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Internal Server Error");
  }
});



//If it is nothing will happen. If it isnt, it will be added to the database.
//Map will turn blue based on country_codes in the "visited_countries" database
app.post("/add", async (req, res) => {
  try {
    
    const input = req.body["country"];

    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name = ($1)",[input] );
    

    if (result.rows.length !== 0) {
      const data= result.rows[0];
      const countryCode = data.country_code;

      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
      res.redirect("/");
    } else {
      res.status(404).send("Country not found");
    }
  } catch (error) {
    console.error("Error adding country:", error);
    res.status(500).send("Internal Server Error");
  }
});





app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
