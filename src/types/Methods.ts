enum Methods {
    all = 'all',
    checkout = 'checkout',
    copy = 'copy',
    delete = 'delete',
    del = 'delete',
    get = 'get',
    head = 'head',
    lock = 'lock',
    merge = 'merge',
    mkactivity = 'mkactivity',
    mkcol = 'mkcol',
    move = 'move',
    msearch = 'm-search',
    notify = 'notify',
    options = 'options',
    patch = 'patch',
    post = 'post',
    purge = 'purge',
    put = 'put',
    report = 'report',
    search = 'search',
    subscribe = 'subscribe',
    trace = 'trace',
    unlock = 'unlock',
    unsubscribe = 'unsubscribe',
}

function isValidMethod(key: string): boolean {
    return Object.keys(Methods).includes(key);
}

export { Methods, isValidMethod };
