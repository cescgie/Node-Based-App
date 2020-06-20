# Node Based App

## Prerequisites
**Database configuration**
- Connect to database
```properties
mongo
```
- Select database
```properties
use dbname
```  
- Create user in selected database
```properties
db.createUser({
  user: "dbuser",
  pwd: "dbpwd",
  roles: ["readWrite"]
})
```  
**Create *.env* and complete the value of each variable**
```
PORT=5000
APP_HOST=http://localhost:5000
APP_SECRET=YOUR_APP_SECRET
API_AUTH_TOKEN=YOUR_API_AUTH_TOKEN
BYPASS_AUTH_FOR_LOCAL_CLIENT=0

ADMIN_EMAIL=admin@test.com 
ADMIN_PASSWORD=admin

MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=dbuser
MONGO_PASSWORD=dbpwd
MONGO_DB=dbname
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

## Starting

Run server:
```properties
npm start
```  
Or run server in development mode:
```properties
npm run dev
```  
Then open the localhost in the browser with the standard port (process.env.PORT || 8080)
```properties
http://localhost:5000
```  

## Init Admin
For user authentication feature, after starting the app, run bellow task to create admin user:
```properties
npm run db-migrate
``` 