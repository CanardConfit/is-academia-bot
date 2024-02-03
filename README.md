# Canarchive

## ToDo

```log
Unexpected error processing request: TypeError: graphqlError.toJSON is not a function
TypeError: graphqlError.toJSON is not a function
    at enrichError (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\errorNormalize.js:47:34)
    at C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\errorNormalize.js:19:28
    at Array.map (<anonymous>)
    at normalizeAndFormatErrors (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\errorNormal
ize.js:13:33)
    at ApolloServer.errorResponse (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\ApolloSer
ver.js:542:102)
    at ApolloServer.executeHTTPGraphQLRequest (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\c
js\ApolloServer.js:538:25)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
Unexpected error processing request: TypeError: graphqlError.toJSON is not a function
TypeError: graphqlError.toJSON is not a function
    at enrichError (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\errorNormalize.js:47:34)
    at C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\errorNormalize.js:19:28
    at Array.map (<anonymous>)
    at normalizeAndFormatErrors (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\errorNormal
ize.js:13:33)
    at ApolloServer.errorResponse (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\cjs\ApolloSer
ver.js:542:102)
    at ApolloServer.executeHTTPGraphQLRequest (C:\Users\Tom\Documents\Developpement Local\Repos\git.advtools.com\CanardPoration\Typescript\canarchive\node_modules\@apollo\server\dist\c
js\ApolloServer.js:538:25)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)

```

## Notes

> In `src/index.ts` you have an import with `@generated`, you need to make `yarn generate` for generate this package or `initPrisma`.