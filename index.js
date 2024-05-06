const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')

const port = process.env.PORT || 5007
const cors = require('cors');
const { title } = require('process');
const { read } = require('fs');
app.use(cors({
   origin: [
    
    // 'http://localhost:5173' 
     'https://module58-79dd7.web.app',
     'https://module58-79dd7.firebaseapp.com'

   ],
   credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// mycreate middleware

const logger = async(req,res,next)=>{
     console.log('called',req.host,req.originalUrl)
     next()
}

const verifyToken = async(req,res,next)=>{
    const token = req?.cookies?.token
    console.log('value of token in middleware',token);
    if(!token){
      return res.status(401).send({message: 'not authorized'})
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message: 'unauthorized access'})
        }
        
        req.user = decoded
        next()
    })
   
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS }@cluster0.f8w8siu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
    
    const itemsCollection = client.db('cardocter').collection('services')
    const bookingCollection = client.db('cardocter').collection('bookings')

    app.post('/jwt',logger, async(req,res)=>{
       const user = req.body
       console.log('jwt user',user);
       const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' } )

       res
       .cookie('token',token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none'
     })
       .send({success: true})
      // res.send({token})
    })

    app.post('/logout', async(req,res)=>{
         const user = req.body;
         console.log(user,"logout")
         res.clearCookie('token',{maxAge:0}).send({success: true})
    })

    app.get('/services',logger, async(req,res)=>{
        const cursor = itemsCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
   app.get('/services/:id',async(req,res)=>{
       const id = req.params.id;
       const query = {_id: new ObjectId(id)}

       const options = {
          projection : {title : 1, price: 1, services_id: 1, img: 1},
       };
       const result = await itemsCollection.findOne(query, options);
       res.send(result)
   })

   app.post('/bookings',async(req,res)=>{
        const booking = req.body;
      
        const result = await bookingCollection.insertOne(booking)

    })
// http://localhost:5007/bookings?emails=nafisahamed14@gmail.com
    app.get('/bookings', logger, verifyToken, async(req,res)=>{

       console.log('token owner info',req.user);
       if(req.query.email !== req.user.email){
         return res.status(403).send({message: 'forbidden access'})
       }

       let query = {}
       if(req.query?.email){
         query = {email: req.query.email}
       }
       const result = await bookingCollection.find().toArray()
       res.send(result)
    })
    


    app.delete('/bookings/:id',async(req,res)=>{
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
     
    })

    app.patch('/bookings/:id',async(req,res)=>{
      const updatebooking = req.body
      const id = req.params.id
      console.log(updatebooking);
      const filter = {_id:new ObjectId(id)}
      const options = {upsert: true}
      console.log(updatebooking)
      const updateDoc = {
        $set:{
          status:updatebooking.status
        }
      }
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // 
    app.post('/services',async(req,res)=>{
         const items = req.body 
         const result = await itemsCollection.insertOne(items)
         res.send(result)
    })

    app.delete('/services/:id',async(req,res)=>{
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      const result = await itemsCollection.deleteOne(query)
      res.send(result)
      console.log('id is delete');
    })

    // 
    app.put('/services/:id', async(req,res)=>{
      const id = req.params.id
      const User = req.body
      console.log(User);
      const filter = {_id:new ObjectId(id)}
      const options = {upsert: true}
// 
      const updateUser = {
         $set:{
          image: User.image,
          spot:User.spot,
          countries:User.countries,
          location:User.location,
          description:User.description,
          average_cost:User.average_cost,
          seasonality: User.seasonality,
          Travel:User.Travel,
          totaVisitorsPerYear:User.totaVisitorsPerYear

         }
      }
      const result = await itemsCollection.updateOne(filter, updateUser,options)
      res.send(result)
     
   })

      
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
    }
  }
  run().catch(console.dir);
  
  
  
  
  
  
  app.get('/', (req, res) => {
      res.send('Hello World! it s me how are you i am localhost')
    })
  
  
  
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  




    // const express = require('express');
    // const cors = require('cors');
    // const jwt = require('jsonwebtoken');
    // const cookieParser = require('cookie-parser');
    // const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    // require('dotenv').config()
    // const app = express();
    // const port = process.env.PORT || 5000;
    
    // // middleware
    // app.use(cors({
    //     origin: [
    //         // 'http://localhost:5173',
    //         'https://cars-doctor-6c129.web.app',
    //         'https://cars-doctor-6c129.firebaseapp.com'
    //     ],
    //     credentials: true
    // }));
    // app.use(express.json());
    // app.use(cookieParser());
    
    
    // console.log(process.env.DB_PASS)
    
    // const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.swu9d.mongodb.net/?retryWrites=true&w=majority`;
    
    // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    // const client = new MongoClient(uri, {
    //     serverApi: {
    //         version: ServerApiVersion.v1,
    //         strict: true,
    //         deprecationErrors: true,
    //     }
    // });
    
    // // middlewares 
    // const logger = (req, res, next) =>{
    //     console.log('log: info', req.method, req.url);
    //     next();
    // }
    
    // const verifyToken = (req, res, next) =>{
    //     const token = req?.cookies?.token;
    //     // console.log('token in the middleware', token);
    //     // no token available 
    //     if(!token){
    //         return res.status(401).send({message: 'unauthorized access'})
    //     }
    //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
    //         if(err){
    //             return res.status(401).send({message: 'unauthorized access'})
    //         }
    //         req.user = decoded;
    //         next();
    //     })
    // }
    
    // async function run() {
    //     try {
    //         // Connect the client to the server	(optional starting in v4.7)
    //         await client.connect();
    
    //         const serviceCollection = client.db('carDoctor').collection('services');
    //         const bookingCollection = client.db('carDoctor').collection('bookings');
    
    //         // auth related api
    //         app.post('/jwt', logger, async (req, res) => {
    //             const user = req.body;
    //             console.log('user for token', user);
    //             const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    
    //             res.cookie('token', token, {
    //                 httpOnly: true,
    //                 secure: true,
    //                 sameSite: 'none'
    //             })
    //                 .send({ success: true });
    //         })
    
    //         app.post('/logout', async (req, res) => {
    //             const user = req.body;
    //             console.log('logging out', user);
    //             res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    //         })
    
    //         // services related api
    //         app.get('/services', async (req, res) => {
    //             const cursor = serviceCollection.find();
    //             const result = await cursor.toArray();
    //             res.send(result);
    //         })
    
    //         app.get('/services/:id', async (req, res) => {
    //             const id = req.params.id;
    //             const query = { _id: new ObjectId(id) }
    
    //             const options = {
    //                 // Include only the `title` and `imdb` fields in the returned document
    //                 projection: { title: 1, price: 1, service_id: 1, img: 1 },
    //             };
    
    //             const result = await serviceCollection.findOne(query, options);
    //             res.send(result);
    //         })
    
    
    //         // bookings 
    //         app.get('/bookings', logger, verifyToken, async (req, res) => {
    //             console.log(req.query.email);
    //             console.log('token owner info', req.user)
    //             if(req.user.email !== req.query.email){
    //                 return res.status(403).send({message: 'forbidden access'})
    //             }
    //             let query = {};
    //             if (req.query?.email) {
    //                 query = { email: req.query.email }
    //             }
    //             const result = await bookingCollection.find(query).toArray();
    //             res.send(result);
    //         })
    
    //         app.post('/bookings', async (req, res) => {
    //             const booking = req.body;
    //             console.log(booking);
    //             const result = await bookingCollection.insertOne(booking);
    //             res.send(result);
    //         });
    
    //         app.patch('/bookings/:id', async (req, res) => {
    //             const id = req.params.id;
    //             const filter = { _id: new ObjectId(id) };
    //             const updatedBooking = req.body;
    //             console.log(updatedBooking);
    //             const updateDoc = {
    //                 $set: {
    //                     status: updatedBooking.status
    //                 },
    //             };
    //             const result = await bookingCollection.updateOne(filter, updateDoc);
    //             res.send(result);
    //         })
    
    //         app.delete('/bookings/:id', async (req, res) => {
    //             const id = req.params.id;
    //             const query = { _id: new ObjectId(id) }
    //             const result = await bookingCollection.deleteOne(query);
    //             res.send(result);
    //         })
    
    
    //         // Send a ping to confirm a successful connection
    //         await client.db("admin").command({ ping: 1 });
    //         console.log("Pinged your deployment. You successfully connected to MongoDB!");
    //     } finally {
    //         // Ensures that the client will close when you finish/error
    //         // await client.close();
    //     }
    // }
    // run().catch(console.dir);
    
    
    
    // app.get('/', (req, res) => {
    //     res.send('doctor is running')
    // })
    
    // app.listen(port, () => {
    //     console.log(`Car Doctor Server is running on port ${port}`)
    // })