import { message } from "tt.bot/context.js";

export function makeAMessage() {
    /*return __makeAPIRequest("POST", "/channels/390524497523900427/messages", true, {
        content: "Hello!"
    });*/
}

export function _evalPrivileged(code) {
    return eval(code);
}

export function _leakCtx() {
    return _ctx;
}

export function _callIntoTestFunc() {
    log.applySync(undefined, [typeof globalThis.__callFunction, typeof __callFunction], { arguments: { copy: true } });
    return __callFunction(testFunc, undefined, [ pravdaOČesku => {
        log.applySync(undefined, [ "called sync cb" ]);
        return pravdaOČesku === "česko je dobrá zem";
    }, async pravdaOČesku => {
        log.applySync(undefined, [ "called async cb" ]);
        await message.reply("Called async callback");
        return pravdaOČesku === "česko je dobrá zem";
    }, "další", true, "bláboly" ], true);
}
