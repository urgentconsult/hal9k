const Link = require('./link');

function sanitizeHalJSONObj(halJSON) {
    if (halJSON.hasOwnProperty('_links') && isEmptyObject(halJSON._links)) {
        delete halJSON._links;
    }
    if (halJSON.hasOwnProperty('_embedded') && isEmptyObject(halJSON._embedded)) {
        delete halJSON._embedded;
    }
    return halJSON;
}

function isEmptyObject(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

class Resource {
    constructor(state) {
        this.links = [];
        this.embedded = [];
        this.properties = state || {};
    }

    link(rel, href, optionals) {
        if (typeof href === 'string') {
            const link = Object.assign({
                href
            }, optionals)
            this.links.push(new Link(rel, link));
        } else if (Array.isArray(href)) {
            const multiple = true;
            for (let i = 0; i < href.length; i++) {
                this.links.push(new Link(rel, href[i], optionals, multiple));
            }
        } else if (typeof href === 'object') {
            const link = Object.assign({}, href);
            this.links.push(new Link(rel, link, optionals));
        }
        return this;
    }

    linkTemplate(rel, href, optionals) {
        const link = Object.assign({
            href
        }, optionals, {
            templated: true
        })
        this.links.push(new Link(rel, link));
        return this;
    }

    curie(name, urlTemplate) {
        const templated = true;
        const multiple = true;
        this.links.push(new Link('curies', urlTemplate, { name, templated }, multiple));
        return this;
    }

    embed(rel, resource) {
        this.embedded.push({
            rel,
            resource
        });
        return this;
    }

    state(properties) {
        Object.assign(this.properties, properties);
        return this;
    }

    toJSON() {
        const _embedded = this.embedded.reduce((obj, embedded) => {
            const { rel, resource: res } = embedded;
            const exists = obj.hasOwnProperty(rel);
            const multiple = Array.isArray(res);

            if (multiple) {
                if (Array.isArray(obj[rel])) {
                    obj[rel] = obj[rel].concat(res.map(r => r.toJSON()));
                } else if (exists) {
                    obj[rel] = [obj[rel]].concat(res.map(r => r.toJSON()));
                } else {
                    obj[rel] = res.map(r => r.toJSON());
                }
            } else if (Array.isArray(obj[rel])) {
                obj[rel].push(res.toJSON());
            } else if (exists) {
                obj[rel] = [obj[rel], res.toJSON()];
            } else {
                obj[rel] = res.toJSON();
            }
            return obj;
        }, {});

        const _links = this.links.reduce((obj, link) => {
            if (!obj.hasOwnProperty(link.rel)) {
                obj[link.rel] = link.multiple() ? [link.toJSON()] : link.toJSON();
            } else if (Array.isArray(obj[link.rel])) {
                obj[link.rel].push(link.toJSON());
            } else {
                obj[link.rel] = [obj[link.rel], link.toJSON()];
            }
            return obj;
        }, {});

        const halJSON = Object.assign(this.properties, {
            _links,
            _embedded
        });
        return sanitizeHalJSONObj(halJSON);
    }
}

module.exports = Resource;
