import req from '../../util/req.js';
import pkg from 'lodash';
const { _ } = pkg;
import CryptoJS from 'crypto-js';

let host = 'http://op.ysdqjs.cn';
let parseMap = {};
let cookie = '';

const UA = 'okhttp-okgo/jeasonlzy';

async function request(reqUrl, method, data) {
    const headers = {
        'User-Agent': UA,
    };
    if (!_.isEmpty(cookie)) {
        headers['Cookie'] = cookie;
    }
    const postType = method === 'post' ? 'form-data' : '';
    let res = await req(reqUrl, {
        method: method || 'get',
        headers: headers,
        data: data,
        postType: postType,
    });
    if (res.code == 403) {
        const path = res.data.match(/window\.location\.href ="(.*?)"/)[1];
        const setCookie = _.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'].join(';') : res.headers['set-cookie'];
        cookie = setCookie;
        headers['Cookie'] = cookie;
        res = await req(host + path, {
            method: method || 'get',
            headers: headers,
            data: data,
            postType: postType,
        });
    }
    return res.data;
}

// cfg = {skey: siteKey, ext: extend}
async function init(inReq, _outResp) {
    return{}
}

async function home(filter) {
    const json = await postData(host + '/v2/type/top_type');
    const classes = _.map(json.data.list, (item) => {
        return {
            type_id: item.type_id,
            type_name: item.type_name,
        };
    });
    const filterConfig = {};
    // const sort = {'key':'order','name':'排序','value':[{'n':'时间','v':'time'},{'n':'人气','v':'hits'},{'n':'评分','v':'score'}]};
    _.each(json.data.list, (item) => {
        const extend = convertTypeData(item, 'extend', '剧情');
        const area = convertTypeData(item, 'area', '地区');
        const lang = convertTypeData(item, 'lang', '语言');
        const year = convertTypeData(item, 'year', '年份');
        const filterArray = [extend, area, lang, year].filter((type) => type !== null);
        filterConfig[item.type_id] = filterArray;
    });
    return {
        class: classes,
        filters: filterConfig,
    };
}


async function postData(url, data) {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const key = 'kj5649ertj84ks89r4jh8s45hf84hjfds04k';
    const sign = CryptoJS.MD5(key + timestamp).toString();
    let defaultData = {
        sign: sign,
        timestamp: timestamp,
    };
    const reqData = data ? _.merge(defaultData, data) : defaultData;
    const resp = await request(url, 'post', reqData);
    return resp;
}

function convertTypeData(typeData, key, name) {
    if (!typeData || !typeData[key] || typeData[key].length <= 2) {
        return null;
    }
    const typeClass = {
        key: key == 'extend' ? 'class' : key,
        name: name,
        init: '',
        value: _.map(typeData[key], (item) => {
            return {
                n: item,
                v: item == '全部' ? '' : item,
            };
        }),
    };
    return typeClass;
}



async function category(inReq, _outResp) {
    const tid = inReq.body.id;
    let pg = inReq.body.page;
    const extend = inReq.body.filters;
    const limit = 12;
    const param = generateParam(tid, pg, extend, limit);
    const json = await postData(host + '/v2/home/type_search', param);
    const jsonArray = json.data.list;
    const videos = _.map(jsonArray, (vObj) => {
        return {
            vod_id: vObj.vod_id,
            vod_name: vObj.vod_name,
            vod_pic: vObj.vod_pic || vObj.vod_pic_thumb,
            vod_remarks: vObj.vod_remarks,
        };
    });
    const page = parseInt(pg);
    let pageCount = page;
    if (jsonArray.length == limit) {
        pageCount = page + 1;
    }
    return {
        page: page,
        pagecount: pageCount,
        limit: limit,
        total: pageCount,
        list: videos,
    };
}

function generateParam(tid, pg, extend, limit) {
    const param = {
        type_id: tid,
        page: pg,
        limit: limit,
    };
    if (extend.class) {
        param.class = extend.class;
    }
    if (extend.area) {
        param.area = extend.area;
    }
    if (extend.lang) {
        param.lang = extend.lang;
    }
    if (extend.year) {
        param.year = extend.year;
    }
    // if (extend.order) {
    //     param.order = extend.order;
    // }
    return param;
}

