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
import { toChannel } from "tt.bot/internal/channel.js"; 
import { User } from "tt.bot/internal/user.js";

export default class Guild {
    #reference;
    constructor(ref) {
        const refProxy = this.#reference = proxyReference(ref);
        this.unavailable = refProxy.unavailable.copySync();
        this.joinedAt = refProxy.joinedAt.copySync();
        this.voiceStates = null;
        this.channels = null;
        this.members = null;
        this.memberCount = refProxy.memberCount.copySync();
        this.roles = null;

        this.widgetEnabled = refProxy.widgetEnabled.copySync();
        this.widgetChannelID = refProxy.widgetChannelID.copySync();
        this.approximateMemberCount = refProxy.approximateMemberCount.copySync();
        this.approximatePresenceCount = refProxy.approximatePresenceCount.copySync();
    
        this.name = refProxy.name.copySync();
        this.verificationLevel = refProxy.verificationLevel.copySync();
        this.splash = refProxy.splash.copySync();
        this.banner = refProxy.banner.copySync();
        this.region = refProxy.region.copySync();
        this.ownerID = refProxy.ownerID.copySync();
        this.icon = refProxy.icon.copySync();
        this.features = refProxy.features.copySync();
        this.emojis = refProxy.emojis.copySync();
        this.afkChannelID = refProxy.afkChannelID.copySync();
        this.afkTimeout = refProxy.afkTimeout.copySync();
        this.defaultNotifications = refProxy.defaultNotifications.copySync();
        this.mfaLevel = refProxy.mfaLevel.copySync();
        this.large = refProxy.large.copySync();
        this.maxPresences = refProxy.maxPresences.copySync();
        this.explicitContentFilter = refProxy.explicitContentFilter.copySync();
        this.systemChannelID = refProxy.systemChannelID.copySync();
        this.premiumTier = refProxy.premiumTier.copySync();
        this.premiumSubscriptionCount = refProxy.premiumSubscriptionCount.copySync();
        this.vanityURL = refProxy.vanityURL.copySync();
        this.preferredLocale = refProxy.preferredLocale.copySync();
        this.description = refProxy.description.copySync();
        this.maxMembers = refProxy.maxMembers.copySync();
        this.publicUpdatesChannelID = refProxy.publicUpdatesChannelID.copySync();
        this.rulesChannelID = refProxy.rulesChannelID.copySync();
        this.maxVideoChannelUsers = refProxy.maxVideoChannelUsers.copySync();
    }

    fetchAllMembers(timeout) { // eslint-disable-line no-unused-vars
        // :thinking: Implement this or not?
    }

    fetchMembers(options) { // eslint-disable-line no-unused-vars
        // this as well?
    }

    get iconURL() {
        return this.#reference.iconURL.copySync();
    }

    dynamicIconURL(format, size) {
        return this.#reference.dynamicIconURL.toSyncFunc(format, size).copySync();
    }

    get splashURL() {
        return this.#reference.splashURL.copySync();
    }

    get bannerURL() {
        return this.#reference.bannerURL.copySync();
    }


    dynamicSplashURL(format, size) {
        return this.#reference.dynamicSplashURL.toSyncFunc(format, size).copySync();
    }

    dynamicBannerURL(format, size) {
        return this.#reference.dynamicBannerURL.toSyncFunc(format, size).copySync();
    }

    createChannel(name, type, reason, options) {
        return this.#reference.createChannel.toFunc(name, type, interceptReason(reason), options)
            .then(c => toChannel(c.toRef))
            .catch(() => false);
    }

    createEmoji(options, reason) {
        return this.#reference.createEmoji.toFunc(options, interceptReason(reason))
            .then(e => e.copy())
            .catch(() => false);
    }

    editEmoji(emoji, options, reason) {
        return this.#reference.editEmoji.toFunc(emoji.id || emoji, options, interceptReason(reason))
            .then(e => e.copy())
            .catch(() => false);
    }

    deleteEmoji(emoji, reason) {
        return this.#reference.deleteEmoji.toFunc(emoji.id || emoji, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    createRole(options, reason) {
        return this.#reference.createRole.toFunc(options, interceptReason(reason))
            .then(() => null)
            .catch(() => false);
    }

    getPruneCount(options) {
        return this.#reference.getPruneCount.toFunc(options)
            .then(e => e.copy())
            .catch(() => false);
    }

