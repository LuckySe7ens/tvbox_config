import { Crypto, load, _ } from './lib/cat.js';

//let siteUrl = 'https://m.xiangdao.me';
let siteUrl ='https://v.nmvod.cn/api.php';
let siteKey = '';
let siteType = 0;
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';
let headers = {
    'User-Agent': MOBILE_UA,
    'Referer': siteUrl + '/'
};

let jxUrl = ['https://api.cnmcom.com/webcloud/nmsvip.php?url=','https://api.cnmcom.com/webcloud/nmsssvip.php?vid=', 'https://api.cnmcom.com/webcloud/nmssvip.php?url=', 'https://api.cnmcom.com/webcloud/m3u8.php?url='];
async function request(reqUrl, postData) {

    let res = await req(reqUrl, {
        method: 'post',
        headers: headers,
        data: postData || {},
        postType: 'form',
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
    let classes = [{
        type_id: '3778678',
        type_name: '热歌榜',
    },{
        type_id: '19723756',
        type_name: '飙升榜',
    },{
        type_id: '3779629',
        type_name: '新歌榜',
    },{
        type_id: '2884035',
        type_name: '原创歌曲榜',
    },{
        type_id: '5213356842',
        type_name: '新说唱热歌榜',
    },{
        type_id: '991319590',
        type_name: '说唱榜',
    },{
        type_id: '2250011882',
        type_name: '抖音排行榜',
    },{
        type_id: '745956260',
        type_name: '韩语榜',
    },{
        type_id: '2809513713',
        type_name: '欧美热歌榜',
    },{
        type_id: '2809577409',
        type_name: '欧美新歌榜',
    },{
        type_id: '5059644681',
        type_name: '日语榜',
    },{
        type_id: '3112516681',
        type_name: '中国新乡村音乐排行榜',
    }];
    return JSON.stringify({
        class: classes,
    });
}

async function homeVod() {
}

async function category(tid, pg, filter, ext) {
    let playList = JSON.parse(await request(siteUrl, {
        'types': 'playlist',
        'id': tid,
    })).playlist;  
    let videos = _.map(playList.tracks, n => {
        return {
            vod_id: n.id,
            vod_name: n.name,
            vod_pic: n.al.picUrl,
            vod_remarks: n.ar[0].name
        }
    });
    return JSON.stringify({
        list: videos,
        page: pg,
        total: videos.length
    });
}

async function detail(id) {
    try {
        let playUrl = JSON.parse(await request(siteUrl, {
            'types': 'url',
            'id': id,
            'source': 'netease',
        })).url;  
        
        const video = {
            vod_play_from: 'Leospring',
            vod_play_url: playUrl,
            vod_content: '该作品由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
        };
        const list = [video];
        const result = { list };
        return JSON.stringify(result);
    } catch (e) {
    console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let playList = JSON.parse(await request(siteUrl, {
        'types': 'search',
        'name': wd,
        'source':'netease',
        'count': '20',
        'pages': pg
    }));
    const js2Base = await js2Proxy(true, siteType, siteKey, 'img/', {});  
    let videos = _.map(playList, n => {
        return {
            vod_id: n.id,
            vod_name: n.name,
            vod_pic: js2Base + base64Encode(n.pic_id),
            vod_remarks: ''
        }
    });
    return JSON.stringify({
        list: videos,
        page: pg,
        total: videos.length
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
    });
}

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function proxy(segments, headers) {
    let what = segments[0];
    let url = base64Decode(segments[1]);
    if (what == 'img') {
        let picUrl = JSON.parse(await request(siteUrl, {
            'types': 'pic',
            'id': url,
            'source': 'netease',
        })).url

        var resp = await req(picUrl, {
            buffer: 2,
            headers: {
                Referer: 'https://api.douban.com/',
                'User-Agent': MOBILE_UA,
            },
        });
        return JSON.stringify({
            code: resp.code,
            buffer: 2,
            content: resp.content,
            headers: resp.headers,
        });
    }
    return JSON.stringify({
        code: 500,
        content: '',
    });
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        proxy: proxy,
        search: search,
    };
}