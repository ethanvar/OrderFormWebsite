To run:
 - npm install
 - node database-initalizer.js
 - node server.js

Design choices:
 - Information is handled on the client side when logging in, singing in, changing privacy, and leading suggestions into search bar
 - kept the default function for sending orders given to students
 - GET: /orders will display all orders (allorders.pug)
 - homepage: homepage.pug
 - orderform.pug: order form
 - orderspage.pug: page that displays single order
 - singup.pug: forms for log in and sign up
 - userprofile.pug: display users name and their orders
 - userSearch.pug: page with search bar for users 
