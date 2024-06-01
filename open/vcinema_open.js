import { dayjs, jinja2, Uri, Crypto, load, _ } from './lib/cat.js';

let key = 'nangua';
let baseUrl = 'https://v.vcinema.cn';
let openUrl = 'https://open-web-api-v2.vcinema.cn/v5.0';
let device = {};
let timeOffset = 0;
let siteKey = '';
let siteType = 0;
let UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
let deviceId = 'af53fabb0-8ab109-4686';
let token = 'EM5sxXATrUTyC8Ac';
let verifyInfo = '';

async function request(reqUrl, post, param) {
    let method = post?'POST':'GET';
    let sj = new Date().getTime() + '';
    let signatureNonce = getSignatureNonce(sj);
    let uri = new Uri(reqUrl.split('?')[0]);

    uri.addQueryParam('action', uri.path());
    uri.addQueryParam('api_version', '5.1.9');
    uri.addQueryParam('app_version', '2.9.0');
    uri.addQueryParam('cid', deviceId);
    uri.addQueryParam('device_id', deviceId);
    uri.addQueryParam('format', 'JSON');
    uri.addQueryParam('platform_name', 'tv-pc');
    uri.addQueryParam('session_id', '0');
    uri.addQueryParam('signature_nonce', signatureNonce);
    
    uri.addQueryParam('timestamp', sj);
    uri.addQueryParam('user_id', '0');
    
    let keys = [];
    for (var i = 0; i < uri.queryPairs.length; i++) {
        keys.push(uri.queryPairs[i][0]);
    }
    keys = _.sortBy(keys, function (name) {
        return name;
    });
    let tkSrc = '';
    for (let k of keys) {
        let v = uri.getQueryParamValue(k);
        v = encodeURIComponent(v);
        tkSrc += k + '=' + v + '&';
    }
    tkSrc = tkSrc.substring(0, tkSrc.length-1);
    tkSrc = method + '&'+ encodeURIComponent('/')+'&' + encodeURIComponent(tkSrc);
    let signatureSecret = encodeURIComponent(stringify(Crypto.HmacSHA1(tkSrc, token+'&')));

    let header = {
        'Content-Type': 'application/json',
        'Origin': baseUrl,
        'Referer': baseUrl +'/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'Api_version': '5.1.9',
        'App_version': '2.9.0',
        'Channel': 'PC02',
        'Cid': deviceId,
        'Credentials': 'include',
        'Device_id': deviceId,
        'Device_info': 'macOS_Chrome(116.0.0.0)',
        'Format': 'JSON',
        'Platform': '6',
        'Platform_name': 'tv-pc',
        'Session_id': '0',
        'Signature_nonce': signatureNonce,
        'Signature_secret': signatureSecret,
        'Timestamp': sj,
        'User_id': '0',
        'Verify_info': verifyInfo 
    }

    reqUrl = openUrl+reqUrl;
    let res = await req(reqUrl, {
        headers: header,
        method: post?'post':'get',
        data: param,
    });
    //console.log('res', res);
    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    const html = (await req(baseUrl, {
        headers: {
       //     'Cookie': '_pmcid=2719017759-7dyuq5ln7ok0; __wpkreporterwid_=9c0b6a5e-d3b0-41eb-2279-48fcf11759ad; _bl_uid=ezldes63o0bvhplOOimRjg32Oya7; gdt_fp=6f375cf287f3888a5ce9558830bc6ed2; _pmssid=0; _pminfo=%7B%7D; acw_tc=2760823c17081379533906810ef59418c44ee1c7d39cd3876cb54593115f9c; _t=MFLBLBb9ZOycZnPU; _v=7779f66cf13ffcc1ed10ff02bb48fbbe; _onlad=1'
        }
    })).content
    const baseInfo = html.split('state:')[1].split(',serverRendered:')[0].split(',')
    token = baseInfo[0].split('"')[1];
    deviceId = baseInfo[3].split('"')[1];
    verifyInfo = baseInfo[1].split('"')[1];
    //console.log(token, deviceId, verifyInfo);
    const dt = new Date().getTime() + '';
    //console.log(getSignatureNonce(dt));
}

