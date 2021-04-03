const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const date = require(__dirname + "/date2.js");
const calcDay = require(__dirname + "/date.js");

let posts = [];

// const findContent = "Just give a date and a flight number."
const archiveContent = "These are past flights"
const startingContent =
  "If no flights are shown, click CREATE in the Menu bar above.";
const composeContent =
  "Provide the required flight information in the fields below.";
const editContent =
  "EDIT: Enter the correct data of the chosen flight in the fields below.";

const app = express();
// const edit = [];
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://localhost:27017/flightsdb"),
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

const flightSchema = {
  filter: String,
  date: String,
  carrier: String,
  fltNo: String,
  eta: String,
  etd: String,
  notes: String,
};
const Flight = mongoose.model("Flight", flightSchema);

app.get("/", (req, res) => {
  const day = date.getDate(); // this is where day gets its value for home.ejs
  const dd = day.slice(0,2);
  const mm = day.slice(3,5);
  const yy = day.slice(8,);
  const thisDay = dd + mm + yy
  Flight.find({date: thisDay}, (err, posts) => {
    res.render("home", {
      startingContent: startingContent,
      day: day,
      posts: posts,
    });
  });
});

app.get("/compose", (req, res) => {
  res.render("compose", { composeContent: composeContent });
});

app.post("/compose", (req, res) => {
  const post = new Flight({
    date: req.body.postDate,
    carrier: req.body.postCarrier,
    fltNo: req.body.postFlight,
    eta: req.body.postETA,
    etd: req.body.postETD,
    notes: req.body.postNotes,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

// use this to delete flight: <your URL/edit> then give only filter
app.get("/edit", (req, res) => {
  res.render("edit", { editContent: editContent });
});

// Edit flight on the basis of a filter (Flight Number) //
app.post("/edit", (req, res) => {
  const post = Flight({
    filter: req.body.postFilter,
    date: req.body.postDate,
    carrier: req.body.postCarrier,
    fltNo: req.body.postFlight,
    eta: req.body.postETA,
    etd: req.body.postETD,
    notes: req.body.postNotes,
  });

  async function update() {
    const filter = { fltNo: post.filter };
    const update = {
      fltNo: post.fltNo,
      date: post.date,
      eta: post.eta,
      etd: post.etd,
      carrier: post.carrier,
      notes: post.notes,
    };

    let doc = await Flight.findOneAndUpdate(filter, update, {
      returnOriginal: false,
    });
  }
  update();
  res.redirect("/");
});

app.get("/archive", (req, res) => {
  Flight.find({}, (err, posts) => {
    res.render("archive", {
      archiveContent: archiveContent,
      posts: posts,
    });
  });
});

app.get("/date/:dateId/fltNo/:fltNoId", (req, res) => {
  const requestedDateId = req.params.dateId;
  const requestedFltNoId = req.params.fltNoId;
  console.log(requestedDateId)
  console.log(requestedFltNoId)
  Flight.findOne({fltNo:requestedFltNoId, date: requestedDateId}, (err, post) => {
    res.render("post", {
      date: post.date,
      carrier: post.carrier,
      fltNo: post.fltNo,
      eta: post.eta,
      etd: post.etd,
      notes: post.notes,
    });
  })
});

app.listen(3000, (req, res) => {
  console.log("Server up on port 3000");
});
