// @ts-check
import * as fs from 'fs';
import {createCanvas} from 'canvas';
import dayjs from 'dayjs';
import {forbiddenWords, colorArray} from '../config/common';

const groupChatsByPerson = (contentArr: string[]) => {
  const chatByPerson: { [key: string]: string[] } = {};
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

const countWordOccurrences = (chatByPerson: { [key: string]: string[] }) => {
  const wordOccurrences: { [key: string]: { [key: string]: number } } = {};
  for (const person in chatByPerson) {
    wordOccurrences[person] = {};
    const lineArray = chatByPerson[person];
    lineArray.map((line: string) => {
      const wordArray = line
          .replace(/\./g, ' ')
          .replace(/,/g, ' ')
          .replace(/!/g, ' ')
          .replace(/\?/g, ' ')
          .split(' ');

      wordArray.map((word: string) => {
        word = word.toUpperCase();
        if (
          word &&
          isNaN(parseInt(word)) &&
          wordOccurrences[person] &&
          !forbiddenWords.includes(word)
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

const sortByOccurrence =
(wordOccurrences: { [key: string]: { [key: string]: number } }) => {
  const finalWordCount: { [key: string]: { [key: string]: number } } = {};
  for (const person in wordOccurrences) {
    const sortedWordList: { [key: string]: number } = {};
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

const createWordCloud = (wordCount: { [key: string]: { [key: string]: number } }) => {
  const customColors: { [key: string]: string } = {};
  const width = 4000;
  const height = 3000;
  const wordCanvas = createCanvas(width, height);
  const context = wordCanvas.getContext('2d');
  context.globalAlpha = 0.9;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  let count = 0;
  for (const person in wordCount) {
    let personalColor = colorArray[count];

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

const generateWordCloud = (contentArr: string[]) => {
  const chatByPerson = groupChatsByPerson(contentArr);
  const wordOccurrences = countWordOccurrences(chatByPerson);
  const finalWordCount = sortByOccurrence(wordOccurrences);
  createWordCloud(finalWordCount);
};

const _generateWordCloud = generateWordCloud;
export {_generateWordCloud as generateWordCloud};