async function home(filter) {
    const classes = [{
        type_id: '电影',
        type_name: '电影'
    },{
        type_id: '电视剧',
        type_name: '电视剧'
    }];
    const filterObj = {
        '电影': [
            {
                'key': 'movie_types', 
                'name': '类型', 
                'value': [{'n': '全部类型', 'v': ''},{'n': '动作', 'v': '动作'},{'n': '战争', 'v': '战争'},{'n': '科幻', 'v': '科幻'},{'n': '冒险', 'v': '冒险'},{'n': '犯罪', 'v': '犯罪'},{'n': '灾难', 'v': '灾难'},{'n': '魔幻', 'v': '魔幻'},{'n': '悬疑', 'v': '悬疑'},{'n': '剧情', 'v': '剧情'},{'n': '恐怖', 'v': '恐怖'},{'n': '西部', 'v': '西部'},{'n': '喜剧', 'v': '喜剧'},{'n': '动画', 'v': '动画'},{'n': '奖项', 'v': '奖项'},{'n': '纪录片', 'v': '纪录片'}]
             },{
                'key': 'movie_country', 
                'name': '地区',
                'value': [{'n': '全部地区', 'v': ''},{'n': '中国', 'v': '中国'},{'n': '美国', 'v': '美国'},{'n': '英国', 'v': '英国'},{'n': '法国', 'v': '法国'},{'n': '亚洲', 'v': '亚洲'},{'n': '德国', 'v': '德国'},{'n': '加拿大', 'v': '加拿大'},{'n': '俄罗斯', 'v': '俄罗斯'},{'n': '意大利', 'v': '意大利'},{'n': '西班牙', 'v': '西班牙'},{'n': '澳大利亚', 'v': '澳大利亚'}]
            },{
                'key': 'movie_year', 
                'name': '年份',
                'value': [{'n': '全部年份', 'v': ''},{'n': '2024', 'v': '2024-2024'},{'n': '2023', 'v': '2023-2023'},{'n': '2022', 'v': '2022-2022'},{'n': '2021', 'v': '2021-2021'},{'n': '2020', 'v': '2020-2020'},{'n': '2019-2015', 'v': '2015-2019'},{'n': '2014-2010', 'v': '2010-2014'},{'n': '00年代', 'v': '2000-2009'},{'n': '90年代', 'v': '1990-1999'},{'n': '其他', 'v': '0-1989'}]
            }
        ],
        '电视剧': [
            {
                'key': 'movie_types', 
                'name': '类型', 
                'value': [{'n': '全部类型', 'v': ''},{'n': '动作', 'v': '动作'},{'n': '战争', 'v': '战争'},{'n': '科幻', 'v': '科幻'},{'n': '冒险', 'v': '冒险'},{'n': '犯罪', 'v': '犯罪'},{'n': '灾难', 'v': '灾难'},{'n': '魔幻', 'v': '魔幻'},{'n': '悬疑', 'v': '悬疑'},{'n': '剧情', 'v': '剧情'},{'n': '恐怖', 'v': '恐怖'},{'n': '西部', 'v': '西部'},{'n': '喜剧', 'v': '喜剧'},{'n': '动画', 'v': '动画'},{'n': '奖项', 'v': '奖项'},{'n': '纪录片', 'v': '纪录片'}]
             },{
                'key': 'movie_country', 
                'name': '地区',
                'value': [{'n': '全部地区', 'v': ''},{'n': '中国', 'v': '中国'},{'n': '美国', 'v': '美国'},{'n': '英国', 'v': '英国'},{'n': '法国', 'v': '法国'},{'n': '亚洲', 'v': '亚洲'},{'n': '德国', 'v': '德国'},{'n': '加拿大', 'v': '加拿大'},{'n': '俄罗斯', 'v': '俄罗斯'},{'n': '意大利', 'v': '意大利'},{'n': '西班牙', 'v': '西班牙'},{'n': '澳大利亚', 'v': '澳大利亚'}]
            },{
                'key': 'movie_year', 
                'name': '年份',
                'value': [{'n': '全部年份', 'v': ''},{'n': '2024', 'v': '2024-2024'},{'n': '2023', 'v': '2023-2023'},{'n': '2022', 'v': '2022-2022'},{'n': '2021', 'v': '2021-2021'},{'n': '2020', 'v': '2020-2020'},{'n': '2019-2015', 'v': '2015-2019'},{'n': '2014-2010', 'v': '2010-2014'},{'n': '00年代', 'v': '2000-2009'},{'n': '90年代', 'v': '1990-1999'},{'n': '其他', 'v': '0-1989'}]
            }
        ],
    }
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
    let data = JSON.parse(await request(`/search/hot`)).content;
    let videos = [];
    for (const vod of data) {
        videos.push({
            vod_id: vod.movie_id,
            vod_name: vod.movie_name,
            vod_pic: vod.movie_image_url.replace('<width>','360').replace('<height>','360'),
            vod_remarks: vod.movie_score,
        });
    }
    return JSON.stringify({
        list: videos,
        limit: 20,
    });
}

