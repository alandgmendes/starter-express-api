const express = require("express");
const axios = require('axios');
const app = express();
const csv = require('csv-parser');
const fs = require('fs');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require('cors')
// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const Program = require("./db/programaModel");
const auth = require("./auth");
var MongoClient = require('mongodb').MongoClient;
const compression = require("compression");
require('dotenv').config();
const cron = require("node-cron");
const AdmZip = require('adm-zip');
const http = require('https');
const csvParser = require('csv-parser');
const fetch = require('isomorphic-fetch');
const { SlowBuffer } = require("buffer");




var uri = process.env.APP_URI_MONGODB;
const csvFilePath = './assets/emendas.csv';
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
   });
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
  console.log(query);
  console.log(uri);
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

app.get("/programas/:ano/:situacao/:uf/", async(request, response, next) => {

  let reqParams = request.params;
  var anoQuery =  parseInt(reqParams.ano);
  var data = [];
  let situacao = reqParams.situacao.toUpperCase();
  let uf = reqParams.uf.toUpperCase();
  console.log(reqParams);

  const dataInicial = request.query.dataInicial; // string no formato dd/mm/aaaa
  const dataFinal = request.query.dataFinal; // string no formato dd/mm/aaa
  console.log('data inicial: ' + dataInicial);
  console.log('data dataFinal: ' + dataFinal);
  Program.find({ UF_PROGRAMA: uf, 
                 ANO_DISPONIBILIZACAO: anoQuery,
                 SIT_PROGRAMA: situacao
                }).limit(1000).then((programs) =>{
      data = programs;
      response.json({ data: data});
      next();
    }
  ).catch((e) => {
    console.log(e)
    response.status(400).send({
      message: "Data not found, check spelling",
      error: e
    });
  });
});

app.post("/programa/update", async(request, response, next) =>{
  const optionsLocaleString = { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo'
  };
  const fileUrl = 'https://repositorio.dados.gov.br/seges/detru/siconv_programa.csv.zip';
async function fetchAndProcessCSV(url) {
  try {
    let now = new Date();
    let formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
    console.log(`${formattedDate}: - started fetching gov`);
    let buff; 
    await axios.get(fileUrl, {
      responseType: 'arraybuffer'
    })
      .then((response) => {
        console.log(response);
        buff = response.data;
        // You can now use the buffer for further processing or operations
      })
      .catch((error) => {
        console.error('An error occurred while fetching the file:', error);
      });
      console.log(buff);
      console.log('buffereder');
      console.log('>>>>>>>>>>>>>>>');
    now = new Date();
    formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
    console.log(`${formattedDate}: - finished fetching`);
    console.log(`${formattedDate}: - generating buffer`);
    const zip = new AdmZip(buff);
    const zipEntries = zip.getEntries();    
    now = new Date();
    formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
    console.log(`${formattedDate}: - finished buffer`);


    now = new Date();
    formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
    console.log(`${formattedDate}: - started parsing from buffer`);
    let csvData;
    for (const entry of zipEntries) {
      if (entry.entryName.endsWith('.csv')) {
        const entryData = await entry.getData();
        if (entryData) {
          console.log('entry data');
          const chunkSize = 1024;
          const totalChunks = Math.ceil(entryData.length / chunkSize);
    
          for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            const chunk = entryData.slice(start, end);
            csvData += chunk.toString('utf-8');
          }
          console.log(`tamanho csv: ${csvData.length}`);
          console.log(`${formattedDate}: - finished parsing, turning to string`);
          now = new Date();
          formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
          console.log(`${formattedDate}: - finished string`);
          break;
        }
      }
    }
    
    function parseCSV(csvString) {
      now = new Date();
      formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
      console.log(`${formattedDate}: - started generating arrays`);
      const rows = csvString.trim().split('\n');
      const result = [];
      
      for (const row of rows) {
        const columns = row.split(';');
        result.push(columns);
      }      
      now = new Date();
      formattedDate = now.toLocaleString('pt-BR', optionsLocaleString);
      console.log(`${formattedDate}: - finished generating arrays`);
      return result;
    }
    const data = parseCSV(csvData);
    return data;
    // Perform further processing with the CSV data...
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

fetchAndProcessCSV(fileUrl)
  .then((dataArray) => {
    if(dataArray){
      if(dataArray.length> 0){

        progs2023 = dataArray.filter(item => item[7] == '2023');
        console.log(progs2023.length);
        response.status(200).send({
          'quantidade': progs2023.length
        });
        next();
      }else{
        response.status(200).send({
          'quantidade': progs2023.length
        });
        next();
      }
    }else{
      response.status(400).send({
        'erro': 'alguma coisa'
      });
      next();
    }
    // Perform further operations on the bidimensional array
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  }); 
  
});

app.get("/programa/:ano/:situacao/:uf", async (request, response, next) => {

  const reqquery = request.query;
  let reqParams = request.params;
  let dataInicial = reqquery.data_ini;
  let dataFinal = reqquery.data_fim;
  let AnoDisp = reqParams.ano;
  var data = [];
  console.log(reqParams);
  const query = {$and: [
    ,
  ]};
  const programs = await Program.find({ ModalidadePrograma: "CONVENIO", AnoDisponibilizacao: 2017 }, function(err, programs){
    if (err) {
      console.log(err);
    } else {
      console.log( 'aqui');
      console.log(programs);
      return
    }
  }).limit(10).exec();
  console.log(programs);
  console.log('prgrams acima')
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
  response.json({ message: "You are arara" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.send({ message: "Meu nome eh arara" });
});

// Define the route
app.get('/emendas', (req, res) => {
  const results = [];
  console.log(req.query);
  fs.createReadStream('./assets/emendas.csv')
    .pipe(csv())
    .on('data', (data) => {
      console.log(data.ano);
      console.log(data.cidade);
      // Filter by year, city, and function
      if (
        (!req.query.ano || data.ano == req.query.ano) &&
        (!req.query.cidade || data.cidade == req.query.cidade) 
      )
      {
          console.log(data);
          results.push(data);
        }
      
    })
    .on('end', () => {
      res.send(results);
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
});




module.exports = app;
