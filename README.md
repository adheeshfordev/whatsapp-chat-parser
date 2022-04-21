# whatsapp-chat-parser
Analyzes chats. Throws up stats.

## **How to use**

1. Go to your Whatsapp screen
2. Pick a contact you want to generate a word cloud for
3. Click on the kebab menu (The three vertical dots) on the top-right corner and find the Export Chat option
4. Click on the Export Chat option and share the generated chat backup file to a location from where you can download it
5. Download the file to a location from where you can access it on your machine
6. Run `npx ts-node analyze.ts <Location of the Downloaded file>`
7. An image will be generated with a wordcloud
