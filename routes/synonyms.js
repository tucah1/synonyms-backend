const router = require('express').Router()
const { body, validationResult } = require('express-validator')

// @route       POST /api/v1/synonyms
// @desc        Route used to add synonyms to the system.
// @access      Public
router.post(
	'/',
	[
		body('word').trim().not().isEmpty(),
		body('synonyms').isArray().not().isEmpty(),
		body('synonyms.*').trim().not().isEmpty(),
	],
	(req, res) => {
		try {
			// Checking for any validation errors. If there are any
			// returning the error messages.
			let errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json(errors)
			}

			const word = req.body.word
			// Getting rid of possible duplicates in the list of synonyms
			const synonyms = [...new Set(req.body.synonyms)]

			// Assingning references to synonymsLookup and synonymsStorage to local variables
			// This is done purely for code readability
			let sLookup = req.app.locals.synonymsLookup
			let sStorage = req.app.locals.synonymsStorage

			// Checking if word exists in the dictionary
			if (sLookup[word] !== undefined) {
				// If 'word' already exists in our dictionary, we will add all synonyms
				// from 'synonyms' list to the 'word's synonyms
				synonyms.forEach((synonym) => {
					// If 'synonym' is already in a group of synonyms with the 'word'
					// we will skip the 'synonym'. Otherwise, we will add it.
					if (!sStorage[sLookup[word]].includes(synonym)) {
						// If 'synonym' is already in the dictionary, but not as synonym of the 'word'
						// we will need to concatinate synonym groups of 'word' and 'synonym'
						if (sLookup[synonym] !== undefined) {
							// Concatinating groups (lists) of synonyms of our 'word' and 'synonym'
							sStorage[sLookup[word]] = sStorage[
								sLookup[word]
							].concat(sStorage[sLookup[synonym]])

							// Changing references of 'words' from the concatinated list in the
							// dictionary. All words in the dictionary that are in the new list of synonyms,
							// have to reference the new list.
							sStorage[sLookup[synonym]].forEach((syn) => {
								if (syn != synonym) {
									sLookup[syn] = sLookup[word]
								}
							})

							// Setting old list of synonyms to undefined, becuase it will not be used further.
							sStorage[sLookup[synonym]] = undefined
							// Finally setting the reference of the current synonym in the dictionary to the
							// new list.
							sLookup[synonym] = sLookup[word]
						} else {
							// If 'synonym' does not exist in the dictionary we will just add it to the list
							// of synonyms, and insert it's reference into the dictionary.
							sStorage[sLookup[word]].push(synonym)
							sLookup[synonym] = sLookup[word]
						}
					}
				})
			} else {
				// 'checkSynonymsReferences' is a boolean variable used to check whether synonyms references
				// need to be checked after synonyms are inserted into the dictionary.
				// Synonyms references need to be checked and fixed when synonyms lists are concatinated after
				// some number of synonyms has already been inserted into the dictionary.
				let checkSynonymsReferences = true
				// Setting a reference for a new synonyms list that will be created in the storage.
				sLookup[word] = req.app.locals.groupIncrement
				// Creating new synonyms list in the storage.
				sStorage[sLookup[word]] = [word]
				// Incrementing number of synonym groups (lists) beacause we just created a new synonyms list.
				req.app.locals.groupIncrement += 1

				// Iterating list of submitted synonyms and adding them to the synonyms list and dictionary.
				synonyms.forEach((synonym, index) => {
					// If user submitted 'word' in 'synonyms' list ignore it.
					if (synonym === word) {
						return
					}

					// Checking whether synonym already exists in the dictionary
					if (sLookup[synonym] !== undefined) {
						// Decrementing number of synonyms gorups (lists) because
						// synonyms list created for this request will be merged with an already existing one.
						req.app.locals.groupIncrement -= 1

						if (sLookup[synonym] !== sLookup[word]) {
							// Concatinate lists of synoynms of 'synonym' and 'word'
							sStorage[sLookup[synonym]] = sStorage[
								sLookup[synonym]
							].concat(sStorage[sLookup[word]])

							// If current 'synonym' is the first synonym in the list of synonyms
							// getting rid of previous storage unit (list of synonyms) and
							// setting a boolean value to not check synonyms references additionaly.
							if (index === 0) {
								checkSynonymsReferences = false
								sStorage[sLookup[word]] = undefined
							}
							sLookup[word] = sLookup[synonym]
						}
					} else {
						sStorage[sLookup[word]].push(synonym)
						sLookup[synonym] = sLookup[word]
					}
				})

				// Checking and fixing the refrences of synonyms in the dictionary if required
				if (checkSynonymsReferences) {
					synonyms.forEach((synonym) => {
						if (sLookup[synonym] !== sLookup[word]) {
							sStorage[sLookup[synonym]] = undefined
							sLookup[synonym] = sLookup[word]
						}
					})
				}
			}

			// Filtering out the keyword from the list of synonyms.
			let synonymsToReturn = sStorage[sLookup[word]].filter(
				(syn) => syn !== word
			)
			return res.status(201).json({ word, synonyms: synonymsToReturn })
		} catch (error) {
			console.error(error)
			return res.status(500).json({ message: 'Internal server error!' })
		}
	}
)

// @route       GET /api/v1/synonyms
// @desc        Route used to retrieve synonyms of a word.
// @access      Public
router.get('/', (req, res) => {
	// Get a query parameter 'keyword'
	const keyword = req.query.keyword ? req.query.keyword.trim() : ''
	// If 'keyword' does not exist, return error message
	if (!keyword) {
		return res.status(400).json({
			errors: [
				{
					msg: 'Keyword parameter not submitted.',
					param: 'keyword',
					location: 'req.query',
				},
			],
		})
	}
	try {
		// Assingning references to synonymsLookup and synonymsStorage to local variables
		// This is done purely for code readability
		let sLookup = req.app.locals.synonymsLookup
		let sStorage = req.app.locals.synonymsStorage

		// Prearing the list of synonyms to return
		// If 'keyword' does not exist in the dictionary, return empty list of synonyms.
		// If 'keyword' exists in the dict, return list of synonyms without 'keyword' in it.
		let synonymsToReturn =
			sLookup[keyword] === undefined
				? []
				: sStorage[sLookup[keyword]].filter((syn) => syn !== keyword)

		return res.json({ word: keyword, synonyms: synonymsToReturn })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Internal server error!' })
	}
})

module.exports = router
