# city-api allows you to get users in or near cities or locations

## Getting Started
To get started with this api browse to https://city-api.glitch.me/

## /city/usersInRadius
Allows you to find users who either have a particular city or are within a specified radius in miles of its centre.

e.g. https://city-api.glitch.me/city/usersInRadius?city=London&radius=50

### Parameters:
city: The name of the city.

radius (optional): Radius in miles. If this is specified and the coordinates for the city centre are not known by the server this will return a 204 response.

limit(optional): Maximum number of entries to return.

skip (optional): Number of entries to skip (to enable pagination)


## /latLong/usersInRadius
Finds users within a distance in miles of a given latitude and longitude.

e.g. https://city-api.glitch.me/latLong/usersInRadius?longitude=-117&latitude=34&radius=10

### Parameters:
longitude: Longitude in degrees

latitude: Longitude in degrees

radius: Radius in miles

limit(optional): Maximum number of entries to return.

skip (optional): Number of entries to skip (to enable pagination)

### Created by Sam Keen 26th January 2020