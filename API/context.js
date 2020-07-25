/**
 * Copyright (C) 2020 tt.bot dev team
 * 
 * This file is part of tt.bot's extension runner.
 * 
 * tt.bot's extension runner is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * tt.bot's extension runner is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with tt.bot's extension runner.  If not, see <http://www.gnu.org/licenses/>.
 */

// TODO: Use proxyReference
import Message from "tt.bot/internal/message.js";

export const extension = new class Extension {
    constructor() {
        this.store = _extensionData.getSync("data", { reference: true }).copySync();
    }
    get id() {
        return _extensionData.getSync("id");
    }
    get name() {
        return _extensionData.getSync("name");
    }
    get flags() {
        return _extensionData.getSync("flags");
    }
    async updateData(data) {
        if (!this.store) throw new Error("You haven't set up a storage");
        if ((typeof data === "string" ? data : JSON.stringify(data)).length > 25 * 1024 ** 2) { // 25 MiB
            throw new Error("The extension exceeded the storage limit of 25 MiB");
        }

        let toSet;
        try {
            if (typeof data === "string") toSet = JSON.parse(data);
            else toSet = data;
        } catch (_) {
            throw new Error("The data must be JSON");
        }

        const db = await _ctx.get("db");

        await (await db.get("updateGuildExtensionStore")).apply(db.derefInto(),
            [this.store.guildID, this.store.id, JSON.stringify(toSet)],
            {
                arguments: {
                    copy: true
                },
                result: {
                    promise: true
                }
            });

        return this.store = toSet;
    }

    async wipeData() {
        if (!this.store) throw new Error("You haven't set up a storage");
        const db = await _ctx.get("db");
        await (await db.get("updateGuildExtensionStore")).apply(db.derefInto(),
            [this.store.guildID, this.store.id],
            {
                arguments: {
                    copy: true
                },
                result: {
                    promise: true
                }
            });
        return this.store = {};
    }
};

export const bot = new class Bot {
    get guilds() {
        return _bot.getSync("guilds", { reference: true }).getSync("size", { copy: true });
    }

    get users() {
        return _bot.getSync("users", { reference: true }).getSync("size", { copy: true });
    }

    passesRoleHierarchy(member1, member2) {
        return _bot.getSync("passesRoleHierarchy", { reference: true }).applySync(_bot.derefInto(),
            [JSON.parse(JSON.stringify(member1)), JSON.parse(JSON.stringify(member2))],
            {
                arguments: {
                    copy: true
                },
                result: {
                    copy: true
                }
            });
    }

    async waitForMessage(channel, author, check, timeout) {
        /*channel = ResolveChannelID(channel);
        author = ResolveUserID(author);*/
        if (!check) check = () => true;
        // eslint-disable-next-line no-unused-vars
        const ctx = await __awaitMessageWrap({
            channel: {
                id: channel
            }, author: {
                id: author
            }
        }, ctx => { // eslint-disable-line no-unused-vars
            return check(/*new Message()*/);
        }, timeout);
        //return new Message(ctx.msg);
    }
};

export const message = new Message(_ctx.getSync("msg", {
    reference: true
}));
export const channel = message.channel;
export const guild = channel.guild;
