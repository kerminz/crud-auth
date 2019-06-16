const express = require('express')
require('./db/connect')
const userRouter = require('./routers/user')

const app = express()
// important: configurations needs to be set BEFORE definig routes!
app.use(express.json())
app.use(userRouter)


const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})