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

        (await db.get("updateGuildExtensionStore")).apply(db.derefInto(),
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
        (await db.get("updateGuildExtensionStore")).apply(db.derefInto(),
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
        return _bot.getSync("guilds").getSync("size").copySync();
    }

    get users() {
        return _bot.getSync("users").getSync("size").copySync();
    }

    passesRoleHierarchy(member1, member2) {
        return _bot.getSync("passesRoleHierarchy").applySync(_bot.derefInto(),
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

    /*async waitForMessage(channel, author, check, timeout) {
        /*channel = ResolveChannelID(channel);
        author = ResolveUserID(author);
        if (!check) check = () => true;
        const messageAwaiter = await _bot.get("messageAwaiter");
        const _ctx = await (await messageAwaiter.get("waitForMessage")).apply(
            messageAwaiter.derefInto(),
            [{
                channel: {
                    id: channel
                }, author: {
                    id: author
                }
            }],

        )
        const ctx = await bot.messageAwaiter.waitForMessage(, ctx => {
            return check(new Message(extStruct, ctx.msg));
        }, timeout);
        return new Message(ctx.msg);
    }*/
};