    pruneMembers(options) {
        return this.#reference.pruneMembers.toFunc({
            ...options,
            reason: interceptReason(options.reason)
        }).then(e => e.copy())
            .catch(() => false);
    }

    getWidget() {
        return this.#reference.getWidget.toFunc()
            .then(e => e.copy())
            .catch(() => false);
    }

    editWidget(options) {
        return this.#reference.editWidget.toFunc(options)
            .then(e => e.copy())
            .catch(() => false);
    }

    getVoiceRegions() {
        return this.#reference.getVoiceRegions.toFunc()
            .then(e => e.copy())
            .catch(() => false);
    }

    editRole(role, options, reason) {
        return this.#reference.editRole.toFunc(role.id || role, options, interceptReason(reason))
            .then(() => null)
            .catch(() => false);
    }

    deleteRole(role, reason) {
        return this.#reference.deleteRole.toFunc(role.id || role, reason)
            .then(() => true)
            .catch(() => false);
    }

    getAuditLogs(limit, before, actionType) {
        return this.#reference.getAuditLogs.toFunc(limit, before, actionType)
            .then(a => ({
                users: __arrayAction(a.users.toRef, "map", user => new User(user)),
                entries: __arrayAction(a.entries.toRef, "map", () => null)
            }))
            .catch(() => false);
    }

    getIntegrations() {
        return this.#reference.getIntegrations.toFunc()
            .then(() => [null])
            .catch(() => false);
    }

    editIntegration(integration, options) {
        return this.#reference.editIntegration.toFunc(integration, options)
            .then(() => true)
            .catch(() => false);
    }

    syncIntegration(integration) {
        return this.#reference.syncIntegration.toFunc(integration)
            .then(() => true)
            .catch(() => false);
    }

    deleteIntegration(integration) {
        return this.#reference.deleteIntegration.toFunc(integration)
            .then(() => true)
            .catch(() => false);
    }

    getInvites() {
        return this.#reference.getInvites.toFunc()
            .then(() => [null])
            .catch(() => false);
    }

    getVanity() {
        return this.#reference.getVanity.toFunc()
            .then(e => e.copy())
            .catch(() => false);
    }

    editMember(member, options, reason) {
        return this.#reference.editMember.toFunc(member.id || member, {
            ...options,
            roles: options.roles && options.roles.map(r => r.id || r),
            channelID: options.channelID && (options.channelID.id || options.channelID)
        }, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    addMemberRole(member, role, reason) {
        return this.#reference.addMemberRole.toFunc(member.id || member, role.id || role, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    removeMemberRole(member, role, reason) {
        return this.#reference.removeMemberRole.toFunc(member.id || member, role.id || role, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    kickMember(member, reason) {
        return this.#reference.kickMember.toFunc(member.id || member, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    banMember(member, deleteMessageDays, reason) {
        return this.#reference.banMember.toFunc(member.id || member, deleteMessageDays, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    
    unbanMember(member, reason) {
        return this.#reference.unbanMember.toFunc(member.id || member, interceptReason(reason))
            .then(() => true)
            .catch(() => false);
    }

    edit(options, reason) {
        return this.#reference.edit.toFunc({
            ...options,
            systemChannelID: options.systemChannelID && (options.systemChannelID.id || options.systemChannelID),
            rulesChannelID: options.rulesChannelID && (options.rulesChannelID.id || options.rulesChannelID),
            publicUpdatesChannelID: options.publicUpdatesChannelID && (options.publicUpdatesChannelID.id || options.publicUpdatesChannelID),
            afkChannelID: options.afkChannelID && (options.afkChannelID.id || options.afkChannelID)
        }, interceptReason(reason));
    }

    getBans() {
        return this.#reference.getBans.toFunc()
            .then(r => __arrayAction(r.toRef, "map", obj => ({
                reason: obj.getSync("reason", { copy: true }),
                user: new User(obj.getSync("user", { reference: true }))
            })))
            .catch(() => false);
    }

    getBan(user) {
        return this.#reference.getBan.toFunc(user.id || user)
            .then(async r => ({
                reason: await r.reason.copy(),
                user: new User(r.user.toRef)
            }))
            .catch(() => false);
    }

    editNickname(nick) {
        return this.#reference.editNickname.toFunc(nick)
            .then(() => true)
            .catch(() => false);
    }

    getWebhooks() {
        return this.#reference.getWebhooks.toFunc()
            .then(u => u.copy())
            .catch(() => false);
    }

    searchMembers(query, limit) { // eslint-disable-line no-unused-vars
        // Same concerns as fetch(All)Members
    }
}

