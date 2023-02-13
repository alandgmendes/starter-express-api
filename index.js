const express = require('express')
const app = express()
app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})

app.all('/arara', (req, res) => {
    console.log("Just got a request!")
    res.send('arara!!')
})


app.listen(process.env.PORT || 8000)
console.log('listening on port 8000 se pá');