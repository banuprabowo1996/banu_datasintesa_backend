const express = require('express')
const app = express()
const port = 3001
const cors = require("cors")
const Controller = require('./controllers');
const multer = require('multer')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './tempZip') //storage destination
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    }
})

const upload = multer({ storage: fileStorageEngine })

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', Controller.getData)
app.post('/', upload.single("file"), Controller.postData)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})