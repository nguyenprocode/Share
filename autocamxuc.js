const axios = require("axios");

module.exports.config = {
    name: "autocamxuc",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Thanh Nguyên",
    description: "Tự động phản hồi khi phát hiện emoji trong tin nhắn (dữ liệu từ GitHub)",
    commandCategory: "Tự động",
    usages: "Tự động phát hiện emoji và trả lời",
    cooldowns: 0
};

// Link raw của file JSON trên GitHub
const emojiDataURL = "https://raw.githubusercontent.com/user/repo/main/emojiResponses.json";

module.exports.handleEvent = async function({ event, api }) {
    const { body, threadID, messageID } = event;
    if (!body) return;

    try {
        // Tải danh sách emoji và phản hồi từ GitHub
        const { data: responses } = await axios.get(emojiDataURL);

        // Kiểm tra xem tin nhắn có emoji nào không
        let foundEmoji = Object.keys(responses).find(emoji => body.includes(emoji));

        if (foundEmoji) {
            let reply = responses[foundEmoji][Math.floor(Math.random() * responses[foundEmoji].length)];
            return api.sendMessage(reply, threadID, messageID);
        }
    } catch (error) {
        console.error("Lỗi tải dữ liệu emoji từ GitHub:", error);
    }
};

module.exports.run = function() {};
