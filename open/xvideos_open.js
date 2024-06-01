import { Crypto, load, _ } from './lib/cat.js';

let siteUrl ='https://api.xv-api.com/api';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'MMozilla/5.0 (Linux; Android 9; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.90 Mobile Safari/537.36; xvdizhi',
    'Referer': 'https://www.xvideos.com',
    'Content-Type': 'application/json; charset=utf-8',
};

async function request(reqUrl, postData, post) {

    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: headers,
        data: postData || {},
        //postType: post ? 'form' : '',
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        siteUrl = cfg.ext;
    }
}

async function home(filter) {
    const url = siteUrl + '/home-content';
    const res = await getRemoteData(url);
    return res;
}

async function homeVod() {
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;

    let uri = ext['uri'] || '';
    let url = `${siteUrl}/category-content?type=${tid}&page=${pg}&uri=${uri}`;

    let res = await getRemoteData(url);
    return res;
}

async function detail(id) {
    try {
        const param = JSON.parse(id);
        let res = JSON.parse(await getRemoteData(siteUrl + '/detail-content', [param], true));
        // res['list'][0]['vod_play_url'] = _.map(res['list'][0]['vod_play_url'].split('#'), item => {
        //     return item.split('$')[0] + '$' + base64Encode(item.split('$')[1]);
        // }).join('#');
        res['list'][0]['vod_content'] = '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！';
        res['list'][0]['vod_play_from'] = 'Leospring';
        return JSON.stringify(res);
    } catch (e) {
    console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let url = siteUrl + '/search-content?key=' + wd;
    const res = await getRemoteData(url);
    return res;
}

async function getRemoteData(url, params, isPost) {
    const html = await request(url, params, isPost);
    const res = aesDecode(html, 'af326s34f4c29sdf', '1A232567B9A3C3EA');
    return res;
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

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
        header: {
            'User-Agent': 'MMozilla/5.0 (Linux; Android 9; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.90 Mobile Safari/537.36; xvdizhi',
            'Referer': 'https://www.xvideos.com',
        },
    });
}

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search,
    };
}