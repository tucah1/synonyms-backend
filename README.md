# Reeinvent Synonyms Project
### Project requirements
Implement a system that works as a synonyms search tool with the following requirements:
- The user should be able to add new words with synonyms.
- The user should be able to ask for synonyms for a word and lookup should work in both directions. For example, If "wash" is a synonym to "clean", then I should be able to look up both words and get the respective synonym.
- A word may have multiple synonyms and all should be returned at a user request.
- Make the solution with simple, but fast, data structures in backend's memory - no persistence needed.
- Implement the solution in the best possible way, as if it were production code.

Bonus: Deployed so we can test the solution online.
Bonus: Transitive rule implementation, i.e. if "B" is a synonym to "A" and "C" a synonym to "B", then "C" should automatically, by transitive rule, also be the synonym for "A".


## Project Backend Documentation
### Backend API routes
Backend for this project consists out of 2 API endpoints.
- POST: https://synonyms-backend.herokuapp.com/api/v1/synonyms - which is used to add new synonyms into the system. POST request body is expected to contain two properties: `word` and `synonyms`. `word` is expected to be a string, while `synonyms` is expected to be an array of string, with each string in the array representing a synonym for the `word`. Example POST request body:

```
{
 "word": "word1",
 "synonyms": ["word2", "word3"]
}
```

- GET https://synonyms-backend.herokuapp.com/api/v1/synonyms?keyword=< word > - which is used to get all synonyms of the word.

### Backend Design
One of the requiremets of the project states that solution should be build with data structures in backend's memory (with no persistence). Hence, backend is designed to store added synonyms into two hash tables (objects in JS). Two hash tables as a storage of synonyms provide lookup of synonyms in constant time, small memory footprint as well as acceptable insert performance.

Two hash tables are created as properties of `app.locals` object in express router to be available in all routes in our express server. 
First hash table, `app.locals.synonymsStorage`, holds groups of synonyms, where each group holds a group of words that are synonyms of each other. `synonymsStorage` hash table has incrementing integers as keys, and lists representing groups of synonyms as values. 
Second hash table, `app.locals.synonymsLookup`, acts as a dictionary. It has all distinct words that are added into the system as keys, and as values it has keys from `systemsStorage` that reference the synonyms group to which the word in the dictionary belongs to. 
Synonyms dictionary and synonyms storage are separated to reduce the memory usage, by not repeating the list of the synonyms multiple times in the dictionary.

All project requirements are implemented, including the bonus requirements. Solution is deployed online with backend and frontend accessible on following URLs:
- backend: https://synonyms-backend.herokuapp.com
- frontend: https://synonyms-frontend.herokuapp.com

### Backend Performance
Backend is designed to have a very fast synonyms lookup, small memory footprint and acceptible synonyms insert performance.

Synonyms lookup is performed in constant time O(1), thanks to the hash tables.

Synonyms insert in the worst case scenario is performed in O(n * m) time complexity, where `n` represents number of synonyms that are being added and `m` number of synonyms that need to be concatinated to the list of synonyms that are being added. On average, synonyms insert is performed in linear time O(n).

This performance for the insert operation is acceptable because we cannot realistically  expect `n` and `m` to be big numbers. Very few words have number of synonyms in two digits. And it's not realistic for a word to have number of synonyms above 100. On the other hand, number of distinct words in the system can easily exceed 100,000. Hence, having fast lookup is important.


