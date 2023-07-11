require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const synonyms = require('./routes/synonyms')

const PORT = process.env.PORT || 8080

// Setting the bodyParser to parse request body into JSON format
app.use(express.json())
// Enabling all CORS requests
app.use(
	cors({
		origin: 'https://synonyms-frontend.herokuapp.com',
	})
)
// Defining two global variables that are accessible in all express routes
// These variables will be used to store synonyms in backend's memory
app.locals.synonymsLookup = {}
app.locals.synonymsStorage = {}
// 'groupIncrement' is used to create keys in the key-value dictionary 'synonymsStorage',
// which stores lists of synonyms.
app.locals.groupIncrement = 0

// Including express routes from 'routes' directory into our express application.
app.use('/api/v1/synonyms', synonyms)

// Starting our server
app.listen(PORT, () => {
	console.log('Server started on port ' + PORT.toString())
})
 // Hello