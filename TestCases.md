# Test cases
Testing basic functionality and error cases. Ideally this would be automated
with a range of edge cases and cases from fixed bugs for regression testing.

## /latLong/usersInRadius

### Parameter validation
Missing longitude returns 401: https://city-api.glitch.me/latLong/usersInRadius?latitude=34&radius=10  
Missing latitude returns 401: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117&radius=10  
Missing radius return 401: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117&latitude=34  
Radius <0 returns 401: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117&latitude=34&radius=-10  
Skip <0 returns 401: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117&latitude=34&radius=10&skip=-1  
Limit <0 returns 401: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117&latitude=34&radius=10&limit=-1  

### Coordinates and radius
Small radius near users 1 and 854 returns them: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=10
Massive radius returns everyone: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=100000  
Radius 0 returns no one: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=0

### Pagination
No limit: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=10000  
Compare to first ten from the no limit case: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=10000&limit=10  
Get the second ten from the no limit case: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=10000&limit=10&skip=10  
Big limit returns everyone: https://city-api.glitch.me/latLong/usersInRadius?longitude=-117.72&latitude=34&radius=100000&limit=100000

## /city/usersInRadius

### Parameter validation
Missing city name returns 401: https://city-api.glitch.me/city/usersInRadius  
Skip <0 returns 401: https://city-api.glitch.me/city/usersInRadius?city=London&skip=-1  
Limit <0 returns 401: https://city-api.glitch.me/city/usersInRadius?city=London&limit=-1  

### City only
City "Kax" returns user 1: https://city-api.glitch.me/city/usersInRadius?city=Kax  
City "London" returns six users: https://city-api.glitch.me/city/usersInRadius?city=London  

### City and radius
Large radius, no users are returned twice: https://city-api.glitch.me/city/usersInRadius?city=London&radius=100000  
City with no known centre coordinates returns 204: https://city-api.glitch.me/city/usersInRadius?city=Kax&radius=100  
City and radius: https://city-api.glitch.me/city/usersInRadius?city=London&radius=50

### Pagination
No limit: https://city-api.glitch.me/city/usersInRadius?city=London&radius=100000  
Compare to first ten from the no limit case: https://city-api.glitch.me/city/usersInRadius?city=London&radius=100000&limit=10  
Get the second ten from the no limit case: https://city-api.glitch.me/city/usersInRadius?city=London&radius=100000&limit=10&skip=10  
Big limit returns everyone: https://city-api.glitch.me/city/usersInRadius?city=London&radius=100000&limit=10000  

## Misc
Wrong url returns no response: https://city-api.glitch.me/notAProperCall  

## Additional testing to consider for production
Load testing  
Loss of connectivity to the original API  
Security  
Errors in various promises  
Penetration testing (e.g. for SQL injection on this or the original api)  
Variable typing  

### Created by Sam Keen 26th January 2020
