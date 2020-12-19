const fs = require('fs');
const canvas = require('canvas');
const dayjs = require('dayjs');
let customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat)

let customColors = {};
let colorArray = [
    '#3366CC',
    '#DC3912',
    '#FF9900',
    '#109618',
    '#990099',
    '#3B3EAC',
    '#0099C6',
    '#DD4477',
    '#66AA00',
    '#B82E2E',
    '#316395',
    '#994499',
    '#22AA99',
    '#AAAA11',
    '#6633CC',
    '#E67300',
    '#8B0707',
    '#329262',
    '#5574A6',
    '#3B3EAC',
  ];

//let forbiddenWords = ['I', 'THE', 'TO', 'AND', 'FOR', 'WILL', 'CAN', 'OKAY'];
let forbiddenWords = [];

const fetchChatAnalysis = () => {
    let content = fs.readFileSync(process.argv[2]).toString();
    let contentArr = content.split('\n');

    const chatByPerson = groupChatsByPerson(contentArr);
    const timestampsByPerson = groupTimestampsByPerson(contentArr);
    const wordOccurrences = countWordOccurrences(chatByPerson);
    const finalWordCount = sortByOccurrence(wordOccurrences);
    generateWordCloud(finalWordCount);
};

const groupTimestampsByPerson = (contentArr) => {
    let chatTimesByPerson = {};
    contentArr.map((line) => {
    let timeString = line.substr(0, line.indexOf('-')).trim();
    let timeStamp = dayjs(timeString, 'DD/MM/YY, h:mm a');
    line = line.substring(line.indexOf('-')+1);
    
    if (timeStamp.isValid()) {
        let name = line.substr(0, line.indexOf(':')).trim(); 
        let month = timeStamp.format('MMM YYYY');
        if ( !chatTimesByPerson[name] ) {
            chatTimesByPerson[name] = {};
        }
        if ( !chatTimesByPerson[name] [month]) {
            chatTimesByPerson[name] [month] = 0;
        }
        chatTimesByPerson[name] [month] += 1;
    }
    });
    console.log(chatTimesByPerson);
    return chatTimesByPerson;
};

const groupChatsByPerson = (contentArr) => {
    let chatByPerson = {};
    let prevName = '';
    contentArr.map((line) => {
    let timeString = line.substr(0, line.indexOf('-')).trim();
    let hasTimeStampPrefix = dayjs(timeString, 'DD/MM/YY, h:mm a').isValid();
    line = line.substring(line.indexOf('-')+1);
    let name = line.substr(0, line.indexOf(':')).trim();
    if (!name || !hasTimeStampPrefix) {
        name = prevName;
    }
    if (!line.toUpperCase().includes('<MEDIA')) {

        if (!chatByPerson[name]) {
            chatByPerson[name] = [line.substring(line.indexOf(':')+1)];
        } else {
            chatByPerson[name].push(line.substring(line.indexOf(':')+1));
        }
    }
    prevName = name;
    });
    return chatByPerson;
};

const countWordOccurrences = (chatByPerson) => {
    let wordOccurrences = {};
    for (const person in chatByPerson) {
        wordOccurrences[person] = {};
        let lineArray = chatByPerson[person];
        lineArray.map((line) => {
        var wordArray = line.replace(/\./g, ' ').replace(/\,/g, ' ').replace(/\!/g, ' ').replace(/\?/g, ' ').split(' ');
        
        wordArray.map((word) => {
            word = word.toUpperCase();
            if (word && isNaN(parseInt(word))  && wordOccurrences[person] && !forbiddenWords.includes(word)) {
                if (wordOccurrences[person][word]) {
                    wordOccurrences[person][word] += 1;
                } else {
                    wordOccurrences[person][word] = 1;
                }
            }
        });
    });
    }
    return wordOccurrences;
};

const sortByOccurrence = (wordOccurrences) => {
    let finalWordCount = {};
    for (const person in wordOccurrences) {
        let sortedWordList = {};
        let wordList = wordOccurrences[person];
        let sortedWordKeyList = Object.keys(wordList);
        sortedWordKeyList.sort((a, b) => { return wordList[b] - wordList[a];}).map((word) => {
            sortedWordList[word] = wordList[word];
        });
        finalWordCount[person] = sortedWordList;
    }
    return finalWordCount;
}

const generateWordCloud = (wordCount) => {
    let width = 4000;
    let height = 3000;
    const wordCanvas = canvas.createCanvas(width, height);
    const context = wordCanvas.getContext('2d');
    context.globalAlpha = 0.9;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    let count = 0;
    for (let person in wordCount) {
        let personalColor = colorArray[count];
        
        if (customColors[person]) {
            personalColor = customColors[person];
        }
        
        for (let word in wordCount[person]) {
            let fontSize = wordCount[person][word]/10;
            context.font = `bold ${fontSize}px Menlo`;
            context.fillStyle = personalColor;
            const x = Math.random()*3600 + 200;
            const y= Math.random()*2700 + 150;
            context.fillText(word, x, y);
        }
        count++;
    }
    const buffer = wordCanvas.toBuffer('image/png');
    fs.writeFileSync('./image.png', buffer);
};
fetchChatAnalysis();