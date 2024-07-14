import { Crypto, load, _ } from './lib/cat.js';

let siteKey = '';
let siteType = 0;
let timeout = 10000;
const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';
let HOST = 'https://taozi007.com';
let headers = {
    'User-Agent': PC_UA,
    'Referer': HOST,
};
let html = '';
async function request(reqUrl, data, header, method) {
    let res = await req(reqUrl, {
        method: method || 'get',
        data: data || '',
        headers: header || headers,
        postType: method === 'post' ? 'form-data' : '',
        timeout: timeout,
    });
    return res.content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    let res = await req(HOST, {headers: headers});
    while (true) {
        if (typeof(res.headers['set-cookie']) == 'object' && res.headers['set-cookie'][0].includes('guardok=')) {
            headers['Cookie'] = res.headers['set-cookie'].join(' ');
            html = res.content;
            break;
        } else if (res.headers['set-cookie'].includes('guard=')) {
            let id = res.headers['set-cookie'].match(/guard=([^;]+)/)[1];
            let a = id.substr(0, 8);
            let b = parseInt(id.substr(12));
            b = b * 2 + 16;
            let c = '';
            for(let i =0;i<String(b).length;i++) {
                let code = String(b).charCodeAt(i) ^ a.charCodeAt(i%a.length);
                c += String.fromCharCode(code);
            }
            headers.Cookie = 'guard=' + id + '; guardret=' + btoa(c);
            res = await req(HOST, {headers: headers});
        } else {
            break;
        }
    }
    
}

async function home(filter) {
    const classes = [{'type_id': '1', 'type_name': '电影'},{'type_id': '2', 'type_name': '电视'},{'type_id': '3', 'type_name': '动漫'},{'type_id': '4', 'type_name': '综艺'},{'type_id': '5', 'type_name': '短剧'}]
    return JSON.stringify({
        'class': classes,
        'filters': {},
    })
}

async function homeVod() {
    const $ = load(html);
    let videos = _.map($('a.module-item'), item => {
        return {
            'vod_id': $(item).attr('href'),
            'vod_name': $(item).attr('title'),
            'vod_pic': $(item).find('img').attr('data-original'),
            'vod_remarks': $(item).find('.module-item-note').text(),
        }
    })
    return JSON.stringify({
        'list': videos,
    })
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    let url = `${HOST}/show/${tid}--------${pg}---.html`;
    const $ = load(await request(url));
    let videos = _.map($('a.module-item'), item => {
        return {
            'vod_id': $(item).attr('href'),
            'vod_name': $(item).attr('title'),
            'vod_pic': $(item).find('img').attr('data-original'),
            'vod_remarks': $(item).find('.module-item-note').text(),
        }
    })
    return JSON.stringify({
        'list': videos,
        'pagecount': 999,
        'page': pg,
    })
}

async function detail(id) {
    const $ = load(await request(HOST + id));
    let typeName = _.map($('.module-info-tag a'), item => $(item).text()).join(' ');
    let content = $('.show-desc').text();
    let director = _.map($('.module-info-item:has(span:contains("导演")) a'), item => $(item).text()).join(' ');
    let actor = _.map($('.module-info-item:has(span:contains("主演")) a'), item => $(item).text()).join(' ');
    let playFrom = _.map($('.module-tab-item.tab-item span'), item => $(item).text()).join('$$$');
    let playUrl = _.map($('.module-play-list'), item => {
        return _.map($(item).find('a'), it => $(it).text() + '$' + $(it).attr('href')).join('#');
    }).join('$$$');
    let vod = {
        type_name: typeName,
        vod_content: content, 
        vod_actor: actor,
        vod_director: director,
        vod_play_from: playFrom,
        vod_play_url: playUrl
    }
    return JSON.stringify({
        list: [vod]
    });
}

async function play(flag, id, flags) {
    html = await request(HOST + id);
    const json = getPlay4aJson(html);
    let js = JSON.parse(json);
    let playUrl = js.url;
    if (js.encrypt == 1) {
        playUrl = unescape(playUrl);
    } else if (js.encrypt == 2) {
        playUrl = unescape(base64Decode(playUrl));
    }
    if (playUrl.endsWith('.m3u8')) {
        return JSON.stringify({
            parse: 0,
            url: playUrl
        });
    }
    let from = js.from;
    if (from == 'qq' || from == 'youku' || from == 'iqiyi' || from == 'mgtv' || from == 'tudou' || from == 'sohu' || from == 'le' || from == 'pptv' || from == 'cntv' || from == 'bilibili' || from == 'youtube' || from == 'qqvideo' || from == 'miguvideo' || from == 'letv' || from == 'wasu') {
        html = await request('https://jx.taozi007.com/player/ec.php?code=tz&if=1&url=' + playUrl);
        let str = html.split('"url":"')[1].split('"')[0];
        let uid = html.split('"uid":"')[1].split('"')[0];
        //console.log(str, uid, '2890' + uid + 'tB959C', '2F131BE91247866E');
        playUrl = aesDecode(str.replaceAll('\\',''), '2890' + uid + 'tB959C', '2F131BE91247866E');
    } else {
        html = await request('https://taozi007.com/player/?url=' + playUrl);
        if (html.includes('var rand') && html.includes('var player')) {
            let iv = html.split('var rand = "')[1].split('"');
            let str = html.split('var player = "')[1].split('"')[0];
            playUrl = JSON.parse(aesDecode(str, 'VFBTzdujpR9FWBhe', iv)).url;
        } else if (html.includes('iframe src=') && html.includes('.m3u8')) {
            playUrl = html.split('src="analysis.php?v=')[1].split('"')[0];
        }
    }
    return JSON.stringify({
        parse: 0,
        url: playUrl
    });
}

function getPlay4aJson(html) {
    let $ = load(html);
    return $('script:contains(player_aaaa)').text().replace('var player_aaaa=','');
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}
//aes解密
function aesDecode(str, keyStr, ivStr, type) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    if (type === 'hex') {
        str = Crypto.enc.Hex.parse(str);
        return Crypto.AES.decrypt({
            ciphertext: str
        }, key, {
            iv: Crypto.enc.Utf8.parse(ivStr),
            mode: Crypto.mode.CBC,
            padding: Crypto.pad.Pkcs7
        }).toString(Crypto.enc.Utf8);
    } else {
        return Crypto.AES.decrypt(str, key, {
            iv: Crypto.enc.Utf8.parse(ivStr),
            mode: Crypto.mode.CBC,
            padding: Crypto.pad.Pkcs7
        }).toString(Crypto.enc.Utf8);
    }
 }

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        // search: search,
        // validCode: validCode,
    };
}
