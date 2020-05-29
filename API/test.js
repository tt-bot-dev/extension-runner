export function makeAMessage() {
    return __makeAPIRequest("POST", "/channels/390524497523900427/messages", true, {
        content: "Hello!"
    });
}