const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require('cors')
// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const auth = require("./auth");
var MongoClient = require('mongodb').MongoClient;
const compression = require("compression");
require('dotenv').config();
const cron = require("node-cron");




var uri = process.env.APP_URI_MONGODB;

// execute database connection
dbConnect();
app.use(compression());
app.use(cors())


// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/user/:email", (request, response, next) => {
  User.findOne({ email: request.params.email }).then((user) =>{
      response.json({id: `${user.email}`});
      next();
    }
  ).catch((e) => {
    console.log(e)
    response.status(400).send({
      message: "User not found, check spelling",
      error: e
    });
  })
});

app.get("/testendpoint", (request, response, next) => {
  
  response.json({"app_url": process.env.CYCLIC_URL,
                 "mongo_url": process.env.APP_URI_MONGODB});
  next();
  
});

app.get("/convenio/:municipio/:cnpj/:orgao", async(request, response, next) => {
  
  let reqParams = request.params;
  console.log(reqParams);
  var query = {$and: [{ CodigoConvenente: parseInt(reqParams.cnpj) }, 
    {CodigoSiafiMunicipio : parseInt(reqParams.municipio)}, 
    {CondigoOrgaoConcedente: parseInt(reqParams.orgao)}]};
  var data = []  
  MongoClient.connect(uri, async function(err, client) {
    if(err){
      console.log(err);      
      next();
      client.close(); 
    }
    var collection = client.db("isaac").collection("convenios").find(query);
    
    var documentArray = await collection.toArray();
    data = documentArray;
    console.log(documentArray);
    response.json({ data: data });
    client.close();
    next();  
  });
});

app.get("/programa/:ano/:situacao/:uf/", async(request, response, next) => {
  
  let reqParams = request.params;
  var query = {$and: [{ AnoDisponibilizacao: parseInt(reqParams.ano) || 0 }, 
                      { SitPrograma: reqParams.situacao }, 
                      {UfPrograma: reqParams.uf}
                    ]};
  var data = [];
  MongoClient.connect(uri, async function(err, client) {
    if(err){
      response.json({ error: err });      
      next();
      client.close(); 
    }
    var collection = client.db("isaac").collection("programas").find(query);
    var documentArray = await collection.toArray();
    data = documentArray;
    response.json({ data: data });
    next(); 
    client.close();     
  });
});


app.get("/arara", (request, response, next) => {
  response.json({ message: "segunda mudança na string connection!" });
  next();
});


// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
        cpf: request.body.cpf,
        name: request.body.name,
        lastname: request.body.lastname
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result: result.email,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          console.log(error)
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })
  
    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password do not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.send({ message: "Meu nome eh arara" });
});

cron.schedule("* * * * *", () => console.log("Executando a tarefa a cada 1 minuto"));

module.exports = app;
