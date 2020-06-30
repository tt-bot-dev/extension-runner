import { proxyReference, interceptReason } from "tt.bot/internal/util.js";
import Message from "tt.bot/internal/message.js";
import User from "tt.bot/internal/user.js";

export const toChannel = ref => {
    const refProxy = proxyReference(ref);
    const type = refProxy.type.copySync();

    switch (type) {
        case 0: {
            return new TextChannel(ref);
        }
        case 5: {
            return new NewsChannel(ref);
        }
        default: {
            return new Channel(ref);
        }
    }
};

export class Channel {
    #reference;
    constructor(ref) {
        const refProxy = this.#reference = proxyReference(ref);
        this.type = refProxy.type.copySync();

        this.guild = null;
        this.name = refProxy.name.copySync();
        this.position = refProxy.position.copySync();
        this.parentID = refProxy.parentID.copySync();
        this.nsfw = refProxy.nsfw.copySync();
        this.permissionOverwrites = null;

    }

    get mention() {
        return this.#reference.mention.copySync();
    }

    permissionsOf(member) {
        return this.#reference.permissionsOf.toSyncFunc(member.id || member)
            .json.copySync();
    }

    edit(options, reason) {
        return this.#reference.edit.toFunc(options, interceptReason(reason))
            .then(r => toChannel(r))
            .catch(() => false);
    }

    editPosition(pos) {
        return this.#reference.editPosition.toFunc(pos)
            .then(() => true)
            .catch(() => false);
    }

    delete(reason) {
        return this.#reference.delete.toFunc(interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    editPermission(overwriteID, allow, deny, type, reason) {
        return this.#reference.editPermission.toFunc(overwriteID, allow, deny, type, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    removePermission(overwriteID, reason) {
        return this.#reference.removePermission.toFunc(overwriteID, reason)
            .then(() => true)
            .catch(() => false);
    }
}

export class TextChannel extends Channel {
    #reference;
    constructor(ref) {
        const refProxy = this.#reference = proxyReference(ref);
        this.messages = null;
        this.lastMessageID = refProxy.lastMessageID.copySync();
        this.ratelimitPerUser = refProxy.ratelimitPerUser.copySync();
        this.lastPinTimestamp = refProxy.lastPinTimestamp.copySync();
        this.topic = refProxy.topic.copySync();
    }

    getInvites() {
        return this.#reference.getInvites.toFunc().then(() => [])
            .catch(() => false);
    }

    createInvite(options, reason) {
        return this.#reference.createInvite.toFunc(options, interceptReason(reason))
            .then(() => null)
            .catch(() => false);
    }

    getWebhooks() {
        return this.#reference.getWebhooks.toFunc()
            .then(r => r.copy())
            .catch(() => false);
    }

    createWebhook(options, reason) {
        return this.#reference.createWebhook.toFunc(options, interceptReason(reason))
            .then(r => r.copy())
            .catch(() => false);
    }

    deleteMessages(messages, reason) {
        return this.#reference.deleteMessages.toFunc(messages.map(m => m.id || m), interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    purge() {
        return Promise.reject(new Error("Not implemented"));
    }

    sendTyping() {
        return this.#reference.sendTyping.toFunc()
            .then(() => true)
            .catch(() => false);
    }

    getMessage(message) {
        return this.#reference.getMessage.toFunc(message.id || message)
            .then(m => new Message(m.toRef))
            .catch(() => false);
    }

    getMessages(limit, before, after, around) {
        return this.#reference.getMessages.toFunc(limit, before, after, around)
            .then(m => __arrayAction(m.ToRef, "map", m => new Message(m)))
            .catch(() => false);
    }

    getPins() {
        return this.#reference.getPins.toFunc()
            .then(m => __arrayAction(m.ToRef, "map", m => new Message(m)))
            .catch(() => false);
    }

    createMessage(content, file) {
        return this.#reference.createMessage.toFunc(content, file)
            .then(m => new Message(m.toRef))
            .catch(() => false);
    }

    editMessage(message, content) {
        return this.#reference.createMessage.toFunc(message.id || message, content)
            .then(m => new Message(m.toRef))
            .catch(() => false);
    }

    pinMessage(message) {
        return this.#reference.pinMessage.toFunc(message.id || message)
            .then(() => true)
            .catch(() => false);
    }


    unpinMessage(message) {
        return this.#reference.unpinMessage.toFunc(message.id || message)
            .then(() => true)
            .catch(() => false);
    }

    getMessageReaction(message, reaction, limit, before, after) {
        return this.#reference.getMessageReaction.toFunc(message.id || message, reaction, limit, before, after)
            .then(u => __arrayAction(u.toRef, "map", u => new User(u)))
            .catch(() => false);
    }

    addMessageReaction(message, reaction) {
        return this.#reference.addMessageReaction.toFunc(message.id || message, reaction)
            .then(() => true)
            .catch(() => false);
    }

    removeMessageReaction(message, reaction, user) {
        return this.#reference.removeMessageReaction.toFunc(message.id || message, reaction, user.id || user)
            .then(() => true)
            .catch(() => false);
    }

    removeMessageReactionEmoji(message, reaction) {
        return this.#reference.removeMessageReactionEmoji.toFunc(message.id || message, reaction)
            .then(() => true)
            .catch(() => false);
    }

    removeMessageReactions(message) {
        return this.#reference.removeMessageReactions.toFunc(message.id || message)
            .then(() => true)
            .catch(() => false);
    }

    deleteMessage(message, reason) {
        return this.#reference.deleteMessage.toFunc(message.id || message, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }
}

export class NewsChannel extends Channel {
    #reference;
    constructor(ref) {
        super(ref);
        this.#reference = proxyReference(ref);
    }

    crosspostMessage(message) {
        return this.#reference.crosspostMessage.toFunc(message.id || message)
            .then(() => true)
            .catch(() => false);
    }
}