const fs = require('fs');
const canvas = require('canvas');
const dayjs = require('dayjs');
const config = require('../config/common');

const groupChatsByPerson = (contentArr) => {
  const chatByPerson = {};
  let prevName = '';
  contentArr.map((line) => {
    const timeString = line.substr(0, line.indexOf('-')).trim();
    const hasTimeStampPrefix = dayjs(timeString, 'DD/MM/YY, h:mm a').isValid();
    line = line.substring(line.indexOf('-') + 1);
    let name = line.substr(0, line.indexOf(':')).trim();
    if (!name || !hasTimeStampPrefix) {
      name = prevName;
    }
    if (!line.toUpperCase().includes('<MEDIA')) {
      if (!chatByPerson[name]) {
        chatByPerson[name] = [line.substring(line.indexOf(':') + 1)];
      } else {
        chatByPerson[name].push(line.substring(line.indexOf(':') + 1));
      }
    }
    prevName = name;
  });
  return chatByPerson;
};

const countWordOccurrences = (chatByPerson) => {
  const wordOccurrences = {};
  for (const person in chatByPerson) {
    wordOccurrences[person] = {};
    const lineArray = chatByPerson[person];
    lineArray.map((line) => {
      const wordArray = line
          .replace(/\./g, ' ')
          .replace(/\,/g, ' ')
          .replace(/\!/g, ' ')
          .replace(/\?/g, ' ')
          .split(' ');

      wordArray.map((word) => {
        word = word.toUpperCase();
        if (
          word &&
          isNaN(parseInt(word)) &&
          wordOccurrences[person] &&
          !config.forbiddenWords.includes(word)
        ) {
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
  const finalWordCount = {};
  for (const person in wordOccurrences) {
    const sortedWordList = {};
    const wordList = wordOccurrences[person];
    const sortedWordKeyList = Object.keys(wordList);
    sortedWordKeyList
        .sort((a, b) => {
          return wordList[b] - wordList[a];
        })
        .map((word) => {
          sortedWordList[word] = wordList[word];
        });
    finalWordCount[person] = sortedWordList;
  }
  return finalWordCount;
};

const createWordCloud = (wordCount) => {
  const customColors = {};
  const width = 4000;
  const height = 3000;
  const wordCanvas = canvas.createCanvas(width, height);
  const context = wordCanvas.getContext('2d');
  context.globalAlpha = 0.9;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  let count = 0;
  for (const person in wordCount) {
    let personalColor = config.colorArray[count];

    if (customColors[person]) {
      personalColor = customColors[person];
    }

    for (const word in wordCount[person]) {
      const fontSize = wordCount[person][word] / 10;
      context.font = `bold ${fontSize}px Menlo`;
      context.fillStyle = personalColor;
      const x = Math.random() * 3600 + 200;
      const y = Math.random() * 2700 + 150;
      context.fillText(word, x, y);
    }
    count++;
  }
  const buffer = wordCanvas.toBuffer('image/png');
  fs.writeFileSync('./image.png', buffer);
};

const generateWordCloud = (contentArr) => {
  const chatByPerson = groupChatsByPerson(contentArr);
  const wordOccurrences = countWordOccurrences(chatByPerson);
  const finalWordCount = sortByOccurrence(wordOccurrences);
  createWordCloud(finalWordCount);
};

exports.generateWordCloud = generateWordCloud;
