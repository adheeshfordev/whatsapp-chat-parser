const fs = require('fs');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const wordCloud = require('./util/wordCloud');
const config = require('./config/common');

const fetchChatAnalysis = () => {
  const content = fs.readFileSync(process.argv[2]).toString();
  const contentArr = content.split('\n');
  const timestampsByPerson = groupTimestampsByPerson(contentArr);
  wordCloud.generateWordCloud(contentArr);
};

const groupTimestampsByPerson = (contentArr) => {
  const chatTimesByPerson = {};
  const wordCountByPerson = {};
  contentArr.map((line) => {
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
