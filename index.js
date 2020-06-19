"use strict";
const ivm = require("isolated-vm");
const Constants = require("./Constants");
const fetch = require("node-fetch");
const { promises: { readFile, readdir } } = require("fs");
const { relative, join } = require("path");

/**
 * @type {Record<string, import("isolated-vm").Isolate>}
 */
const isolatesByExtensions = {};

const API_DIR = `${__dirname}/API`;

/**
 * @type {Record<string, string>}
 */
const modules = {};
async function loadDir(path = API_DIR) {
    const dir = await readdir(path, { withFileTypes: true });
    for (const dirEntry of dir) {
        if (dirEntry.isDirectory()) {
            await loadDir(`${path}/${dirEntry.name}`);
        } else {
            const modulePath = join("tt.bot", relative(API_DIR, path)).replace(/\\/g, "/");
            modules[`${modulePath}/${dirEntry.name}`] = await readFile(`${path}/${dirEntry.name}`, { encoding: "utf-8" });
        }
    }
}
const _loadFiles = loadDir();



//eslint-disable-next-line no-unused-vars
module.exports = async function (ctx, bot, code, ext, commandData) {
    // ext = { id, name, data, flags };
    await _loadFiles;

    let isolate;
    function resolve(moduleName, privilegedContext) {
        return async function (name) {
            if (name.startsWith("tt.bot/")) {
                if (name.startsWith("tt.bot/internal") && !moduleName.startsWith("tt.bot/")) throw new Error("Requested an internal module from an external module");
                if (!name.endsWith(".js")) name += ".js";
                if (Object.prototype.hasOwnProperty.call(modules, name)) {
                    const moduleCode = modules[name];
                    const pm = await isolate.compileModule(moduleCode, {
                        filename: name
                    });
                    await pm.instantiate(privilegedContext, resolve(name, privilegedContext));
                    return pm;
                }
            }
            throw new Error("Module not found. Are you sure you have the correct permissions?");
        };
    }
    
    if (!Object.prototype.hasOwnProperty.call(isolatesByExtensions, ext.id)) {
        isolate = new ivm.Isolate();
    } else {
        isolate = isolatesByExtensions[ext.id];
        if (isolate.isDisposed) {
            isolate = new ivm.Isolate();
        }
    }
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
    await privilegedContext.global.set("_mainObjectKeys", (...args) => console.log(...args) || Object.keys(...args), {
        reference: true
    });
    await privilegedContext.global.set("_toJSON", obj => {
        return JSON.parse(JSON.stringify(obj.toJSON(Object.keys(obj))));
    }, {
        reference: true
    });
    await privilegedContext.evalClosure(`global.__awaitMessageWrap = function(ctx, check, timeout) {
        return $1.apply($0, [ ctx, check, timeout ], {
            result: {
                promise: true,
                copy: true
            },
            arguments: {
                copy: true,
                reference: true
            }
        })
    }`, [bot.messageAwaiter, (ctx, check, timeout) =>
        bot.messageAwaiter.waitForMessage(ctx, ctx => check.applySync(undefined, [ctx], { reference: true }),
            timeout)], { arguments: { reference: true } });
    
    await context.global.set("log", console.log.bind(console), {
        reference: true
    });
    await privilegedContext.global.set("log", console.log.bind(console), {
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
        }`, [fetch], { arguments: { reference: true } });
    }

    await context.global.delete("global");
    await privilegedContext.global.delete("global");
    const mod = await isolate.compileModule(code, {
        filename: `tt.bot/${ext.id}.esm.js`
    });
    await mod.instantiate(context, resolve(`${ext.id}.esm.js`, privilegedContext));

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
    privilegedContext.release();
    return e;
};