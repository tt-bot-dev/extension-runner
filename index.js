const ivm = require("isolated-vm");
const Constants = require("./Constants");
const fetch = require("node-fetch");
const { promises: { readFile } } = require("fs");

module.exports = async function (ctx, bot, code, { id, name, data, flags }, commandData) {
    const isolate = new ivm.Isolate();
    const context = await isolate.createContext();
    await context.global.set("global", context.global.derefInto());
    if (flags & Constants.ExtensionFlags.httpRequests) {
        await context.global.set("fetch", fetch, {
            promise: true,
            copy: true
        });
        await context.evalClosure(`global.fetch = function(...args) {
            return $0.apply(undefined, args, {
                result: {
                    promise: true
                },
                arguments: {
                    copy: true
                }
            });
        }`, [ fetch ], { arguments: { reference: true }});
    }

    await context.evalClosure(`global.__makeAPIRequest = function(...args) {
        return $0.apply(undefined, args, {
            result: {
                promise: true
            },
            arguments: {
                copy: true
            }
        })
    }`, [ (...args) => bot.requestHandler.request(...args) ], { arguments: { reference: true }});
    await context.global.delete("global");
    const mod = await isolate.compileModule(code, {
        filename: `tt.bot/${id}.esm.js`
    });
    await mod.instantiate(context, async name => {
        if (name.startsWith("tt.bot/")) {
            let path = name.replace(/^tt\.bot\//, "API/");
            if (!path.endsWith(".js")) path += ".js";
            const file = await readFile(`${__dirname}/${path}`, { encoding: "utf-8" });
            return isolate.compileModule(file, {
                filename: `tt.bot/${path}`
            })
        }
        throw new Error("Module not found. Are you sure you have the correct permissions?");
    });

    try {
        await mod.evaluate({
            timeout: 10000,
            release: true
        });
    } catch (err) {
        console.error(err);
    }
    context.release();
    isolate.dispose();
}