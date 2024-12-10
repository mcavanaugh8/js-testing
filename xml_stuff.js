const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const xpath = require('xpath')

console.log(path.join(__dirname, 'hobbit.ssml'))
const processedSSML = addMarksToSsml(path.join(__dirname, 'hobbit.ssml'), 'utf8');

async function addMarksToSsml(ssml) {
    const documentNode = new DOMParser().parseFromString(ssml);

    console.log(documentNode)
}