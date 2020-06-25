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
        return this.#reference.dynamicAvatarURL.toSyncFunc(format, size)
    }

    async createMessage(content, file) {
        const dmChannel = await this.#reference.getDMChannel.toFunc();
        return dmChannel.createMessage.toFunc(content, file).then(m => new Message(m.toRef)).catch(() => false);
    }
}