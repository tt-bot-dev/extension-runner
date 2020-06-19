export function proxyReference(ref, that = undefined) {
    const methods = ["deref", "derefInto", "copy", "copySync", "typeof", "toFunc", "toRef"];
    const toFunc = () => (...args) => {
        const out = ref.applySync(that ? that.derefInto() : ref.derefInto(), args, {
            arguments: {
                copy: true
            },
            result: {
                reference: true,
                promise: true
            }
        });

        return out.then(o => proxyReference(o));
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

const extensionData = proxyReference(_extensionData);
export function interceptReason(reason) {
    return `${extensionData.name.copySync()} (ID: ${extensionData.id.copySync()}): ${reason}`;
}