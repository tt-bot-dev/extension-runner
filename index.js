"use strict";
const ivm = require("isolated-vm");
const Constants = require("./Constants");
const fetch = require("node-fetch");
const { promises: { readFile } } = require("fs");
const { join: resolvePath } = require("path");
const isolate = new ivm.Isolate();

//eslint-disable-next-line no-unused-vars
module.exports = async function (ctx, bot, code, ext, commandData) {
    // ext = { id, name, data, flags };
    const context = await isolate.createContext();
    const privilegedContext = await isolate.createContext();
    await context.global.set("global", context.global.derefInto());
    await privilegedContext.global.set("global", privilegedContext.global.derefInto());
    await privilegedContext.global.set("_ctx", ctx, {
        reference: true,
    });
    await privilegedContext.global.set("_bot", bot, {
        reference: true
    });
    await privilegedContext.global.set("_extensionData", ext, {
        reference: true
    });
    await privilegedContext.evalClosure(`global.__awaitMessageWrap = function(ctx, check, timeout) {
        return $1.apply($0, [ ctx, check, timeout ], {
            result: {
                promise: true
            },
            arguments: {
                copy: true,
                reference: true
            }
        })
    }`, [ bot.messageAwaiter, (ctx, check, timeout) => 
        bot.messageAwaiter.waitForMessage(ctx, ctx => check.applySync(undefined, [ ctx ], { reference: true }),
        timeout) ], { arguments: { reference: true }})

    await context.global.set("log", console.log.bind(console), {
        reference: true
    });
    if (ext.flags & Constants.ExtensionFlags.httpRequests) {
        await context.evalClosure(`global.fetch = function(...args) {
            return $0.apply(undefined, args, {
                result: {
                    promise: true
                },
                arguments: {
                    copy: true
                }
            });
        }`, [ fetch ], { arguments: { reference: true } });
    };
    
    await context.global.delete("global");
    await privilegedContext.global.delete("global");
    const mod = await isolate.compileModule(code, {
        filename: `tt.bot/${ext.id}.esm.js`
    });
    await mod.instantiate(context, async function resolve(name) {
        if (name.startsWith("tt.bot/")) {
            let path = name.replace(/^tt\.bot\//, "");
            path = resolvePath(__dirname, "API", path);
            if (!path.endsWith(".js")) path += ".js";
            if (path.startsWith(__dirname)) {
                const file = await readFile(`${__dirname}/${path}`, { encoding: "utf-8" });
                const pm = await isolate.compileModule(file, {
                    filename: `tt.bot/${path}`
                });
                await pm.instantiate(privilegedContext, resolve);
                return pm;
            }
        }
        throw new Error("Module not found. Are you sure you have the correct permissions?");
    });

    let e;
    try {
        await mod.evaluate({
            timeout: 10000,
            release: true
        });
    } catch (err) {
        e = err;
    } 
    context.release();
    return e;
};