import { Crypto, load, _ } from './lib/cat.js';

//地址
let siteUrl = 'https://cn1.91short.com';
let siteKey = '';
let siteType = 0;
let headers = {};
let nextPgKey = '';
let nextUrl = '';
const classes = [{
    type_id: '/',
    type_name: '短视频'
},{
    type_id: '/film',
    type_name: 'av电影'
}];
const filterObj = {
    '/': [{'key': 'type', 'name': '类型', 'value': [{'n': '最新', 'v': ''},{'n': '推荐', 'v': 'short/recommend_home_list'},{'n': '美女正妹', 'v': 'short/label_related_list/Ug_pu_kskqY%3D'},{'n': '91大神', 'v': 'short/label_related_list/otDa4t6lDDQ%3D'},{'n': '国产高清', 'v': 'short/home_category_list/hd'},{'n': '排行', 'v': 'short/ranking_list'},{'n': '国产av', 'v': 'short/label_related_list/1Bd0Zzp8D_E%3D'},{'n': '门事件', 'v': 'short/label_related_list/3QW8lOdBcls%3D'},{'n': '大象传媒', 'v': 'short/label_related_list/F16wCJ3LmWY%3D'},{'n': '情趣综艺', 'v': 'short/label_related_list/-0S1LwkskU4%3D'}]}],
    '/film': [{'key': 'type', 'name': '类型', 'value': [{'n': '推荐', 'v': '/home_recommend_list'}, {'n': '专辑', 'v': '/home_subject_list'}, {'n': '女优', 'v': '/home_actor_list'}, {'n': '无码', 'v': '/home_category_list/coded'},{'n': '中文', 'v': '/home_category_list/chinese_subtitle'},{'n': '动漫', 'v': '/home_list/jOSxa-4E27U%3D'},{'n': '经典3级', 'v': '/home_list/uZg0vDL8P8A%3D'},{'n': '欧美性爱', 'v': '/home_list/LblejiEnM6s%3D'},{'n': 'av解说', 'v': '/home_list/vJq_GzRiesQ%3D'}]}],
}

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';


async function request(reqUrl) {
    let res = await req(reqUrl, {
        method: 'get',
        headers: {
            'User-Agent': MOBILE_UA,
            'Cookie': 'language=zh',
        }
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
    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function homeVod() {
    return '{}';
}

async function category(tid, pg, filter, ext) {
    if (pg <= 0) pg = 1;
    let type = filterObj[tid][0]['value'][0]['v'];
    if (ext['type']) type = ext['type'];
    let url = siteUrl + tid + type;
    const curKey = tid + type + pg;
    if (pg > 1 && nextPgKey == curKey){
        url = siteUrl + nextUrl;
    }
    const html = await request(url);
    const $ = load(html);
    let pgCount = pg;
    if (pg == 1 && html.indexOf('let url=') > 0) {
        pgCount = pg +1;
        nextPgKey = tid + type + (pg+1);
        nextUrl = html.split('let url="')[1].split('"')[0];
    } else if (pg > 1 && html.indexOf('script name="cc"') > 0) {
        pgCount = pg +1;
        nextPgKey = tid + type + (pg+1);
        nextUrl = $("script[name='cc']").text();
    }

    let videos = [];
    const js2Base = await js2Proxy(true, siteType, siteKey, 'img/', {});
    //女优
    if(type == '/home_actor_list') {
       videos = _.map($('a.actor_part'), (n) => {
            let id = $(n).attr('href');
            let name = $(n).attr('title');
            let pic = $(n).find('img').attr('data-cover');
            return {
                vod_id: id,
                vod_name: name,
                vod_pic: js2Base + base64Encode(pic),
                vod_remarks: ''
            };
       });
    } else {
        videos = _.map($('div.module-item-pic'), (n) => {
            let id = $(n).find('a').attr('href');
            let name = $(n).find('a').attr('title');
            let pic = $(n).find('img').attr('data-cover');
            return {
                vod_id: id,
                vod_name: name,
                vod_pic: js2Base + base64Encode(pic),
                vod_remarks: ''
            };
       });
    }
    return JSON.stringify({
        list: videos,
        page: pg,
        pagecount: pgCount,
    });
}

async function detail(id) {
    try {
        let video = {
            vod_id: id,
            vod_actor: 'Leospring',
            vod_play_from: 'Leospring',
            vod_director: 'Leospring',
            vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
        };
        if (id.includes('actor_detail')) {
            let playNameUrls = [];
            video.vod_play_url = (await getAVPlayList(id, playNameUrls)).join('#');
        } else {
            video.vod_play_url = '播放$' + id;
        }
        const list = [video];
        const result = { list };
        return JSON.stringify(result);
    } catch (e) {
        console.log(e);
    }
    return null;
}

async function play(flag, id, flags) {
    let playUrl = siteUrl + id;
    try {
        const html = await request(playUrl);
        if (html.indexOf('url=') > 0) {
            playUrl = html.split('url=')[1].split('"')[0];
            return JSON.stringify({
                parse: 0,
                url: playUrl,
                header: {
                    'Origin': 'https://ha.lilongfei.cn',
                    'Referer': 'https://ha.lilongfei.cn/',
                    'User-Agent': MOBILE_UA
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
    return JSON.stringify({
        parse: 1,
        url: playUrl,
    });
    
}

async function search(wd, quick, pg) {
    let url = siteUrl + '/search?wd=' + wd;
    const html = await request(url);
    const $ = load(html);
    const js2Base = await js2Proxy(true, siteType, siteKey, 'img/', {});
    let videos = _.map($('div.module-item-pic'), (n) => {
        let id = $(n).find('a').attr('href');
        let name = $(n).find('a').attr('title');
        let pic = $(n).find('img').attr('data-cover');
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: js2Base + base64Encode(pic),
            vod_remarks: ''
        };
   });
    return JSON.stringify({
        list: videos,
    });
}

async function getAVPlayList(id, playNameUrls) {
    let url = siteUrl + id;
    const html = await request(url);
    const $ = load(html);
    _.each($('div.module-item-pic > a'), (n) => {
        playNameUrls.push($(n).attr('title') + '$' + $(n).attr('href'));
    });
    //是否包含下一页
    let nextUrl = '';
    if(html.indexOf('let url="') > 0) {
        nextUrl = html.split('let url="')[1].split('"')[0];
    } else if (html.indexOf('script name="cc"') > 0) {
        nextUrl = $("script[name='cc']").text();
    }
    if (nextUrl.length > 0 && nextUrl.indexOf('cursor=0') == -1) {
        return await getAVPlayList(nextUrl, playNameUrls);
    } else {
        return playNameUrls;
    }

}

function picdecrypt(encryptStr) {
    let key = Crypto.enc.Utf8.parse('Jui7X#cdleN^3eZb');
    let decrypt = Crypto.AES.decrypt(encryptStr, key, {
        mode: Crypto.mode.ECB,
        padding: Crypto.pad.NoPadding
    });
    return Crypto.enc.Base64.stringify(decrypt).toString();
}

async function proxy(segments, headers) {
    let what = segments[0];
    let url = base64Decode(segments[1]);
    if (what == 'img') {
        var resp = await req(url, {
            buffer: 2,
            headers: {
                Referer: 'https://api.douban.com/',
                'User-Agent': MOBILE_UA,
            },
        });
        return JSON.stringify({
            code: resp.code,
            buffer: 2,
            content: picdecrypt(resp.content),
            headers: resp.headers,
        });
    }
    return JSON.stringify({
        code: 500,
        content: '',
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
        proxy: proxy,
    };
}

