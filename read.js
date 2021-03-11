
module.exports = read

const readline = require('readline')
const Mute = require('mute-stream')

function readCallback(opts, cb) {
    if (opts.num) {
        throw new Error('read() no longer accepts a char number limit')
    }

    if (typeof opts.default !== 'undefined' &&
        typeof opts.default !== 'string' &&
        typeof opts.default !== 'number'
    ) {
        throw new Error('default value must be string or number')
    }

    let input = opts.input || process.stdin
    let output = opts.output || process.stdout
    let prompt = (opts.prompt || '').trim() + ' '
    let silent = opts.silent
    let editDef = false
    let timeout = opts.timeout
    let sigintHandler = opts.sigint || (rl => {
        rl.close()
        onError(new Error('Canceled.'))
    })

    let def = opts.default || ''
    if (def) {
        if (silent) {
            prompt += '(<default hidden>) '
        } else if (opts.edit) {
            editDef = true
        } else {
            prompt += '(' + def + ') '
        }
    }
    let terminal = !!(opts.terminal || output.isTTY)

    let m = new Mute({
        replace: opts.replace,
        prompt: prompt
    })
    m.pipe(output, {
        end: false
    })
    output = m
    let rlOpts = {
        input: input,
        output: output,
        terminal: terminal
    }

    let rl
    if (process.version.match(/^v0\.6/)) {
        rl = readline.createInterface(rlOpts.input, rlOpts.output)
    } else {
        rl = readline.createInterface(rlOpts)
    }


    output.unmute()
    rl.setPrompt(prompt)
    rl.prompt()
    if (silent) {
        output.mute()
    } else if (editDef) {
        rl.line = def
        rl.cursor = def.length
        rl._refreshLine()
    }

    let called = false
    rl.on('line', onLine)
    rl.on('error', onError)

    rl.on('SIGINT', sigintHandler.bind(null, rl))

    let timer
    if (timeout) {
        timer = setTimeout(() => {
            onError(new Error('timed out'))
        }, timeout)
    }

    function done() {
        called = true
        rl.close()

        if (process.version.match(/^v0\.6/)) {
            rl.input.removeAllListeners('data')
            rl.input.removeAllListeners('keypress')
            rl.input.pause()
        }

        clearTimeout(timer)
        output.mute()
        output.end()
    }

    function onError(er) {
        if (called) return
        done()
        return cb(er)
    }

    function onLine(line) {
        if (called) return
        if (silent && terminal) {
            output.unmute()
            output.write('\r\n')
        }
        done()
        // truncate the \n at the end.
        line = line.replace(/\r?\n$/, '')
        let isDefault = !!(editDef && line === def)
        if (def && !line) {
            isDefault = true
            line = def
        }
        cb(null, line, isDefault)
    }
}

function read(opts, cb) {
    if (cb) {
        return readCallback(opts, cb)
    } else {
        return new Promise((resolve, reject) => {
            try {
                readCallback(opts, (err, value, isDefault) => {
                    if (err instanceof Error) reject(err)
                    resolve(value, isDefault)
                })
            } catch (e) {
                reject(e)
            }
        })
    }
}
