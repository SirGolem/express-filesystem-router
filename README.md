# express-filesystem-router

express-filesystem-router is a simple way to use the filesystem for ExpressJS route handling.

## Features

* TypeScript
* Supports all Express route methods (with hyphens removed)
* Supports middleware
* Supports dynamic endpoints (Express parameters)
* Ignore `.d.ts` and `_`-prefixed files (optional)

### Creation

`FSRouter(directoryPath: string, options?: RouterOptions)`

* `directoryPath`: The path to the folder containing the route files.

* `options` (optional): The options for the router:
  * `ignoreFilesPrefixedWithUnderscore: boolean` (default `true`): Whether to ignore files with names that start with `_` (e.g. _route.ts)

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
import { FSRouter } from 'express-filesystem-router';

const app = express();
const port = 3000;

app.use('/', FSRouter(__dirname + '/routes'));

app.listen(port, () => console.log(`App listening on port ${port}`));
```

`routes/index.ts`

```ts
import { Request, Response, NextFunction } from 'express';

const middleware: Function[] = [
    (req: Request, res: Response, next: NextFunction) => {
        console.log('Middleware!');
        next();
    },
];

function get(req: Request, res: Response) {
    res.status(200).send('Hello world!');
    return;
}

export { middleware, get };
```
