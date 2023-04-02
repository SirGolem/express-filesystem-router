import { Router } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { isValidMethod, Methods } from './types/Methods';
import Route from './types/Route';
import { defaultRouterOptions, RouterOptions } from './types/RouterOptions';

/**
 * Create a filesystem router.
 * @constructor
 * @name FSRouter
 * @param {string} directoryPath The directory to register routes from.
 * @param {RouterOptions} options Optional router settings.
 * @returns {Router} An Express router with routes and middleware registered.
 */
const FSRouter = function (directoryPath: string, options: RouterOptions = defaultRouterOptions): Router {
    if (!directoryPath) throw new Error(`Cannot create filesystem router from directory '${directoryPath}'`);

    const router: Router = Router();
    const dirPath = path.resolve(directoryPath);

    if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory '${directoryPath}' does not exist`);
    }

    scanDirectory(dirPath, dirPath, options).then((routes) => {
        for (const [endpoint, route] of routes) {
            if (route.middleware && route.middleware.length > 0) {
                for (const middleware of route.middleware) {
                    router.use(endpoint, (...args) => middleware(...args));
                }
            }
        }

        for (const [endpoint, route] of routes) {
            router[route.method](endpoint, (...args) => route.execute(...args));
        }
    });

    return router;
} as any as { new (directoryPath: string): Router };

async function scanDirectory(
    baseDirPath: string,
    dirPath: string,
    options: RouterOptions,
): Promise<Map<string, Route>> {
    let routes = new Map<string, Route>();
    const dirFiles = fs.readdirSync(dirPath);

    for (const file of dirFiles) {
        const filePath = path.join(dirPath, file);
        const fileInfo = fs.lstatSync(filePath);

        if (
            fileInfo.isFile() &&
            (file.endsWith('.js') || file.endsWith('.ts')) &&
            !file.endsWith('.d.ts') &&
            !(file.startsWith('_') && options.ignoreFilesPrefixedWithUnderscore)
        ) {
            const routeData = await import(filePath);
            const processData = routeData.default ? routeData.default : routeData;
            const endpoint = filePath
                .replaceAll(baseDirPath, '')
                .replaceAll('index.js', '')
                .replaceAll('index.ts', '')
                .replaceAll('\\', '/')
                .replaceAll('.js', '')
                .replaceAll('.ts', '');

            let route: Route;

            if (processData instanceof Function) {
                if (!isValidMethod(processData.name))
                    throw new Error(
                        `'${processData.name}' is not a valid method but was given as a route handler function name.`,
                    );

                route = {
                    method: Methods[<keyof typeof Methods>processData.name],
                    execute: processData,
                    middleware: [],
                };
            } else {
                let method: Methods | undefined;
                let execute: Function | undefined;
                let middleware: Function[] = [];

                for (const [key, value] of Object.entries(processData)) {
                    if (typeof value === 'function') {
                        if (!isValidMethod(value.name))
                            throw new Error(
                                `'${value.name}' is not a valid method but was given as a route handler function name.`,
                            );

                        method = Methods[<keyof typeof Methods>value.name];
                        execute = value;
                    } else if (
                        key === 'middleware' &&
                        Array.isArray(value) &&
                        value.every((item) => typeof item === 'function')
                    ) {
                        middleware = value;
                    }
                }

                if (!method || !execute)
                    throw new Error(
                        `Invalid exports from ${filePath}: a function with a valid method as its name must be exported from all JS/TS files in the given directory.`,
                    );

                route = {
                    method,
                    execute,
                    middleware,
                };
            }

            routes.set(endpoint, route);
        } else if (fileInfo.isDirectory()) {
            const subDirRoutes = await scanDirectory(baseDirPath, filePath, options);
            routes = new Map<string, Route>([...routes, ...subDirRoutes]);
        }
    }

    return routes;
}

export default FSRouter;
