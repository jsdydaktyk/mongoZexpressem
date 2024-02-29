function isValidDocument(doc){
    return doc && typeof(doc) === 'object' &&  Object.keys(doc).length > 0;
}

function errorHandler(err, res){
    console.error(err)
    res.status(500).json({error: "Internal Server Error"})
}

function isInvalidId(id){
    return isNaN(id)
}


function validateIdInRequest(req, res, next){
    const catId = parseInt(req.params.id)
    if(isInvalidId(catId)){
         return res.status(400).json({message:"Invalid ID format"})
    }
    req.correctId = catId 
    next()
}

module.exports={isValidDocument, errorHandler, validateIdInRequest}