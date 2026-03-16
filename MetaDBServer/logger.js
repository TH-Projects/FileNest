const SERVICE = 'MetaDBServer';

const log = (level, context, message, extra) => {
    const entry = {
        time: new Date().toISOString(),
        service: SERVICE,
        level,
        context,
        msg: message,
    };
    if (extra instanceof Error) {
        entry.err = { name: extra.name, message: extra.message, stack: extra.stack };
    } else if (extra !== undefined) {
        entry.detail = extra;
    }
    (level === 'error' ? console.error : console.log)(JSON.stringify(entry));
};

module.exports = {
    info:  (context, message, extra) => log('info',  context, message, extra),
    warn:  (context, message, extra) => log('warn',  context, message, extra),
    error: (context, message, extra) => log('error', context, message, extra),
};
