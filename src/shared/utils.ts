export const genInjectableSrc = (f: any, args?: any) => {
    let result = String(f)
    console.log(JSON.stringify(args))
    let args_str = args ? JSON.stringify(args) : ""
    result = `(${result})(${args_str})`
    console.log(result)
    return result;
}
