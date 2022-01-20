//Create express app
const express = require('express');
const session = require('express-session')
const pug = require('pug');
const fs = require("fs");
const path = require('path');
const mc = require('mongodb').MongoClient;
const MongoDBStore = require('connect-mongodb-session')(session);
const ObjectId = require('mongodb').ObjectId; 
let app = express();


//Database variables
//let mongo = require('mongodb');
const { isBuffer } = require('util');
const { DH_CHECK_P_NOT_PRIME } = require('constants');
//let MongoClient = mongo.MongoClient;
let db;

let store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/a4',
  collection: 'sessiondata'
});

app.use(session({secret: 'secret', store: store}))

//View engine
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine", "pug");

app.get('/', loadHomepage);

app.get('/SignUpLogIn', logInPage);
app.post('/SignUp', signUp, logIn);
app.post('/logIn', logIn);
app.get('/logOut', logOut);

app.post('/orders', processOrder);
app.get('/orders', loadAllOrders);
app.get('/orders/:id', singleorderpage);
app.get('/orderform', loadOrderform);

app.get('/users', loadUserSearch);
app.get('/users/:id', loadUserProfile)
app.post('/users/setprivacy', setPrivacy)
app.get('/names/:name', sendNames);

//loads homepage
function loadHomepage(req, res) {
	res.render("homepage.pug", {session: req.session});
}

//loads sign in or log in page
function logInPage(req, res) {
	res.render("signup.pug", {session: req.session});
}

//adds new user to database
function signUp(req, res, next) {
  console.log(req.body);
  db.collection('users').findOne({username: req.body.name}, function(err,result) {
    if(err) throw err;
    if(!result) {
      let u = {};
      u.username = req.body.name;
      u.password = req.body.password;
      u.privacy = false;

      db.collection("users").insertOne(u, function(err,result){
        if(err) throw err;
      })
      next();
    } else {
      res.status(404).send("User already exists."); 
      return;
    }
  });
}

//logs user into the session
function logIn(req,res) {
  console.log(req.body);
  db.collection('users').findOne({username: req.body.name}, function(err,result) {
    if(err) throw err;
    if (result.password === req.body.password){
      //db.collection('sessiondata').findOne({username: req.body.name}, function(err,result) {
      if(req.session.username != req.body.name){
        console.log("does not exist");
        req.session.loggedin = true;
        req.session.username = req.body.name;
        console.log("hello");
        res.render("homepage.pug", {session: req.session});
        //res.end();
        return;
      }
      else {
        if(req.session.username === req.body.name && req.session.loggedin === false) {
          console.log("object exists");
          req.session.loggedin = true;
          res.render("homepage.pug", {session: req.session});
          return;
        }
        else { 
          res.status(404).send("User already logged in.");
          return; 
        }
      }
      //});
    } else {
      res.status(404).send("This password does not match the user."); 
      return;
    }
  });
} 

//removes user from session
function logOut(req, res) {
  if (req.session) {
    delete req.session['username']
    delete req.session['loggedin'];
    res.render("signup.pug", {session: req.session});
  }
}


//displays single order page
function singleorderpage(req, res) {
	db.collection('orders').findOne({_id: ObjectId(req.params.id)}, function(err,result) {
    if(err) throw err;
    console.log(result.order.username);
    
    db.collection('users').findOne({username: result.order.username}, function(err,oResult) {
      if(err) throw err;
      //console.log(result.order.username);
      if ((oResult.privacy===true)&&(oResult.username!=req.session.username)) {
        res.status(404).send("This users orders are private.");
      } else {
        res.render("orderspage.pug", {order: result, session: req.session});
      }
    });
  });
}

//adds order to database
function processOrder(req, res) {
  console.log(req.body);
  order = req.body;
  order['username'] = req.session.username;
  db.collection('orders').insertOne({order}, function(err,result) {
    if(err) throw err;
    console.log(result);
  });
  res.end();
}


//displays all orders so far
function loadAllOrders(req, res) {
  db.collection("orders").find().toArray(function(err,oResult){
    if(err) throw err;
    
    console.log(oResult);
    res.render("allorders.pug", {session: req.session, orders: oResult});
    return;
  });
}


//loads order form
function loadOrderform(req, res) {
  if(req.session.username) {
    res.render("orderform.pug", {session: req.session});
  } else {
    res.status(404).send('Must sign in for Order Form');
  }
}

//loads user search space
function loadUserSearch(req, res) {
	res.render("userSearch.pug", {session: req.session});
}

//load user profile
function loadUserProfile(req, res) {
  console.log(req.params.id)
  db.collection('users').findOne({_id: ObjectId(req.params.id)}, function(err,result) {
    if(err) throw err;
    console.log(result.username);
    if(result.privacy === true && result.username===req.session.username) {
      db.collection("orders").find({'order.username' : result.username}).toArray(function(err,oResult){
        if(err) throw err;
        
        console.log(oResult);
        res.render("userprofile.pug", {session: req.session, user: result, orders: oResult});
        return;
      });
    } else {
      if(result.privacy === true && result.username!=req.session.username) { 
        res.status(404).send("Profile is set to private.");
      } else {
        db.collection("orders").find({'order.username' : result.username}).toArray(function(err,oResult){
          if(err) throw err;
          
          console.log(oResult);
          res.render("userprofile.pug", {session: req.session, user: result, orders: oResult});
          return;
        });
      }
    }
  });
}

//change user privacy setting
function setPrivacy(req, res) {
  console.log('setting privacy')
  console.log(req.body);
  console.log(req.session.username)
  db.collection('users').findOne({username: req.session.username}, function(err,result) {
    if(err) throw err;
    if(result.privacy === false) {
      db.collection('users').updateOne({username: req.session.username}, {$set: {privacy: true}}, function(err,result){
        if(err) throw err;
        res.end()
      });
    } else {
      db.collection('users').updateOne({username: req.session.username}, {$set: {privacy: false}}, function(err,result){
        if(err) throw err;
        res.end()
      });
    }
  });
} 

//send names required by search bar
function sendNames(req, res) {
  console.log(req.params.name);
  let name = req.params.name; 
  db.collection("users").find({"username" : {$regex : name}}).toArray(function(err,result){
		if(err) throw err;
		
		console.log(result);
    for(let i = 0; i < result.length; i++) {
      if (result[i].privacy===true && req.session.username!=result[0].username) {
        result.splice(i, 1);
      }
    }
    res.statusCode = 200;
	  res.end(JSON.stringify(result));
	});
}

mc.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;
  console.log("WHAT UP")
  //Get the t8 database
  db = client.db('a4');
  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("http://localhost:3000/");
});
