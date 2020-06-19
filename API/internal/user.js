import { proxyReference } from "tt.bot/internal/util.js";
import Message from "tt.bot/internal/message.js";

export default class User {
    #reference;
    constructor(ref) {
        const refProxy = this.#reference = proxyReference(ref);

        this.username = refProxy.username.copySync();
        this.discriminator = refProxy.discriminator.copySync();
        this.avatar = refProxy.avatar.copySync();
        this.bot = refProxy.bot.copySync();
        this.system = refProxy.system.copySync();
        this.id = refProxy.id.copySync();
    }

    get mention() {
        return this.#reference.mention.copySync();
    }

    get defaultAvatar() {
        return this.#reference.defaultAvatar.copySync();
    }

    get defaultAvatarURL() {
        return this.#reference.defaultAvatarURL.copySync();
    }

    get staticAvatarURL() {
        return this.#reference.staticAvatarURL.copySync();
    }

    get avatarURL() {
        return this.#reference.avatarURL.copySync();
    }
    dynamicAvatarURL(format, size) {
        return this.#reference.dynamicAvatarURL.toRef.applySync(this.#reference.toRef.derefInto(), [ format, size ], {
            arguments: {
                copy: true,
            },
            result: {
                copy: true
            }
        });
    }

    async createMessage(content, file) {
        const dmChannel = await this.#reference.getDMChannel.toFunc();
        return dmChannel.createMessage.toFunc(content, file).then(m => new Message(m.toRef)).catch(() => false);
    }
}