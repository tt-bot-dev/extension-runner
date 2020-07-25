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
import { proxyReference, interceptReason } from "tt.bot/internal/util.js";
import Message from "tt.bot/internal/message.js";
import Guild from "tt.bot/internal/guild.js";

export class User {
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
        return this.#reference.dynamicAvatarURL.toSyncFunc(format, size);
    }

    async createMessage(content, file) {
        const dmChannel = await this.#reference.getDMChannel.toFunc();
        return dmChannel.createMessage.toFunc(content, file).then(m => new Message(m.toRef)).catch(() => false);
    }
}

export class Member extends User {
    #reference;
    constructor(ref) {
        super(ref.getSync("user", { reference: true }));
        const refProxy = this.#reference = proxyReference(ref);
        this.guild = new Guild(refProxy.guild.toRef);
        this.joinedAt = refProxy.joinedAt.copySync();
        this.permission = refProxy.permission.toJSON.toSyncFunc(["json"]).copySync();
        this.premiumSince = refProxy.premiumSince.copySync();
        this.roles = refProxy.roles.copySync();
        this.user = new User(refProxy.user.toRef);
        this.voiceState = refProxy.voiceState.toJSON.toSyncFunc().copySync();
    }

    addRole(role, reason) {
        return this.#reference.addRole.toFunc(role.id || role, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    ban(deleteMessageDays, reason) {
        return this.#reference.ban.toFunc(deleteMessageDays, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    edit(options, reason) {
        return this.#reference.edit.toFunc({
            ...options,
            roles: options.roles && options.roles.map(role => role.id || role),
            channelID: options.channelID && (options.channelID.id || options.channelID)
        }, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    kick(reason) {
        return this.#reference.kick.toFunc(interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }


    removeRole(role, reason) {
        return this.#reference.removeRole.toFunc(role.id || role, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }
    
    unban(reason) {
        return this.#reference.unban.toFunc(interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }
}
