//importing

import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js';
import Pusher from 'pusher'
import cors from 'cors'

//app config
const app = express();
const port = process.env.PORT || 9000



var pusher = new Pusher({
  appId: '1088975',
  key: 'd7bf13f4cebe2d150ec6',
  secret: '8f2ca44e6514770e9398',
  cluster: 'us2',
  encrypted: true
});

//middleware
//db
const connection_url = "mongodb+srv://admin:Zzd8qSi4kLqkxr6v@cluster0.f07oj.mongodb.net/whatsappdb?retryWrites=true&w=majority"
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db = mongoose.connection
db.once('open', ()=>{
    console.log("DB connected")
    const msgCollection = db.collection("messagecontents")
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change)=>{
        console.log(change)
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument
            pusher.trigger('messages', 'inserted',
            {
                name:messageDetails.name,
                message: messageDetails.message,
                timeStamp:messageDetails.timeStamp,
                received: messageDetails.received,
            })
        }else{
            console.log("error triggering pusher")
        }
    })
})

//???
//when you put the middleware to use json file, express can read a json file if you don't put that you can not received 
app.use(express.json())
app.use(cors())
//routes
app.get('/', (req, res)=>{
    res.status(200).json({"me":"mesangge"})
    console.log("hello world ")
})
app.get('/api/v1/message/async', (req,res)=>{
    Messages.find((err, data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})
app.post('/api/v1/message/new', (req,res)=>{
    const dbMessage = req.body;
    Messages.create(dbMessage, (err, data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(`new message created \ ${data}`)
        }
    })
})
//listener
app.listen(port, ()=>{
    console.log("print on console.log")
})

