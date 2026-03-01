export const func_as_string = (f: any, args: any) => {
    let result = String(f)
    console.log(JSON.stringify(args))
    result = `(${result})(${JSON.stringify(args)})`
    console.log(result)
    return result;
}
