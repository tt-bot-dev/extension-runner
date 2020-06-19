import { proxyReference, interceptReason } from "tt.bot/internal/util.js";
import User from "tt.bot/internal/user.js";

export default class Message {
    #reference;
    constructor(ref) {
        const refProxy = this.#reference = proxyReference(ref);
        this.type = refProxy.type.copySync();
        this.timestamp = refProxy.timestamp.copySync();
        this.id = refProxy.id.copySync();
        // N/A
        this.channel = null;
        this.content = refProxy.content.copySync();
        this.hit = refProxy.hit.copySync();
        this.guildID = refProxy.guildID.copySync();
        this.webhookID = refProxy.webhookID.copySync();
        this.messageReference = refProxy.messageReference.copySync();
        this.author = new User(refProxy.author.toRef);
        this.member = null;
        this.mentionEveryone = refProxy.mentionEveryone.copySync();
        this.mentions = __arrayAction(refProxy.mentions.toRef, "map", user => new User(user));
        this.roleMentions = refProxy.roleMentions.copySync();
        this.pinned = refProxy.pinned.copySync();
        this.editedTimestamp = refProxy.editedTimestamp.copySync();
        this.tts = refProxy.tts.copySync();
        this.attachments = refProxy.attachments.copySync();
        this.embeds = refProxy.embeds.copySync();
        this.activity = refProxy.activity.copySync();
        this.application = refProxy.application.copySync();
    }

    get cleanContent() {
        return this.#reference.cleanContent.copySync();
    }

    get channelMentions() {
        return this.#reference.channelMentions.copySync();
    }

    edit(content) {
        return this.#reference.edit.toFunc(content).then(m => new Message(m.toRef)).catch(() => false);
    }

    crosspost() {
        return this.#reference.crosspost.toFunc().then(m => new Message(m.toRef)).catch(() => false);
    }
    
    getReaction(reaction, limit, before, after) {
        return this.#reference.getReaction.toFunc(reaction, limit, before, after).then(u => __arrayAction(u.toRef, "map", u => new User(u))).catch(() => false);
    }

    addReaction(reaction) {
        return this.#reference.addReaction.toFunc(reaction).then(() => true).catch(() => false);
    }

    removeReaction(reaction, userID) {
        return this.#reference.removeReaction.toFunc(reaction, userID).then(() => true).catch(() => false);
    }

    removeReactions() {
        return this.#reference.removeReactions.toFunc().then(() => true).catch(() => false);
    }

    removeMessageReactionEmoji(reaction) {
        return this.#reference.removeMessageReactionEmoji.toFunc(reaction).then(() => true).catch(() => false);
    }

    pin() {
        return this.#reference.pin.toFunc().then(() => true).catch(() => false);
    }

    unpin() {
        return this.#reference.pin.toFunc().then(() => true).catch(() => false);
    }

    delete(reason) {
        return this.#reference.delete.toFunc(interceptReason(reason)).then(() => true).catch(() => false);
    }

    reply(content, file) {
        return this.#reference.channel.createMessage.toFunc(content, file).then(m => new Message(m.toRef)).catch(() => false);
    }
}