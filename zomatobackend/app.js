const express=require('express')
const bodyParser=require('body-parser')
const cors=require('cors')
const dotenv=require('dotenv')
dotenv.config()
const mongo=require('mongodb')
const MongoClient=mongo.MongoClient;
const mongoUrl=process.env.mongoUrl
const port =process.env.PORT || 3300
const app=express()
authKey=process.env.authKey
let db;
// middlewares: The middleware in node. js is a function 
//that will have all the access for requesting an object, 
//responding to an object, and moving to the next middleware
// function in the application request-response cycle.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

app.get('/', (req, resp)=>{
    resp.status(200).send('Hi this is express')

})
//location
app.get('/location',(req, resp)=>{
    let key=req.header('x-basic-token')
    if (key==authKey) {
        db.collection('location').find().toArray((err, data)=>{
            resp.status(200).send(data)
        })
    }else{
        resp.status(201).send('Not authenticated data')
    }
})
//    restaurants
app.get('/restaurants', (req, res)=>{
   let query={}
   let stateId=Number(req.query.stateId);
   let mealId=Number(req.query.mealId);
   if(stateId && mealId){
    query={state_id:stateId, "mealTypes.mealtype_id":mealId};
   }
  else if(stateId){
    query={state_id:stateId};
   }
   else if(mealId){
    query={"mealTypes.mealtype_id":mealId};
   }
db.collection('restaurants').find(query).toArray((err, data)=>{
    if (err) throw err
    console.log(err);
res.send(data)        
  
})
})


// mealType
app.get('/mealType', (req,res)=>{
    db.collection('mealType').find().toArray((err,data)=>{
        res.status(200).send(data)
    })
})
//order with email
app.get('/orders',(req,res)=>{
    let query={};
    let email=req.query.email;
    if(email){
        query:{req.query.email}
    }
    db.collection('orders').find(query).toArray((err,data)=>{
        if(err) throw err;
        res.send(data)
    })
})
//place order
app.post('/placeOrder', (req,res)=>{
    let data=req.body;
    db.collection('orders').insertOne(data,(err)=>{
        if(err) throw err;
        res.send('order placed')
    })
})
//update orders
app.put('/updateOrder', (req, res)=>{
    db.collection('orders').updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                "status":req.body.status
            }
        },(err, result)=>{
            if (err) throw err;
            res.send('order status updated')
        }
      
    )
})
// Delete Order
app.delete('/removeOrder',(req,res)=>{
    let id=mongo.ObjectId(req.body._id)
    db.collection('orders').find({_id:id}).toArray((err,result)=>{
        if(result.length!==0){
            db.collection('orders').deleteOne({_id:id}, (err, data)=>{
if(err) throw err;
res.send('order deleted')
            })
        }else{
            res.send('No order found ')
        }
    })
})
//db connection
MongoClient.connect(mongoUrl,(err,client)=>{
    if(err)
    console.log('error while connecting to mongo');
    db=client.db('internfeb');
    app.listen(port, (req,resp)=>{
    console.log(`server is running on port ${port}`);
})
})


