require("dotenv").config();
var Spotify = require('node-spotify-api');
var keys = require("./key.js")
var fs = require("fs");
var request = require("request");
var moment = require('moment');
var command = process.argv[2];
var searchTerm = process.argv.slice(3).join("+");
var spotify = new Spotify(keys.spotify);
// var subject = process.argv;

var moviethis = function(movie) {
  var url = "https://www.omdbapi.com/?t="+movie+"&plot=short&apikey=trilogy";
  request(url, function(error, response, body) {
    var results = JSON.parse(body);
    var output = "\r\nMovie Search: "+movie+"\r\n";
    if (!error && response.statusCode === 200 && results.Error != 'Movie not found!') {
      output += "---------------\r\nTitle: "+results.Title+"\r\n"+"Year: "+results.Year+"\r\n"+"IMDB Rating: "+results.Ratings[0].Value+"\r\n"+"Rotten Tomatoes Rating: "+results.Ratings[1].Value
        +"\r\n"+"Country of Production: "+results.Country+"\r\n"+"Language: "+results.Language+"\r\n"+"Plot: "+results.Plot+"\r\n"+"Actors: "+results.Actors+"\r\n";
      // console.log(output);
      appendthis(output);
    } else {
      appendthis('ERROR: Query returned "'+results.Error+'"');
      appendthis('ERROR MSG: '+error)
    }
  })
}

var artistthis = function(artist) {
  var url = "https://rest.bandsintown.com/artists/"+artist+"/events?app_id=codingbootcamp";
  request(url, function(error, response, body) {
    var results = JSON.parse(body);
    var output = "\r\nConcert Search: "+artist+"\r\n";
    if (!error && response.statusCode === 200) {
      for (var i in results) {
        output += "---------------\r\nVenue: "+results[i].venue.name+"\r\nCity:  "+results[i].venue.city+"\r\nDate:  " 
       +moment(results[i].datetime).format('MM/DD/YYYY')+"\r\n";
      }
      appendthis(output);
    } else{
      appendthis('ERROR: Query returned "'+results.Error+'"');
      appendthis('ERROR MSG: '+error)
    }
  })
}

var spotifythis = function(song) {
  spotify.search({ type: 'track', query: song, market: "US" }, function(err, data) {
    if (err) {
      return appendthis('Error occurred: '+err);
    }
    var output = ('\r\nSong Search: '+song+'\r\n');
    for (var j in data.tracks.items)    {
      var artist = 'Artist(s): ';
      for (var i in data.tracks.items[j].artists) {
        if (i == 0) {
          artist += data.tracks.items[j].artists[i].name
        } else {
          artist += ", "+data.tracks.items[j].artists[i].name
        }
      }
      output += "---------------------\r\n"+artist+"\r\nSong:      "+data.tracks.items[j].name+ "\r\nLink:      "
       +data.tracks.items[j].href+"\r\nAlbum:     "+data.tracks.items[j].album.name+'\r\n';
    }
    appendthis(output);
  })
}

var appendthis = function(file) {
  console.log(file);
  fs.appendFile("log.txt", file, function(err){
    if (err) {
      return appendthis("ERROR RETURNED")
    }
  })
}

var selectApi = function(command, searchTerm) {
  appendthis('Processing: '+command+' '+searchTerm);
  switch(command) {
    case 'movie-this':
      if (searchTerm == "") {
        moviethis("Mr.+Nobody");
      } else {
        moviethis(searchTerm);
      }
      break;
    case 'concert-this':
      if (searchTerm == "") {
        appendthis('\r\nERROR: No search term!\r\n');
      } else {
        artistthis(searchTerm);
      }
      break;
    case 'spotify-this-song':
      if (searchTerm == "") {
        spotifythis("The+Sign");
      } else {
        spotifythis(searchTerm);
      }
      break;
    case 'do-what-it-says':
      fs.readFile("random.txt","utf8", function(error, data) {
        if (error) {
          return appendthis(error);
        }
        var inputArr = data.split("\n");
        var input = inputArr[Math.floor(Math.random()*inputArr.length)].split(',');
        selectApi(input[0],input[1].substring(1, input[1].length-1));
      })
      break;
      default:
        appendthis('unknown command');
    }
  }
    
selectApi(command, searchTerm);