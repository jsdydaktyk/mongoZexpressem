
function isValidDocument(doc){
    return doc && typeof(doc) === 'object' && Object.keys(doc).length>0
}

function errorHandler(res,err){
    console.error(err)
    res.status(500).json({error: err.message})
}

function isIdInvalid(id){
    return isNaN(id)
}

function validateIdInRequest(req,res,next){
    const idPonczka = parseInt(req.params.id)
    if(isIdInvalid(idPonczka)){
        return res.status(400).json({message:"Invalid Id format"})
    }
    req.correctId = idPonczka

    next()

}

module.exports = {isValidDocument, errorHandler, validateIdInRequest}