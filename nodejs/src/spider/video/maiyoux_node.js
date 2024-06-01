import * as HLS from 'hls-parser';
import req from '../../util/req.js';

let url = 'http://api.maiyoux.com:81/mf/';
let cateList = {};

async function request(reqUrl) {
    let res = await req(reqUrl, {
        method: 'get',
    });
    return res.data;
}

async function init(inReq, _outResp) {
    cateList = await request(url + 'json.txt');
    return cateList;
}

async function home(_inReq, _outResp) {
    let classes = [];
    Object.keys(cateList).forEach(function(key) {
        classes.push({
            type_id: key,
            type_name: key,
        });
    });
    return {
        class: classes,
       // filters: filterObj
    };
}

async function category(inReq, _outResp) {
    const tid = inReq.body.id;
    const pg = inReq.body.page;
    let page = pg || 1;
    if (page == 0) page = 1;
    
    let videos = [];
    for (const item of cateList[tid]) {
        videos.push({
            vod_id: item['address'],
            vod_name: item['title'],
            vod_pic: item['xinimg'],
            vod_remarks: item['Number']
        });
    }
    return {
        list: videos,
        page: pg,
        pagecount: 1,
        total: videos.length
    };
}

async function detail(inReq, _outResp) {
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const res = await request(url + ids[0]);
    const video = {
        vod_play_from: 'Leospring',
        vod_content: '作者：Leospring 公众号：蚂蚁科技杂谈',
    };
    let playNameUrls = [];
    for (const item of res['zhubo']) {
        playNameUrls.push(item.title + '$' + item.address);
    }
    video.vod_play_url = playNameUrls.join('#');
    return {
        list: [video],
    };
}

async function play(inReq, _outResp) {
    const id = inReq.body.id;
    return {
        parse: 0,
        url: id,
    };
}

async function search(inReq, _outResp) {
   return {};
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
        printErr(resp.json());
        if (dataResult.home.class.length > 0) {
            resp = await inReq.server.inject().post(`${prefix}/category`).payload({
                id: dataResult.home.class[0].type_id,
                page: 1,
                filter: true,
                filters: {},
            });
            dataResult.category = resp.json();
            printErr(resp.json());
            if (dataResult.category.list.length > 0) {
                resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
                    id: dataResult.category.list[0].vod_id, // dataResult.category.list.map((v) => v.vod_id),
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
            wd: '爱',
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
        key: 'maiyoux',
        name: 'maiyoux',
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
