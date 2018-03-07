function copyIfValid(src, dest, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if(src.hasOwnProperty(key) && src[key] !== null) {
            dest[key] = src[key];
        }
    }
}

class Link {

    constructor(rel, data, optional = {}, multiple = false) {
        if (rel === undefined || data === undefined) {
            throw (new Error('rel and href required'));
        }
        this.rel = rel;
        this.is_multiple = multiple;
        if (typeof data === 'string') {
            this.href = data;
            data = optional;
        }
        copyIfValid(data, this, [
            'href',
            'templated',
            'type',
            'deprecation',
            'name',
            'profile',
            'title',
            'hreflang',
        ]);
    }

    multiple() {
        return this.is_multiple;
    }

    toJSON() {
        const jsonObj = {};
        for (let prop in this) {
            if (this.hasOwnProperty(prop)) {
                if(prop === 'rel' || prop === 'is_multiple') {
                    continue;
                }
                if(this[prop] !== undefined) {
                    jsonObj[prop] = this[prop];
                }
            }
        }
        return jsonObj;
    }
}

module.exports = Link;