async function category(tid, pg, filter, extend) {
    try {
        if (!pg) pg = 1;
        if (pg <= 0) pg = 1;
        let data = JSON.parse(await request('/search/get_search_result_v3', true, {
            'search_key': '',
            'page_size': 20,
            'page_num': pg-1,
            'film_television': tid,
            'movie_country': extend['movie_country'] || '',
            'movie_types':  extend['movie_types'] || '',
            'movie_year':  extend['movie_year'] || '',
        })).content;
        let videos = [];
        for (const vod of data.data) {
            videos.push({
                vod_id: vod.movie_id,
                vod_name: vod.movie_name,
                vod_pic: vod.movie_image_url.replace('<width>','360').replace('<height>','360'),
                vod_remarks: vod.movie_score,
            });
        }
        return JSON.stringify({
            list: videos,
            page: pg,
            limit: 20,
        });
    } catch(err) {
        console.log(err);
    }
}

async function detail(id) {
    let data = JSON.parse(await request(`/movie/get_movie_season_list/${id}`)).content;
    //console.log('data', data)
    let vod = {
        vod_id: data.movie_id,
        vod_name: data.movie_name,
        vod_year: data.movie_year,
        vod_area: data.movie_country,
        vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
    };
    let playlist = {
        '标清': [],
        '高清': [],
        '超清': [],
    };
    if(data.movie_season_list.length == 0) {
        let name = 'Leospring';
        playlist['标清'].push(name + '$' + id+'_SD');
        playlist['高清'].push(name + '$' + id+'_HD');
        playlist['超清'].push(name + '$' + id+'_FHD');
    } else {
        for (const item of data.movie_season_list[0].movie_series_list) {
            let name = item.movie_number;
            let vodId = item.movie_id;
            playlist['标清'].push(name + '$' + vodId+'_SD');
            playlist['高清'].push(name + '$' + vodId+'_HD');
            playlist['超清'].push(name + '$' + vodId+'_FHD');
        }
    }

    vod.vod_play_from = _.keys(playlist).join('$$$');
    let urls = _.values(playlist);
    let vod_play_url = [];
    for (const urlist of urls) {
        vod_play_url.push(urlist.join('#'));
    }
    vod.vod_play_url = vod_play_url.join('$$$');
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    let voId = id.split('_')[0];
    let type = id.split('_')[1];
    let data = JSON.parse(await request('/media/get_play_movie_urls_v3', true, {
        'movie_id': voId,
        'resolution': type,
        'user_id': 0
    })).content;
    let playUrl = data.movie_url_list[0].media_url;
    for (const item of data.movie_url_list) {
        if(type === item.media_resolution) {
            playUrl = item.media_url;
            break;
        }
    }
    return JSON.stringify({
        parse: 0,
        url: playUrl,
        header: {
            'Referer': 'https://v.vcinema.cn/',
            'Range': 'bytes=0-',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        }
    });
}

async function search(wd, quick, pg) {
    try {
        if (!pg) pg = 1;
        if (pg <= 0) pg = 1;
        let data = JSON.parse(await request('/search/get_search_result_v3', true, {
            'search_key': wd,
            'page_size': 20,
            'page_num': 0,
            'film_television': '',
            'movie_country': '',
            'movie_types': '',
            'movie_year': '',
        })).content;
        //console.log('searchData', data);
        let videos = [];
        for (const vod of data.data) {
            videos.push({
                vod_id: vod.movie_id,
                vod_name: vod.movie_name,
                vod_pic: vod.movie_image_url.replace('<width>','360').replace('<height>','360'),
                vod_remarks: vod.movie_score,
            });
        }
        return JSON.stringify({
            list: videos,
            page: pg,
            limit: 20,
        });
    } catch(err) {
        console.log(err);
    }
}

//时间签名
function getSignatureNonce(dt) {
    const d = Crypto.enc.Utf8.parse("QWRYI96347mnbvcx")
    , f = Crypto.enc.Utf8.parse("85201ACDEFHjklpx")
    , h = Crypto.enc.Utf8.parse("7a25f9132ec6a8b34")
    , m = Crypto.enc.Utf8.parse("73e54154a15d1beeb509d9e12f1e462a0")
    , e = Math.ceil(65536 * Math.random()) + dt;
    var t = Crypto.enc.Utf8.parse(e);
    return Crypto.AES.encrypt(t, d, {
        iv: f,
        salt: h,
        ciphertext: m,
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    }).ciphertext.toString();
}

let cst = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function stringify(e) {
    for (var t = e.words, n = e.sigBytes, r = cst, i = (e.clamp(),
    []), o = 0; o < n; o += 3)
        for (var a = (t[o >>> 2] >>> 24 - o % 4 * 8 & 255) << 16 | (t[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255) << 8 | t[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, s = 0; s < 4 && o + .75 * s < n; s++)
            i.push(r.charAt(a >>> 6 * (3 - s) & 63));
    var c = r.charAt(64);
    if (c)
        for (; i.length % 4; )
            i.push(c);
    return i.join("")
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
