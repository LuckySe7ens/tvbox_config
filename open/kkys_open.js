import { Crypto, dayjs, jinja2, _ } from './lib/cat.js';

let key = 'kkys';
let url = 'https://api1.baibaipei.com:8899';
let device = {};
let siteKey = '';
let siteType = 0;

async function request(reqUrl, postData, agentSp, get) {
    let ts = dayjs().valueOf().toString();
    let rand = randStr(32);
    let sign = Crypto.enc.Hex.stringify(Crypto.MD5(reqUrl.replace(url, '') + '?_graphrange(u4%0Xpf52_' + ts + '_' + rand + '!3%would7ZRj16Hilanguagesnake$)personalGjO$CzA3ld9many6lQ(613^FGsituationsouth$hv@mwelcomesuggest*merely'))
        .toString()
        .toLowerCase();
    let headers = {
        'User-Agent': agentSp || device.ua,
    };
    if (reqUrl.includes('baibaipei')) {
        headers['device-id'] = device.id;
        headers['push-token'] = '';
        headers['sign'] = sign;
        headers['time'] = ts;
        headers['md5'] = rand;
        headers['version'] = '2.1.7';
        headers['system-model'] = device.model;
        headers['system-brand'] = device.brand;
        headers['system-version'] = device.release;
    }
    if (!get) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
    });
    console.log('reqUrl', reqUrl);
    console.log('headers', headers);
    console.log('postData', postData);
    let content = res.content;
    console.log('res.content', content);
     
    if (typeof content === 'string') {
        var key = Crypto.enc.Utf8.parse('NL/Ydygzmwcgl,JM');
        var iv = Crypto.enc.Utf8.parse('az5)0f,%D7HAIBGM');
        var src = Crypto.enc.Base64.parse(content);
        let dst = Crypto.AES.decrypt({ ciphertext: src }, key, { iv: iv, padding: Crypto.pad.Pkcs7 });
        dst = Crypto.enc.Utf8.stringify(dst);
        console.log('decrypt result',dst);
        return dst;
    }
    
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    device = randDevice();
    device.id = randStr(33).toLowerCase();
    device.ua = 'okhttp/3.14.9';
}

async function home(filter) {
    // await req('https://www.facebook.com', {});
    let data = JSON.parse(await request(url + '/api.php/Index/getTopVideoCategory', null, null, true)).data;
    let classes = [];
    let filterObj = {};
    for (const type of data) {
        let typeName = type.nav_name;
        if (typeName == '推荐') continue;
        let typeId = type.nav_type_id.toString();
        classes.push({
            type_id: typeId,
            type_name: typeName,
        });
        if (!filter) continue;
        try {
            let filterAll = [];
            let filterData = JSON.parse(await request(url + '/api.php/Video/getFilterType', { type: typeId })).data;
            for (let key of Object.keys(filterData)) {
                let itemValues = filterData[key];
                if (key === 'plot') key = 'class';
                let typeExtendName = '';
                switch (key) {
                    case 'class':
                        typeExtendName = '类型';
                        break;
                    case 'area':
                        typeExtendName = '地区';
                        break;
                    case 'lang':
                        typeExtendName = '语言';
                        break;
                    case 'year':
                        typeExtendName = '年代';
                        break;
                    case 'sort':
                        typeExtendName = '排序';
                        break;
                }
                if (typeExtendName.length === 0) continue;
                let newTypeExtend = {
                    key: key,
                    name: typeExtendName,
                };
                let newTypeExtendKV = [];
                for (let j = 0; j < itemValues.length; j++) {
                    const name = itemValues[j];
                    let value = key === 'sort' ? j + '' : name === '全部' ? '0' : name;
                    newTypeExtendKV.push({ n: name, v: value });
                }
                newTypeExtend['init'] = key === 'sort' ? '1' : newTypeExtendKV[0]['v'];
                newTypeExtend.value = newTypeExtendKV;
                filterAll.push(newTypeExtend);
            }
            if (!_.isEmpty(filterAll)) {
                filterObj[typeId] = filterAll;
            }
        } catch (e) {
            console.log(e);
        }
    }
    // console.log(await homeVod());
    // console.log(classes);
    // console.log(filterObj);
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
    let jsonArray = JSON.parse(await request(url + '/api.php/Index/getHomePage', { type: 1, p: 1 })).data.video;
    let videos = [];
    for (const item of jsonArray) {
        if (item.title.styleType !== 0) continue;
        for (const vObj of item.list) {
            videos.push({
                vod_id: vObj.vod_id,
                vod_name: vObj.vod_name,
                vod_pic: vObj.vod_pic,
                vod_remarks: vObj.vod_remarks || vObj.vod_score || '',
            });
        }
    }
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, extend) {
    if (pg == 0) pg = 1;
    let reqUrl = url + '/api.php/Video/getFilterVideoList';
    var formData = JSON.parse(
        jinja2(
            `{
        "type": "{{tid}}",
        "p": "{{pg}}",
        "area": "{{ext.area|default(0)}}",
        "year": "{{ext.year|default(0)}}",
        "sort": "{{ext.sort|default(0)}}",
        "class": "{{ext.class|default(0)}}"
    }`,
            { ext: extend, tid: tid, pg: pg }
        )
    );
    console.log(formData);
    var params = {
        type: 2,
        sort: 0,
        area: 0,
        class: 0,
        year: 0,
        p: 1,
    }
    let data = JSON.parse(await request(reqUrl, params)).data;
    let videos = [];
    for (const vod of data.data) {
        videos.push({
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            vod_remarks: vod.vod_remarks || vod.vod_score || '',
        });
    }
    return JSON.stringify({
        page: parseInt(data.current_page),
        pagecount: parseInt(data.last_page),
        limit: parseInt(data.per_page),
        total: parseInt(data.total),
        list: videos,
    });
}

