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
            if (!dirEntry.name.endsWith(".js")) continue;
            const modulePath = join("tt.bot", relative(API_DIR, path)).replace(/\\/g, "/");
            modules[`${modulePath}/${dirEntry.name}`] = await readFile(`${path}/${dirEntry.name}`, { encoding: "utf-8" });
        }
    }
}
const _loadFiles = loadDir();

let loadedFiles = false;
//eslint-disable-next-line no-unused-vars
module.exports = async function (ctx, bot, code, ext, commandData) {
    // ext = { id, name, data, flags };
    if (!loadedFiles) {
        await _loadFiles;
        loadedFiles = true;
    }

    let isolate;

    if (!Object.prototype.hasOwnProperty.call(isolatesByExtensions, ext.id)) {
        isolate = isolatesByExtensions[ext.id] = new ivm.Isolate();
    } else {
        isolate = isolatesByExtensions[ext.id];
        if (isolate.isDisposed) {
            isolate = new ivm.Isolate();
        }
    }
    const [mod, context, privilegedContext] = await Promise.all([isolate.compileModule(code, {
        filename: `tt.bot/${ext.id}.esm.js`
    }), isolate.createContext(), isolate.createContext()]);
    context.global.setIgnored("global", context.global.derefInto());
    privilegedContext.global.setIgnored("global", privilegedContext.global.derefInto());
    privilegedContext.global.setIgnored("_ctx", ctx, {
        reference: true,
    });
    privilegedContext.global.setIgnored("_bot", bot, {
        reference: true
    });
    privilegedContext.global.setIgnored("_extensionData", ext, {
        reference: true
    });

    privilegedContext.evalClosureIgnored(`global.__arrayAction = function (arrayRef, action, predicate, ...args) {
        return $0.applySync(undefined, [arrayRef, action, predicate, ...args], {
            arguments: {
                reference: true
            },
            result: {
                copy: true
            }
        });
    }`, [(ref, action, predicate, ...args) => {
        return Array.prototype[action.copySync()].apply(ref.copySync().deref(), [(...args) => {
            return predicate.applySync(undefined, args, {
                arguments: {
                    reference: true
                },
                result: {
                    reference: true
                }
            });
        }, ...args.map(a => a.copySync())]).map(o => o.derefInto());
    }], {
        arguments: {
            reference: true
        },
        result: {
            copy: true
        }
    });

    privilegedContext.evalClosureIgnored(`global.__awaitMessageWrap = function(ctx, check, timeout) {
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
        bot.messageAwaiter.waitForMessage(ctx, ctx => check.apply(undefined, [ctx], {
            arguments: {
                reference: true
            },
            result: {
                promise: true,
                copy: true
            }
        }),
        timeout)], { arguments: { reference: true } });

    context.global.setIgnored("log", console.log.bind(console), {
        reference: true
    });
    privilegedContext.global.setIgnored("log", console.log.bind(console), {
        reference: true
    });
    if (ext.flags & Constants.ExtensionFlags.httpRequests) {
        context.evalClosureIgnored(`global.fetch = function(...args) {
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

    context.global.deleteIgnored("global");
    privilegedContext.global.deleteIgnored("global");
    const compiledModules = {};

    await Promise.all(Object.keys(modules).map(async k => {
        const mod = await isolate.compileModule(modules[k], {
            filename: k,
            produceCachedData: true
        });
        return compiledModules[k] = mod;
    }));
    const entrypointModule = compiledModules["tt.bot/context.js"];
    await entrypointModule.instantiate(privilegedContext, async function (name) {
        if (name.startsWith("tt.bot/")) {
            if (!name.endsWith(".js")) name += ".js";
            if (Object.prototype.hasOwnProperty.call(compiledModules, name)) {
                return compiledModules[name];
            }
        }
        throw new Error("Module not found. Are you sure you have the correct permissions?");
    });

    await mod.instantiate(context, async function (name) {
        if (name.startsWith("tt.bot/")) {
            if (name.startsWith("tt.bot/internal")) {
                throw new Error("Requested an internal module from an external module");
            }
            if (!name.endsWith(".js")) name += ".js";
            if (Object.prototype.hasOwnProperty.call(compiledModules, name)) {
                return compiledModules[name];
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
    privilegedContext.release();
    return e;
};