async function detail(inReq, _outResp) {
    const id = inReq.body.id;
    const param = {
        vod_id: id,
    };
    const json = await postData(host + '/v2/home/vod_details', param);
    const vObj = json.data;
    console.log("detail", json);
    const vodAtom = {
        vod_id: id,
        vod_name: vObj.vod_name,
        vod_pic: vObj.vod_pic || vObj.vod_pic_thumb,
        vod_year: vObj.vod_year,
        vod_area: vObj.vod_area,
        vod_lang: vObj.vod_lang,
        vod_remarks: vObj.vod_remarks,
        vod_actor: vObj.vod_actor,
        vod_director: vObj.vod_director,
        vod_content: formatContent(vObj.vod_content),
    }
    const playInfo = vObj.vod_play_list;
    const playVod = {};
    _.each(playInfo, (obj) => {
        const sourceName = obj.name;
        let playList = '';
        const videoInfo = obj.urls;
        const parse = obj.parse_urls;
        if (!_.isEmpty(parse)) parseMap[sourceName] = parse;
        const vodItems = _.map(videoInfo, (epObj) => {
            const epName = epObj.name;
            const playUrl = epObj.url;
            return epName + '$' + playUrl;
        });
        if (_.isEmpty(vodItems)) return;
        playList = vodItems.join('#');
        playVod[sourceName] = playList;
    });
    vodAtom.vod_play_from = _.keys(playVod).join('$$$');
    vodAtom.vod_play_url = _.values(playVod).join('$$$');
    return {
        list: [vodAtom],
    };
}

function formatContent(content) {
    return content.replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '\"')
        .replaceAll(/<\/?[^>]+>/g, '');
}

async function play(inReq, _outResp) {
    const id = inReq.body.id;
    const flag = inReq.body.flag;
    let playUrl = id;
    const parsers = parseMap[flag];
    if (!_.isEmpty(parsers)) {
        for (const parser of parsers) {
            if (_.isEmpty(parser)) continue;
            try {
                const resp = await request(parser + playUrl);
                const json = JSON.parse(resp);
                if (!_.isEmpty(json.url)) {
                    playUrl = json.url;
                    break;
                }
            } catch(e) {
            }
        }
    }
    return {
        parse: 0,
        url: playUrl,
    };
}

async function search(inReq, _outResp) {
    const wd = inReq.body.wd;
    let pg = inReq.body.page;
    const limit = 12;
    const param = {
        keyword: wd,
        page: pg,
        limit: limit,
    };
    const json = await postData(host + '/v2/home/search', param);
    const jsonArray = json.data.list;
    const videos = _.map(jsonArray, (vObj) => {
        return {
            vod_id: vObj.vod_id,
            vod_name: vObj.vod_name,
            vod_pic: vObj.vod_pic || vObj.vod_pic_thumb,
            vod_remarks: vObj.vod_remarks,
        };
    });
    const page = parseInt(pg);
    let pageCount = page;
    if (jsonArray.length == limit) {
        pageCount = page + 1;
    }
    return {
        page: page,
        pagecount: pageCount,
        limit: limit,
        total: pageCount,
        list: videos,
    };
}

async function test(inReq, outResp) {
    try {
        const printErr = function (json) {
            if (json.statusCode && json.statusCode == 500) {
                console.error(json);
            }
        };
        const prefix = inReq.server.prefix;
        const dataResult = {};
        let resp = await inReq.server.inject().post(`${prefix}/init`);
        dataResult.init = resp.json();
        printErr(resp.json());
        resp = await inReq.server.inject().post(`${prefix}/home`);
        dataResult.home = resp.json();
        printErr("" + resp.json());
        if (dataResult.home.class.length > 0) {
            resp = await inReq.server.inject().post(`${prefix}/category`).payload({
                id: dataResult.home.class[0].type_id,
                page: 1,
                filter: true,
                filters: {},
            });
            dataResult.category = resp.json();
            printErr(resp.json());
            if (dataResult.category.list && dataResult.category.list.length > 0) {
                resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
                    // id: dataResult.category.list[0].vod_id, // dataResult.category.list.map((v) => v.vod_id),
                    id: 53544
                });
                dataResult.detail = resp.json();
                printErr(resp.json());
                if (dataResult.detail.list && dataResult.detail.list.length > 0) {
                    dataResult.play = [];
                    for (const vod of dataResult.detail.list) {
                        const flags = vod.vod_play_from.split('$$$');
                        const ids = vod.vod_play_url.split('$$$');
                        for (let j = 0; j < flags.length; j++) {
                            const flag = flags[j];
                            const urls = ids[j].split('#');
                            for (let i = 0; i < urls.length && i < 2; i++) {
                                resp = await inReq.server
                                    .inject()
                                    .post(`${prefix}/play`)
                                    .payload({
                                        flag: flag,
                                        id: urls[i].split('$')[1],
                                    });
                                dataResult.play.push(resp.json());
                            }
                        }
                    }
                }
            }
        }
        resp = await inReq.server.inject().post(`${prefix}/search`).payload({
            wd: '暴走',
            page: 1,
        });
        dataResult.search = resp.json();
        printErr(resp.json());
        return dataResult;
    } catch (err) {
        console.error(err);
        outResp.code(500);
        return { err: err.message, tip: 'check debug console output' };
    }
}


export default {
    meta: {
        key: 'ttian',
        name: '天天影视',
        type: 3,
    },
   api: async (fastify) => {
        fastify.post('/init', init);
        fastify.post('/home', home);
        fastify.post('/category', category);
        fastify.post('/detail', detail);
        fastify.post('/play', play);
        fastify.post('/search', search);
        fastify.get('/test', test);
    },
};