async function detail(id) {
    let data = JSON.parse(await request(url + '/api.php/Video/getVideoInfo', { video_id: id })).data.video;
    const videos = [];
    let vod = {
        vod_id: data.vod_id,
        vod_name: data.vod_name,
        vod_pic: data.vod_pic,
        type_name: data.vod_class,
        vod_year: data.vod_year,
        vod_area: data.vod_area,
        vod_remarks: data.vod_remarks || '',
        vod_actor: data.vod_actor,
        vod_director: data.vod_director,
        vod_content: data.vod_content.trim(),
    };
    let playlist = {};
    for (const item of data.vod_play) {
        let from = item.playerForm;
        if (from === 'jp') continue;
        if (from === 'xg') continue;
        let urls = [];
        for (const u of item.url) {
            urls.push(formatPlayUrl(vod.vod_name, u.title) + '$' + u.play_url);
        }
        if (!playlist.hasOwnProperty(from) && urls.length > 0) {
            playlist[from] = urls;
        }
    }
    parse = data.parse || [];
    vod.vod_play_from = Object.keys(playlist).join('$$$');
    let urls = Object.values(playlist);
    let vod_play_url = [];
    for (const urlist of urls) {
        vod_play_url.push(urlist.join('#'));
    }
    vod.vod_play_url = vod_play_url.join('$$$');
    videos.push(vod);
    return JSON.stringify({
        list: videos,
    });
}

var parse = ['http://119.91.123.253:2345/Api/yun.php?url=', 'http://122.228.84.103:7777/api/?key=qhBtN1ciPmdvPV83tX&url=', 'http://pan.qiaoji8.com/tvbox/neibu.php?url='];

async function play(flag, id, flags) {
    try {
        if (id.indexOf('youku') >= 0 || id.indexOf('iqiyi') >= 0 || id.indexOf('v.qq.com') >= 0 || id.indexOf('pptv') >= 0 || id.indexOf('le.com') >= 0 || id.indexOf('1905.com') >= 0 || id.indexOf('mgtv') >= 0) {
            if (parse.length > 0) {
                for (let index = 0; index < parse.length; index++) {
                    try {
                        const p = parse[index];
                        let res = await req(p + id, {
                            headers: { 'user-agent': 'okhttp/3.14.9' },
                        });
                        var result = jsonParse(id, JSON.parse(res.content));
                        if (result.url) {
                            result.parse = 0;
                            return JSON.stringify(result);
                        }
                    } catch (error) {}
                }
            }
        }
        if (id.indexOf('jqq-') >= 0) {
            var jqqHeader = await request(url + '/jqqheader.json', null, null, true);
            var jqqHeaders = JSON.parse(jqqHeader);
            var ids = id.split('-');
            var jxJqq = await req('https://api.juquanquanapp.com/app/drama/detail?dramaId=' + ids[1] + '&episodeSid=' + ids[2] + '&quality=LD', { headers: jqqHeaders });
            var jqqInfo = JSON.parse(jxJqq.content);
            if (jqqInfo.data.playInfo.url) {
                return JSON.stringify({
                    parse: 0,
                    playUrl: '',
                    url: jqqInfo.data.playInfo.url,
                });
            }
        }
        let res = await request(url + '/video.php', { url: id });
        var result = jsonParse(id, JSON.parse(res).data);
        if (result.url) {
            result.parse = 0;
            // demo of block hls ads
            if (/vip\.lz|hd\.lz/.test(result.url)) {
                result.url = await js2Proxy(true, siteType, siteKey, 'lzm3u8/' + base64Encode(result.url), {});
            }
            return JSON.stringify(result);
        }
        return JSON.stringify({
            parse: 0,
            playUrl: '',
            url: id,
        });
    } catch (e) {
        console.log(e);
        return JSON.stringify({
            parse: 0,
            url: id,
        });
    }
}

