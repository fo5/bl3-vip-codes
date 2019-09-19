const { not, prop, pipe, split, map, flip, compose, filter, includes, concat } = require('ramda');

const fs = require('fs');

const codes = require('./codes');
const file = fs.readFileSync('./data.csv').toString('utf8');

const codesList = map(prop('code'), codes);

const data = pipe(
    split('\r\n'),
    map(split(' ')),
    map(([code, type, amount]) => ({ code, type, amount })),
    filter(compose(
        not,
        flip(includes)(codesList),
        prop('code')
    )),
    concat(codes)
)(file);

const computeAmount = list => list.reduce((acc, { amount }) => acc + parseInt(amount), 0);

console.log(`${codes.length}: ${computeAmount(codes)} -> ${data.length}: ${computeAmount(data)}`);

const asJSFile = (file, content) => fs.writeFileSync(file,
    `
module.exports = ${JSON.stringify(content, null, 2)};
`
);

asJSFile('./codes.js.bak', codes);
asJSFile('./codes.js', data);
