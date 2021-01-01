/**
 * Copyright (C) 2021 tt.bot dev team
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

export function proxyReference(ref, that = undefined) {
    const methods = ["deref", "derefInto", "copy", "copySync", "typeof", "toFunc", "toRef", "toSyncFunc"];
    const toFunc = (promise = true) => (...args) => {
        const out = ref.applySync(that ? that.derefInto() : ref.derefInto(), args, {
            arguments: {
                copy: true
            },
            result: {
                reference: true,
                promise
            }
        });
        if (typeof out.then === "function") return out.then(o => proxyReference(o));
        return out;
    };
    return new Proxy(ref, {
        deleteProperty(_, name) {
            return ref.deleteSync(name);
        },
        set(_, name, val) {
            return ref.setSync(name, val, {
                reference: true
            });
        },
        get(_, name) {
            if (methods.includes(name)) {
                if (name === "toFunc") return toFunc();
                if (name === "toSyncFunc") return toFunc(false);
                if (name === "toRef") return ref;
                return ref[name].bind(ref);
            } else {
                return proxyReference(ref.getSync(name, {
                    reference: true
                }), ref);
            }
        }
    });
}

export function interceptReason(reason) {
    return `${_extensionData.getSync("name", { copy: true })} (ID: ${_extensionData.getSync("id", { copy: true })}): ${reason}`;
}
