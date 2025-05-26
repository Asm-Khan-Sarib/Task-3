(function () {

    const maxDiff = Math.pow(2, 32) - 1;
    let get32bitRandomInt, int;

    const cryptoRandomInt = (edge1, edge2) => {
        return new Promise((resolve, reject) => {
            const
                currentDiff = Math.abs(edge1 - edge2),
                upperBoundInclusive = maxDiff - (maxDiff + 1) % (currentDiff + 1);
            if (!Number.isInteger(edge1) || !Number.isInteger(edge2) || currentDiff > maxDiff) {
                reject(new Error("You must supply two integer arguments with a difference < " + (maxDiff + 1)));
                return;
            }
            int = get32bitRandomInt();
            while (int > upperBoundInclusive) {
                int = get32bitRandomInt();
            }
            resolve(int % (currentDiff + 1) + Math.min(edge1, edge2));
        });
    };

    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        let nodeCrypto = require("crypto");
        get32bitRandomInt = () => nodeCrypto.randomBytes(4).readUInt32BE(0);
        module.exports = cryptoRandomInt;
    } else if (typeof window !== "undefined") {
        let browserCrypto = window.crypto || window.msCrypto;
        get32bitRandomInt = () => browserCrypto.getRandomValues(new Uint32Array(1))[0];
        window.cryptoRandomInt = cryptoRandomInt;
    }

}());