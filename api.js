// Creation: Sam Keen 26/01/2019

//
// This file exports the routes for the API and implements the functionality.
//

//Set the API address as a static, this would be better in a config file so we can easily change it and use different IPs for development and production.
const USER_API_URL = "https://bpdts-test-app.herokuapp.com";

//Axios provides us promise based HTTP requests
const axios = require("axios");
//Provides a function for computing distance on a globe
const { greatCircleDistance } = require("great-circle-distance");

//Maps URLs to our two functions
var routes = function(app) {
  //Provides a welcome page and allows Glitch to run properly
  app.get("/", function(req, res) {
    res.code = 200;
    res.send({ Message: "Please search for a city or location." });
  });

  //Finds users within a given radius of the centre of a city or specifically
  //listed as registered in that city.
  app.get("/city/usersInRadius", getUsersForCityAndRadius);

  //Returns users within a radius of given latitude and longitude coordinates.
  //This is mainly to allow searches outside the server's list of cities.
  app.get("/latLong/usersInRadius", getUsersForCoordsAndRadius);
};

//Gets all the users withing a radius of the given coordinates and sends them back in the response
function getUsersForCoordsAndRadius(req, res) {
  let longitude = req.query.longitude;
  let latitude = req.query.latitude;
  let radiusMiles = req.query.radius; //In miles
  let skip = req.query.skip;
  let limit = req.query.limit;

  //Validate all the parameters. For user facing code I would also check the type of these and that the range is reasonable.
  if (
    !longitude ||
    !latitude ||
    !radiusMiles ||
    radiusMiles <= 0 ||
    (skip && skip < 0) ||
    (limit && limit < 0)
  ) {
    sendInvalidParamsResponse(req, res);
  }

  //Get all the users in the radius
  getUsersInRadius(latitude, longitude, radiusMiles)
    .then(function(usersToReturn) {
      //If we've asked for a specific set of them filter down now. 
      //This would be more efficient if the original API supported this, but it still saves network load doing it here.
      usersToReturn = filterToPage(skip, limit, usersToReturn);
      res.status(200).send(usersToReturn);
    });
}

//Gets all the users for a given city name and optionally a radius from the city's centre and sends them back in the response
function getUsersForCityAndRadius(req, res) {
  let cityName = req.query.city;
  let skip = req.query.skip;
  let limit = req.query.limit;
  let radiusMiles = req.query.radius;

  //Validate all the parameters
  if (!cityName || (skip && skip < 0) || (limit && limit < 0)) {
    sendInvalidParamsResponse(req, res);
    return;
  }
  
  //Try and get a latitude and longitude for the city
  let latLong = getCityLatLong(cityName);

  //If we've got a radius but no centre we have to return an error
  if (radiusMiles && !latLong) {
    res.code = 204;
    res.send({ Message: "Unknown city coordinates" });
    return;
  }

  //Otherwise get the coordinates
  let lat;
  let long;
  if (latLong) {
    lat = latLong.latitude;
    long = latLong.longitude;
  }
  
  let usersToReturn = [];

  //Start with the ones in the radius
  getUsersInRadius(lat, long, radiusMiles)
    //Then find the users that have that explicitly have the city set
    .then(function(usersInRadius) {
      usersToReturn = usersInRadius;
      return getUsersInCity(cityName);
    })
    //Add them to the array if they're not already in there
    .then(function(usersInCity) {
      usersInCity.forEach(item => addIfUniqueUser(item, usersToReturn));

      console.log("Users to return: " + usersToReturn.length);

      //If we've asked for a specific number of them filter down now. 
      //This would be more efficient if the original API supported this, but it still saves network load doing it here.
      usersToReturn = filterToPage(skip, limit, usersToReturn);
      res.status(200).send(usersToReturn);
    })
    .catch(console.log);
}

//Filters down to the number of results required and sends them back in the response.
//Orders by id to ensure the users are returned in the same position e.g. getting 0-10 then 10-19 in two different calls will get you all 20 with no repeats.
function filterToPage(skip, limit, usersToReturn) {
  let ret = usersToReturn;

  //We need to sort the output to ensure the user gets all the data by going through each page, sort by id as it is unique
  ret.sort(function(a, b) {
    return a.id - b.id;
  });

  //Slice to skip what we need to skip
  if (skip) {
    ret = ret.slice(skip);
  }

  //Slice to limit the number returned
  if (limit) {
    ret = ret.slice(0, limit);
  }
  
  return ret;
}

//Adds a user to the array if it does not already contain the user for that Id
function addIfUniqueUser(user, users) {
  let existingUser = users.find(function(element) {
                                  //Assume users are the same if their id is identical
                                  return element.id === user.id;
                                });

  //If they're not in there add them
  if (!existingUser) {
    users.push(user);
  }
}

//Hits the original API to get all the users for the given city. Returns a promise resolving to the array of users.
function getUsersInCity(cityName) {
  return axios
    .get(USER_API_URL + "/city/" + cityName + "/users")
    .then(function(apiResponse) {
      return apiResponse.data;
    });
}

//Gets all the users in the specified radius of the given latitude and longitude.
//Returns a promise resolving to the array of users.
function getUsersInRadius(latitude, longitude, radiusMiles) {
  
  //If we haven't got a radius then don't do this step.
  if (!radiusMiles) {
    return Promise.resolve([]);
  }

  let usersInRadius = [];
  let radiusKm = radiusMiles * 1.60934;

  //Hit the api for all the users
  return getAllUsers()
    //Then work out if each one is in the radius
    .then(function(apiResponse) {
      let allUsers = apiResponse.data;

      for (let i = 0, l = allUsers.length; i < l; i++) {
        let user = allUsers[i];
        let coords = {
          lat1: latitude,
          lng1: longitude,
          lat2: user.latitude,
          lng2: user.longitude
        };

        let distanceKm = greatCircleDistance(coords);
        if (distanceKm <= radiusKm) {
          usersInRadius.push(user);
        }
      }

      return usersInRadius;
    })
    .catch(console.log);
}

//Sends a 400 response back
function sendInvalidParamsResponse(req, res) {
  res.status(400);
  res.send({ Message: "Invalid or missing parameters" });
}

//Gets hard coded latitude and longitudes for some UK cities
//N.B.In real code this would hit a database, file or other API to get these
function getCityLatLong(cityName) {
  
  if (cityName === "London") 
  {
    return { latitude: 51.5074, longitude: 0.1278 };
  } 
  else if (cityName === "Leeds") 
  {
    return { latitude: 53.8008, longitude: 1.5491 };
  } 
  else if (cityName === "Sheffield") 
  {
    return { latitude: 53.3811, longitude: 1.4701 };
  } 
  else 
  {
    //Default case should log diagnostics if this happens a lot
    return null;
  }
}

//Calls the original API to get all users. Returns a promise with the GET response.
function getAllUsers() {
  return axios.get(USER_API_URL + "/users");
}

module.exports = routes;
