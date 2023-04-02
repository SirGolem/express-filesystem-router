# express-filesystem

express-filesystem is a simple way to use the filesystem for ExpressJS route handling.

## Features

* TypeScript
* Supports all Express route methods (with hyphens removed)
* Supports middleware
* Supports dynamic endpoints (Express parameters)
* Ignore `.d.ts` and `_`-prefixed files (optional)

### Creation

`new FSRouter(directoryPath: string, options?: RouterOptions)`

`directoryPath`: The path to the folder containing the route files.
`options` (optional): The options 

### Method Matching

The method is inferred from the exported function name (e.g. get, post etc.).

```ts
    function get(req: Request, res: Response) { ... }
    function post(req: Request, res: Response) { ... }

    // 'delete' is a reserved keyword, so 'del' can be used instead
    function del(req: Request, res: Response) { ... }

    // 'all' can be used for handling all methods
    function all(req: Request, res: Response) { ... }
```

### Middleware

If an exported Function[] called `middleware` is present it will be used as middleware for that route.

```ts
    const middleware: Function[] = [ ... ];

    export { middleware, ... }
```

## Example

`index.ts`:

```ts
import * as express from 'express';
import FSRouter from 'express-filesystem';

const app = express();

app.use('/', new FSRouter(__dirname + '/routes'));
```
