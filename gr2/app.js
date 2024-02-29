
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

const collection = db.collection("handmade")


app.get("/", (req,res)=>{
    res.send("Witaj w świecie mongo")
})

app.get("/api/ponczki", async (req,res)=>{
    try{
       
        const allPonczkis = await collection.find({}).toArray()
        res.send(allPonczkis)

    } catch(err) {
        errorHandler(res,err)
    }
})

app.get("/api/ponczki/:id", async (req,res)=>{
    try{
        // const myId = parseInt(req.params.id)
        // if(isNaN(myId)){
        //     return res.status(400).json({message: "Invalid ID"})
        // }
        
        const ponczekDocument = await collection.findOne({id: req.correctId})
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
        // const myId=parseInt(req.params.id)
        // if(isNaN(myId)){
        //     return res.status(400).json({message: "Invalid ID"})
        // }

        const result = await collection.deleteOne({id: req.correctId})
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
        // const myId=parseInt(req.params.id)
        // if(isNaN(myId)){
        //     return res.status(400).json({message: "Invalid ID"})
        // }

        const docToUpdate = req.body
        if(!isValidDocument(docToUpdate)){
            return res.status(400).json({message:"Invalid doc format!! Dziadzie!!"})
        }
        
        const result = await collection.replaceOne({id: req.correctId}, docToUpdate)
        if(result.matchedCount === 0){
            return res.status(404).json({message:"Dziadzie, nie znalazłem ponczka"})
        }

        if(result.modifiedCount === 0){
            return res.status(400).json({message:"Nie chciało mi się nic zmieniać hehehehhe"})
        }

        res.json({message:"Zamieniłem dokumenty hihihihih!!!"})


    } catch(err){
        errorHandler(res,err)
    }
})

app.patch("/api/ponczki/:id", async (req,res)=>{
    try{
        // const myId=parseInt(req.params.id)
        // if(isNaN(myId)){
        //     return res.status(400).json({message: "Invalid ID"})
        // }

        const docToUpdate = req.body
        if(!isValidDocument(docToUpdate)){
            return res.status(400).json({message:"Invalid doc format!! Dziadzie!!"})
        }
        
        const result = await collection.updateOne({id: req.correctId}, {$set:docToUpdate })
        if(result.matchedCount === 0){
            return res.status(404).json({message:"Dziadzie, nie znalazłem ponczka"})
        }

        if(result.modifiedCount === 0){
            return res.status(400).json({message:"Nie chciało mi się nic zmieniać hehehehhe"})
        }

        res.json({message:"Zaktualizowałem info o ponczku  dokumenty hihihihih!!!"})


    } catch(err){
        errorHandler(res,err)
    }
})

app.post("/api/ponczki", async (req, res)=>{
    try{
        const newPonczekDokument = req.body 
        console.log(newPonczekDokument)
        if(!isValidDocument(newPonczekDokument)){
            return res.status(400).json({message:"Invalid Document Format"})
        }

        const result = await collection.insertOne(newPonczekDokument)

        if(!result.acknowledged){
            return res.status(500).json({message:"Failed to add the document"})
        }
        res.status(201).json({message:"Document added successfully", insertedID: result.insertedId})

    } catch(err){
        errorHandler(res,err)
    }
})

app.listen(PORT, ()=>console.log("Server is running on 8080"))

process.on('SIGINT', ()=>{
    console.log("Zamykanie połączenia z mongo")
    db.close(()=>{
        process.exit()
    })
})

