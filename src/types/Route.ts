import { Methods } from './Methods';

interface Route {
    method: Methods;
    execute: Function;
    middleware: Function[];
}

export default Route;
