import { toJSON, proxyReference, interceptReason } from "tt.bot/internal/util.js";

export function createMessage(channel, message, file) {
    return proxyReference(_bot).createMessage.toFunc(channel.id || channel, message, file).then(toJSON);
}

export class Message {
    #reference;
    constructor(ref) {
        const refProxy = this.#reference = proxyReference(ref);
        this.type = refProxy.type.copySync();
        this.timestamp = refProxy.timestamp.copySync();
        // N/A
        this.channel = null;
        this.content = refProxy.content.copySync();
        this.hit = refProxy.hit.copySync();
        this.guildID = refProxy.guildID.copySync();
        this.webhookID = refProxy.webhookID.copySync();
        this.messageReference = refProxy.messageReference.copySync();
        this.author = null;
        this.member = null;
        this.mentionEveryone = refProxy.mentionEveryone.copySync();
        this.mentions = null;
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

    delete(reason) {
        return this.#reference.delete.toFunc(interceptReason(reason)).then(() => true).catch(() => false);
    }
}