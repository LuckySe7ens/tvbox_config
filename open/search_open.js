import { Crypto, load, _ } from './lib/cat.js';

let siteUrl ='http://103.45.68.47:6800/gy/gy_yzPw/点播.php';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Referer': 'https://jx.5566jiexi.com/',
    //'Content-Type': 'text/html; charset=UTF-8',
    //'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
};
const pic = 'https://kaiyu.serv00.net/yoyo/';

async function request(reqUrl, postData, post) {
    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: headers,
        data: postData || {},
        timeout: 30000,
    });
    return res.content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        siteUrl = cfg.ext;
    }
}

async function detail(id) {
    try {
        const $ = load(await request(id));
        const playUrls = _.map($('a'), (item,idx) => {
            return (idx+1) + '$' + $(item).attr('href');
        }).join('#');
        return JSON.stringify({
            list: [
            {
                vod_play_from: 'Leospring',
                vod_play_url: playUrls,
                vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
            }
        ]});
    } catch (e) {
    console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let url = siteUrl + '?searchword=' + wd;
    const $ = load(await request(url));
    const videos = _.map($('a'), item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).text(),
            vod_pic: pic,
            vod_remarks: '',
        }
    });
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
    });
}

const jiexiUrl = 'https://jx.xn--cerrw216dja891if19b.xn--fiqs8s/player/jiexi.php?code=5566jiexi&if=1&url=';
async function jiexi(url) {
    //https://jx.xn--cerrw216dja891if19b.xn--fiqs8s/player/jiexi.php?code=5566jiexi&if=1&url=https://v.qq.com/x/cover/mzc00200094m6mo/y4100ek7dly.html
    const parseUrl = jiexiUrl + url;
    const html = await request(parseUrl);
    const $ = load(html);
    const configData = JSON.parse($('script:contains(ConFig = )').html().replace('let ConFig =', '').replace(',box = $("#player"),lg = ConFig.lg;',''));
    return aesDecode(configData.url, '2890' + configData.config.uid + 'tB959C', '2F131BE91247866E');
}

//aes解密
function aesDecode(str, keyStr, ivStr) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    var bytes = Crypto.AES.decrypt(str, key, {
		iv: Crypto.enc.Utf8.parse(ivStr),
		mode: Crypto.mode.CBC,
		padding: Crypto.pad.Pkcs7
	});
    return bytes.toString(Crypto.enc.Utf8);
}


export function __jsEvalReturn() {
    return {
        init: init,
        detail: detail,
        play: play,
        search: search,
        jiexi: jiexi,
    };
}