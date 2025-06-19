const axios = require("axios");
const fs = require("fs");
const path = require("path");

const BASE_API = "https://jonell01-ccprojectsapihshs.hf.space";
const isURL = (u) => /^https?:\/\//.test(u);

const cachePath = path.join(__dirname, "cache");
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

function extractURL(text) {
    if (typeof text !== "string") return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    return urls ? urls[0] : null;
}

function detectPlatform(url) {
    const map = {
        "facebook.com": "/api/fbdl",
        "fb.watch": "/api/fbdl",
        "tiktok.com": "/api/tikdl",
        "vt.tiktok.com": "/api/tikdl",
        "instagram.com": "/api/insta",
        "soundcloud.com": "/api/sclouddl",
        "twitter.com": "/api/xdl",
        "x.com": "/api/xdl",
        "pinterest.com": "/api/pindl",
        "capcut.com": "/api/capdl",
        "threads.net": "/api/thrdl"
    };
    return Object.entries(map).find(([key]) => url.includes(key))?.[1] || null;
}

async function fetchMedia(url, endpoint) {
    const fullURL = `${BASE_API}${endpoint}?url=${encodeURIComponent(url)}`;
    try {
        const res = await axios.get(fullURL, { timeout: 15000 });
        const data = res.data;

        if (!data || typeof data !== 'object') return null;

        if (data.DownloadLink) {
            return {
                title: data.title || "Instagram Video",
                author: data.author || "Unknown",
                medias: [{
                    url: data.DownloadLink,
                    type: "video",
                    extension: "mp4"
                }]
            };
        }

        if (data.download_url) {
            return {
                title: data.title || "Không tiêu đề",
                author: data.author || "Không rõ",
                medias: [{
                    url: data.download_url,
                    type: "video",
                    extension: "mp4"
                }]
            };
        }

        if (Array.isArray(data.medias)) {
            return {
                title: data.title || "Không tiêu đề",
                author: data.author || "Không rõ",
                medias: data.medias
            };
        }

        return null;
    } catch (err) {
        console.error("❌ Lỗi API:", err.message);
        return null;
    }
}

async function streamMedia(url, type) {
    const fileName = `${Date.now()}.${type}`;
    const filePath = path.join(cachePath, fileName);

    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            timeout: 15000
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        setTimeout(() => {
            fs.existsSync(filePath) && fs.unlinkSync(filePath);
        }, 60000);

        return fs.createReadStream(filePath);
    } catch (err) {
        console.error("❌ Lỗi tải file:", err.message);
        return null;
    }
}

exports.handleEvent = async function (o) {
    try {
        const { body, threadID, messageID } = o.event;
        const send = (msg) => o.api.sendMessage(msg, threadID, messageID);

        const url = extractURL(body);
        if (!url || !isURL(url)) return;

        const endpoint = detectPlatform(url);
        if (!endpoint) return send("⚠️ Không hỗ trợ nền tảng này.");

        const mediaData = await fetchMedia(url, endpoint);
        if (!mediaData) return send("❌ Không thể lấy dữ liệu từ URL này.");

        const { title, author, medias } = mediaData;
        let bodyMsg = `🔗 URL: ${url}\n👤 Tác giả: ${author}\n📖 Tiêu đề: ${title}`;
        const attachments = [];

        for (const media of medias) {
            const ext = media.extension || "mp4";
            const stream = await streamMedia(media.url, ext);
            if (stream) {
                attachments.push(stream);
            } else {
                bodyMsg += `\n⚠️ Lỗi khi tải: ${media.url}`;
            }
        }

        if (attachments.length > 0) {
            send({ body: bodyMsg, attachment: attachments });
        } else {
            send(bodyMsg + "\n❌ Không có nội dung nào được gửi lại.");
        }
    } catch (err) {
        console.error("❌ Lỗi xử lý sự kiện:", err.message);
    }
};

exports.run = () => {};

exports.config = {
    name: "auto",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mạnh KenZ and Thanh Nguyên",
    description: "Tự động nhận link và tải media từ các nền tảng xã hội",
    commandCategory: "Tiện ích",
    usages: [],
    cooldowns: 3
};
