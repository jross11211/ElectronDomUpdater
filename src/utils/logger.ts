const getCallerName = (): string => {
    const stack = new Error().stack?.split('\n') ?? [];
    // [0] "Error", [1] getCallerName, [2] logger.trace, [3] actual caller
    const frame = stack[3] ?? '';
    const match = frame.match(/at (?:async )?(?:Object\.)?(\w[\w.]*)[\s(]/);
    return match?.[1] ?? 'anonymous';
};

const logger = {
    trace: (flow: string, msg: string, ...args: any[]) => {
        console.log(`[${flow}] ${getCallerName()} - ${msg}`, ...args);
    },
    error: (flow: string, err?: any) => {
        if (err) console.error(`[${flow}] ${getCallerName()}`, err);
    },
};

export default logger;
