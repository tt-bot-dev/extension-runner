import { proxyReference, interceptReason } from "tt.bot/internal/util.js";

export const toChannel = ref => {
    const refProxy = this.#reference = proxyReference(ref);
    const type = refProxy.type.copySync();

    switch (type) {
        case 0:
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