async function proxy(segments, headers) {
    let what = segments[0];
    let url = base64Decode(segments[1]);
    if (what == 'lzm3u8') {
        const resp = await req(url, {});
        let hls = resp.content;
        const jsBase = await js2Proxy(false, siteType, siteKey, 'lzm3u8/', {});
        const baseUrl = url.substr(0, url.lastIndexOf('/') + 1);
        console.log(hls.length);
        hls = hls.replace(/#EXT-X-DISCONTINUITY\r*\n*#EXTINF:6.433333,[\s\S]*?#EXT-X-DISCONTINUITY/, '');
        console.log(hls.length);
        hls = hls.replace(/(#EXT-X-KEY\S+URI=")(\S+)("\S+)/g, function (match, p1, p2, p3) {
            let up = (!p2.startsWith('http') ? baseUrl : '') + p2;
            return p1 + up + p3;
        });
        hls = hls.replace(/(#EXT-X-STREAM-INF:.*\n)(.*)/g, function (match, p1, p2) {
            let up = (!p2.startsWith('http') ? baseUrl : '') + p2;
            return p1 + jsBase + base64Encode(up);
        });
        hls = hls.replace(/(#EXTINF:.*\n)(.*)/g, function (match, p1, p2) {
            let up = (!p2.startsWith('http') ? baseUrl : '') + p2;
            return p1 + up;
        });
        return JSON.stringify({
            code: resp.code,
            content: hls,
            headers: resp.headers,
        });
    }
    return JSON.stringify({
        code: 500,
        content: '',
    });
}

async function search(wd, quick) {
    let data = JSON.parse(await request(url + '/api.php/Search/getSearch', { key: wd, type_id: 0, p: 1 })).data;
    let videos = [];
    for (const vod of data.data) {
        videos.push({
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            vod_remarks: vod.vod_remarks || vod.vod_score || '',
        });
    }
    return JSON.stringify({
        list: videos,
    });
}

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

const charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
function randStr(len, withNum) {
    var _str = '';
    let containsNum = withNum === undefined ? true : withNum;
    for (var i = 0; i < len; i++) {
        let idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx];
    }
    return _str;
}

function randDevice() {
    return {
        brand: 'Huawei',
        model: 'HUAWEI Mate 20',
        release: '10',
        buildId: randStr(3, false).toUpperCase() + _.random(11, 99) + randStr(1, false).toUpperCase(),
    };
}

function formatPlayUrl(src, name) {
    return name
        .trim()
        .replaceAll(src, '')
        .replace(/<|>|《|》/g, '')
        .replace(/\$|#/g, ' ')
        .trim();
}

function jsonParse(input, json) {
    try {
        let url = json.url ?? '';
        if (url.startsWith('//')) {
            url = 'https:' + url;
        }
        if (!url.startsWith('http')) {
            return {};
        }
        let headers = json['headers'] || {};
        let ua = (json['user-agent'] || '').trim();
        if (ua.length > 0) {
            headers['User-Agent'] = ua;
        }
        let referer = (json['referer'] || '').trim();
        if (referer.length > 0) {
            headers['Referer'] = referer;
        }
        _.keys(headers).forEach((hk) => {
            if (!headers[hk]) delete headers[hk];
        });
        return {
            header: headers,
            url: url,
        };
    } catch (error) {
        console.log(error);
    }
    return {};
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
