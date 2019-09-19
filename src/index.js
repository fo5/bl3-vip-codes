const fs = require('fs');
const path = require('path');
const Future = require('fluture');
const Result = require('folktale/result');

require('dotenv').config()

const makeRequest = require('./request-builder');
const cookie = process.env.COOKIE

const submit = makeRequest(cookie);

const codes = require('../codes.js');

const FORCE = process.env.FORCE;

const requests = (
    codes
        .filter(code => FORCE || (code.error === undefined && !code.done))
        .map(submit)
);

const asJSFile = (file, content) => fs.writeFileSync(file, `
module.exports = ${JSON.stringify(content, null, 2)};
`
);

const computeAddedAmount = updatedCodes => (
    updatedCodes
        .filter(({ done }) => done)
        .reduce((acc, { amount }) => acc + parseInt(amount), 0)
);

console.log(`[?] Submitting ${requests.length} codes.`);

const updateCodes = file => codes => updatedCodes => {
    const _updatedCodes = updatedCodes.map(({ code }) => code);
    const _codes = codes.filter(({ code }) => !_updatedCodes.includes(code));

    return asJSFile(file, _codes.concat(updatedCodes));
};

Future
    .parallel(1, requests)
    .fork(
        console.log,
        updatedCodes => (
            console.log(`[?] Done. +${computeAddedAmount(updatedCodes)}`)
            || updateCodes(path.join(__dirname, '..', '/codes.js'))(codes)(updatedCodes)
        )
    );