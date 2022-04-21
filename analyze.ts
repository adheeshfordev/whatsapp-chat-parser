// @ts-check
import * as fs from 'fs';
import dayjs, {extend} from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
extend(customParseFormat);

import {generateWordCloud} from './util/wordCloud';

const fetchChatAnalysis = () => {
  const content = fs.readFileSync(process.argv[2]).toString();
  const contentArr: string[] = content.split('\n');
  const timestampsByPerson = groupTimestampsByPerson(contentArr);
  generateWordCloud(contentArr);
};

const groupTimestampsByPerson = (contentArr: string[]) => {
  const chatTimesByPerson: { [key: string]: { [key: string]: number } } = {};
  const wordCountByPerson: { [key: string]: { [key: string]: number } } = {};
  contentArr.map((line: string) => {
    const timeString = line.substr(0, line.indexOf('-')).trim();
    const timeStamp = dayjs(timeString, 'DD/MM/YY, h:mm a');
    line = line.substring(line.indexOf('-') + 1);

    if (timeStamp.isValid()) {
      const name = line.substr(0, line.indexOf(':')).trim();
      const msg = line.substring(line.indexOf(':') + 1);
      const month = timeStamp.format('MMM YYYY');
      if (!chatTimesByPerson[month]) {
        chatTimesByPerson[month] = {};
        wordCountByPerson[month] = {};
      }
      if (!chatTimesByPerson[month][name]) {
        chatTimesByPerson[month][name] = 0;
        wordCountByPerson[month][name] = 0;
      }
      chatTimesByPerson[month][name] += 1;
      wordCountByPerson[month][name] += msg.split(' ').length;
    }
  });
  console.log(chatTimesByPerson);
  console.log(wordCountByPerson);
  return chatTimesByPerson;
};

fetchChatAnalysis();
