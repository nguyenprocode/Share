const fs = require('fs');
const axios = require('axios');
const moment = require('moment-timezone');
const path = require('path');

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const config = [
    {
        timer: '00:10:00 AM',
        message: ['🔥=== ${global.config.BOTNAME} ===🔥\n━━━━━━━━━━━━━━━━━━━\n💸 Dịch vụ thuê bot\n➤ Hỗ trợ nhanh chóng - Uy tín\n━━━━━━━━━━━━━━━━━━━\n⚜️ Muốn bot? Liên hệ ngay!\n➤ Zalo: [📌 Nhấn vào đây](https://zalo.me/0355073243)\n➤ Facebook: [🌐 Nhấn vào đây](https://www.facebook.com/100056204041775)\n━━━━━━━━━━━━━━━━━━━\n🌟 Cảm ơn bạn đã sử dụng dịch vụ! 🌟\n']
    },
    {
        timer: '08:00:00 PM',
        message: ['🔥=== ${global.config.BOTNAME} ===🔥\n━━━━━━━━━━━━━━━━━━━\n💸 Dịch vụ thuê bot\n➤ Hỗ trợ nhanh chóng - Uy tín\n━━━━━━━━━━━━━━━━━━━\n⚜️ Muốn bot? Liên hệ ngay!\n➤ Zalo: [📌 Nhấn vào đây](https://zalo.me/0355073243)\n➤ Facebook: [🌐 Nhấn vào đây](https://www.facebook.com/100056204041775)\n━━━━━━━━━━━━━━━━━━━\n🌟 Cảm ơn bạn đã sử dụng dịch vụ! 🌟\n']
    }
];

module.exports.onLoad = (o) => {
    if (global.autosendmessage_setinterval) clearInterval(global.autosendmessage_setinterval);

    global.autosendmessage_setinterval = setInterval(async function () {
        const currentTime = new Date(Date.now() + 25200000).toLocaleTimeString('en-US', { hour12: true });
        const foundConfig = config.find(item => item.timer === currentTime);
        if (!foundConfig) return;

        let msg = getRandom(foundConfig.message);
        msg = msg.replace(/{time}/g, moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss (D/MM/YYYY) (dddd)"));

        try {
            // Đọc file JSON chứa danh sách video
            const filePath = path.resolve(__dirname, './../../includes/datajson/vdcosplay.json');
            const videoData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (videoData && videoData.length > 0) {
                const randomVideo = getRandom(videoData); // Lấy video ngẫu nhiên từ file JSON
                const videoUrl = randomVideo.url; // Giả sử URL video lưu trong key "url"

                msg = {
                    body: msg,
                    attachment: videoUrl // Gửi video thay vì ảnh
                };
            } else {
                msg = { body: msg };
            }

            global.data.allThreadID.forEach(threadID => o.api.sendMessage(msg, threadID));
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn tự động:", error);
        }
    }, 1000);
};

module.exports.run = () => {};
