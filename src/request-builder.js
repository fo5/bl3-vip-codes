const {
    prop,
    ifElse
} = require('ramda');

const request = require('request-fluture');
const Validation = require('folktale/validation');
const { Success, Failure } = Validation;

const CID = {
    VAULT: 5261,
    DIAMOND: 5262,
    EMAIL: 5264,
    CREATOR: 5263,
    BOOST: 5721
};

const matchWith = b => a => a.matchWith(b);
module.exports = cookie => ({ type, code, amount }) => (
    request({
        url: `https://2kgames.crowdtwist.com/code-redemption-campaign/redeem?cid=${CID[type]}`,
        method: 'POST',
        json: true,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0',
            accept: 'application/json, text/plain, */*',
            'x-ct-app': 'widget',
            origin: 'https://2kgames.crowdtwist.com',
            referer: 'https://2kgames.crowdtwist.com/widgets/t/code-redemption/9902/',
            te: 'Trailers',
            cookie
        },
        body: { code }
    })
        .map(prop('body'))
        .map(ifElse(prop('points'), Success, Failure))
        .map(matchWith({
            Success: ({ value }) => (
                console.log(`[+] ${type}: ${code} +${value.points}`) ||
                ({ type, code, amount, done: +Date.now() })
            ),
            Failure: ({ value }) => (
                console.log(`[-] ${type}: ${code} -> ${value.exception.model}`) ||
                ({ type, code, amount, error: value.exception.model })
            )
        }))
);