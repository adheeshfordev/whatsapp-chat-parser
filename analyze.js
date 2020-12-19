const fs = require('fs');
const dayjs = require('dayjs');
let customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const wordCloud = require('./util/wordCloud');
const config = require('./config/common');

const fetchChatAnalysis = () => {
    let content = fs.readFileSync(process.argv[2]).toString();
    let contentArr = content.split('\n');
    const timestampsByPerson = groupTimestampsByPerson(contentArr);
    wordCloud.generateWordCloud(contentArr);
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
        if ( !chatTimesByPerson[month] ) {
            chatTimesByPerson[month] = {};
        }
        if ( !chatTimesByPerson[month] [name]) {
            chatTimesByPerson[month] [name] = 0;
        }
        chatTimesByPerson[month] [name] += 1;
    }
    });
    console.log(chatTimesByPerson);
    return chatTimesByPerson;
};

fetchChatAnalysis();