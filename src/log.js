/**
 * Universal Logger
 */
import _ from './i18n'

export class Log{
    error(errorName){
        var e = new Error();
        e.message = _(errorName) || errorName;
        this.log(`错误[${errorName}]:${e.message}`, 'red');
        this.log(`Error Trace:`, 'red');
        console.log(e);
        return e;
    }
    log(message, color = 'black'){
        console.log(`%c[Wikiplus]${message}`, `color:${color}`);
    }
}