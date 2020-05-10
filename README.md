# Node Based App

This is application using 
- TypeScript
- Pug for view engine
- Gulp for task runner 
- SCSS for styling
- JWT for authentication
- MongoDB for database program

## Prerequisites
Create **.env** and complete the value of each variable
```
PORT=5000
APP_HOST=http://localhost:5000
APP_SECRET=YOUR_APP_SECRET

ADMIN_EMAIL=admin@test.com  
ADMIN_PASSWORD=admin

MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=dbuser
MONGO_PASSWORD=dbpwd
MONGO_DB=dbname

API_AUTH_TOKEN=YOUR_API_AUTH_TOKEN
```

## Install

Install the node packages via:
```properties
npm install
```  
And then run the staging task to compile the TypeScript:
```properties
npm run stg
```  
For user authentication feature, run bellow task to create admin user:
```properties
npm run db-migrate
``` 
## Starting

Run server:
```properties
npm start
```  
Or run server in development mode:
```properties
npm run dev
```  
Then open the localhost in the browser with the standard port 8080
```properties
http://localhost:8080
```  

## Todo
- [x] Task Runner with Gulp
- [x] Styling with SCSS
- [x] MongoDB connection with implementation of User Authentication using JWT
- [ ] RESTful API
- [ ] Upload Image

## Sources
- [Express Session](http://expressjs.com/en/resources/middleware/session.html#compatible-session-stores)