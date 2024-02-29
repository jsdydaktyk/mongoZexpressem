
const express = require("express")
const mongoose = require("mongoose")
const {isValidDocument, errorHandler, validateIdInRequest} = require("./dataProcessingHelper")

const app = express()
app.use(express.json())
app.use("/api/ponczki/:id", validateIdInRequest )

const PORT = 8080

const myDataBase = "ponczki"
const url = `mongodb://localhost:27017/${myDataBase}`
mongoose.connect(url)
const db = mongoose.connection // obiekt do interkacji z bazą danych
db.on("error", console.error.bind(console, 'connection error'))
db.once("open", ()=>{console.log("Connected to MongoDB")})
//const collection = db.collection("handmade")

// Definicja schemat
const poncznkiSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    name: {type: String, required: true},
    price: Number
})

// tworzenie Modelu
const Ponczek = mongoose.model("Ponczek", poncznkiSchema, "handmade")


app.get("/", (req,res)=>{
    res.send("Witaj w świecie mongo z MODELEM I SCHEMATEM")
})

app.get("/api/ponczki", async (req,res)=>{
    try{

        const allPonczki = await Ponczek.find({})
        res.send(allPonczki)

    } catch(err) {
        errorHandler(res,err)
    }
})

app.get("/api/ponczki/:id", async (req,res)=>{
    try{
        const ponczekDocument = await Ponczek.findOne({id: req.correctId })
        
        if(!ponczekDocument){
            return res.status(404).json({message: "Document not found"})
        }
        res.send(ponczekDocument)

    } catch(err){
        errorHandler(res,err)
    }
})

app.delete("/api/ponczki/:id", async (req,res)=>{
    try{
        const result = await Ponczek.deleteOne({id: req.correctId})
        if(result.deletedCount === 0){
            return res.status(404).json({message:"Doc not found!"})
        }
    
        res.json({message:"I have just deleted your document"})
    } catch(err){
        errorHandler(res,err)
    }
   
})

app.put("/api/ponczki/:id", async (req,res)=>{
    try{
        
        const docToUpdate = req.body
        const newDoc = new Ponczek(docToUpdate)
        await newDoc.validate()

        const result = await Ponczek.findOneAndReplace({id: req.correctId}, newDoc, {new: true})
        if(result.matchedCount === 0){
            return res.status(404).json({message:"Dziadzie, nie znalazłem ponczka"})
        }

        res.json({message:"Zamieniłem dokumenty hihihihih!!!"})


    } catch(err){
        if(err.name=="ValidationError"){
            const validationErrors = Object.values(err.errors).map(error=>error.message)
            return res.status(400).json({message:"Validation error", errors: validationErrors})
        } else{
        errorHandler(res,err)
    }
    }
})

app.patch("/api/ponczki/:id", async (req,res)=>{
    try{
        const docToUpdate = req.body
        const newDoc = new Ponczek(docToUpdate)
        await newDoc.validate()

        const result = await collection.updateOne({id: req.correctId}, {$set:docToUpdate })
        if(result.matchedCount === 0){
            return res.status(404).json({message:"Dziadzie, nie znalazłem ponczka"})
        }

        if(result.modifiedCount === 0){
            return res.status(400).json({message:"Nie chciało mi się nic zmieniać hehehehhe"})
        }

        res.json({message:"Zaktualizowałem info o ponczku  dokumenty hihihihih!!!"})


    } catch(err){
        if(err.name=="ValidationError"){
            const validationErrors = Object.values(err.errors).map(error=>error.message)
            return res.status(400).json({message:"Validation error", errors: validationErrors})
        } else{
        errorHandler(res,err)
        }
    }
})

app.post("/api/ponczki", async (req, res)=>{
    try{
        const ponczekDocument = req.body 
        const newDocument = await Ponczek.create(ponczekDocument)// tworzy i waliduje
      
        res.status(201).json({message:"Document added successfully", nowy_ponczek: newDocument})

    } catch(err){
        if(err.name=="ValidationError"){
            const validationErrors = Object.values(err.errors).map(error=>error.message)
            return res.status(400).json({message:"Validation error", errors: validationErrors})
        } else{
            errorHandler(res,err)
        }
        
    }
})

app.listen(PORT, ()=>console.log("Server is running on 8080"))

process.on('SIGINT', ()=>{
    console.log("Zamykanie połączenia z mongo")
    db.close(()=>{
        process.exit()
    })
})

