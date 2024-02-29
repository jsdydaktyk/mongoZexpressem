const express = require("express") ;
const mongoose = require("mongoose") ;
const {isValidDocument, errorHandler, validateIdInRequest} = require("./processDataHelper")

const app = express() ;

app.use(express.json()) ;
app.use("/api/cats/:id", validateIdInRequest )

const myDatabase = "cats" ;
const url = `mongodb://localhost:27017/${myDatabase}` ;

mongoose.connect(url) ;
const db = mongoose.connection;
const collection = db.collection("home");

db.on("error", (error)=> console.log("connection error: ", error))
db.once("open", ()=> console.log("Connected to mongoDB"))

const catSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    name: {type: String, required: true},
    age: Number 
})

const Cat = mongoose.model("Cat", catSchema, "home")

app.get("/", (req, res)=>{
    res.send("Heja w expresie gr 1") ;
})

app.get("/api/cats", async (req, res)=>{
    try{
        
        //const queryResult =  collection.find({}); // Returns a query object
        //const allCats =  await queryResult.toArray();
        const allCats = await Cat.find({})
        res.json(allCats) ;

    } catch(err) {
        errorHandler(err, res)
    }
})

app.get("/api/cats/:id", async (req, res)=>{
    try{
        // const cat = await collection.findOne(
        //     {id: req.correctId})
        // console.log(cat)
        const cat = await Cat.findOne({id: req.correctId})
        if(!cat) {
            return res.status(404).json({message: "Document not found"})
        }
        res.json(cat)

    } catch(err) {
        errorHandler(err, res)
    }
})

app.delete("/api/cats/:id", async (req, res)=>{
    try{
        // const c = await collection.deleteOne(
        //     {id: req.correctId})
        const catToDelete = await Cat.deleteOne({
            id: req.correctId
        })
        if(catToDelete.deletedCount === 0){
            return res.status(404).json({message: "Document not found"})
        }
        res.json({message: "Hurra udało się skasować kotka!!!"})

    } catch(err){
        errorHandler(err, res)
    }
})

app.post("/api/cats", async (req,res)=>{
    try{
        const newCat = req.body
        // if(!isValidDocument(newCat)){
        //     return res.status(400).json({message: "Invalid document format"})
        // }
        const cat = new Cat(newCat)
        await cat.validate()
        await cat.save()
        // const result = await collection.insertOne(newCat)
        // if(!result.acknowledged){
        //     return res.status(500).json({message:"Fail to add a doc"})
        // }
        res.status(201).json({message:"Doc added successfully"})
    } catch(err){
        errorHandler(err, res)
    }
})

app.put("/api/cats/:id", async (req,res)=>{
    try{
       
        const catToUpdate = req.body 
        // if(!isValidDocument(catToUpdate)){
        //     return res.status(400).json({message: "Invalid document format"})
        // }

        // const result = await collection.replaceOne(
        //     {id: req.correctId}, catToUpdate  )
        const cat = new Cat(catToUpdate)
        await cat.validate()
        const result = await Cat.findOneAndUpdate(
            {id: req.correctId}, cat , {new: true})
        if(!result){
            return res.status(404).json({message:"Doc not found"})
        }
        // if(result.matchedCount===0){
        //     return res.status(404).json({message:"Doc not found"})
        // }

        // if(result.modifiedCount===0){
        //     return res.status(400).json({message:"No changes to apply"})
        // }
        res.json({message:"doc replaced"})

    } catch(err){
        errorHandler(err, res)
    }

})


app.patch("/api/cats/:id", async (req,res)=>{
    try{
       
        const catToUpdate = req.body 
        if(!isValidDocument(catToUpdate)){
            return res.status(400).json({message: "Invalid document format"})
        }

        const result = await collection.updateOne(
            {id: req.correctId}, {$set: catToUpdate}  )

        if(result.matchedCount===0){
            return res.status(404).json({message:"Doc not found"})
        }

        if(result.modifiedCount===0){
            return res.status(400).json({message:"No changes to apply"})
        }
        res.json({message:"doc updated"})

    } catch(err){
        errorHandler(err, res)
    }

})




app.listen(8181, ()=>console.log("Server is running on 8181")) ;

process.on('SIGINT', ()=>{
    console.log("Zamykanie połączenia") ;
    db.disconnect( ()=>{
        process.exit();
    })
})



