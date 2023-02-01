const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// app.get("/trial", function (req, res) {
//   res.sendFile(__dirname + "/trial.html");
// });

app.get("/dates", function (req, res) {
  dates = fs.readdirSync("/media/a13ew1/mydrive", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  res.json(dates.sort().reverse())
});

app.get("/dates/:video", function(req,res) {
  const video = req.params.video;
  var videos = fs.readdirSync("/media/a13ew1/mydrive/"+video, { withFileTypes: true })
    .map(dirent => dirent.name)
  res.json(videos.sort(function(a, b) {
    return a.length - b.length || a.localeCompare(b)
  }))
})

app.get("/video/:directory/:name", function (req, res) {
  // Ensure there is a range given for the video
  const directory = req.params.directory;
  const name = req.params.name;
  const range = req.headers.range;
  console.log(directory,name,range);
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  const videoPath = `/media/a13ew1/mydrive/${directory}/${name}`;
  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!, http://localhost:8000");
});
