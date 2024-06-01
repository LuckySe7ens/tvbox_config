import req from '../../util/req.js';
import { randStr } from '../../util/misc.js';
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';

let domain = 'https://frodo.douban.com';
let device = {};

function sig(link) {
    link += `&udid=${device.id}&uuid=${device.id}&&rom=android&apikey=0dad551ec0f84ed02907ff5c42e8ec70&s=rexxar_new&channel=Yingyongbao_Market&timezone=Asia/Shanghai&device_id=${device.id}&os_rom=android&apple=c52fbb99b908be4d026954cc4374f16d&mooncake=0f607264fc6318a92b9e13c65db7cd3c&sugar=0`;
    const u = new URL(link);
    const ts = dayjs().unix().toString();
    let sha1 = CryptoJS.HmacSHA1('GET&' + encodeURIComponent(u.pathname) + '&' + ts, 'bf7dddc7c9cfe6f7');
    let signa = CryptoJS.enc.Base64.stringify(sha1);
    return link + '&_sig=' + encodeURIComponent(signa) + '&_ts=' + ts;
}

async function request(reqUrl, ua) {
    const resp = await req.get(reqUrl, {
        headers: {
            'User-Agent': ua || device.ua,
        },
    });
    return resp.data;
}

async function init(inReq, _outResp) {
    const deviceKey = inReq.server.prefix + '/device';
    device = await inReq.server.db.getObjectDefault(deviceKey, {});
    if (!device.id) {
        device.id = randStr(40).toLowerCase();
        device.ua = `Rexxar-Core/0.1.3 api-client/1 com.douban.frodo/7.9.0(216) Android/28 product/Xiaomi11 rom/android network/wifi udid/${device.id} platform/mobile com.douban.frodo/7.9.0(216) Rexxar/1.2.151 platform/mobile 1.2.151`;
        await inReq.server.db.push(deviceKey, device);
    }
    return {};
}

async function home(_inReq, _outResp) {
    const link = sig(domain + '/api/v2/movie/tag?sort=U&start=0&count=30&q=全部形式,全部类型,全部地区,全部年代&score_rang=0,10');
    const data = await request(link);
    let classes = [
        {
            type_id: 't1',
            type_name: '热播',
        },
        {
            type_id: 't2',
            type_name: '片库',
        },
        {
            type_id: 't250',
            type_name: 'Top250',
        },
        {
            type_id: 't3',
            type_name: '榜单',
            ratio: 1,
        },
        {
            type_id: 't4',
            type_name: '片单',
            ratio: 1,
        },
    ];
    let filterObj = {};
    filterObj['t1'] = [
        {
            key: 'u',
            name: '',
            init: 'movie/hot_gaia',
            value: [
                { n: '电影', v: 'movie/hot_gaia' },
                { n: '电视剧', v: 'subject_collection/tv_hot/items' },
                { n: '国产剧', v: 'subject_collection/tv_domestic/items' },
                { n: '美剧', v: 'subject_collection/tv_american/items' },
                { n: '日剧', v: 'subject_collection/tv_japanese/items' },
                { n: '韩剧', v: 'subject_collection/tv_korean/items' },
                { n: '动漫', v: 'subject_collection/tv_animation/items' },
                { n: '综艺', v: 'subject_collection/show_hot/items' },
            ],
        },
    ];
    filterObj['t4'] = [
        {
            key: 'type',
            name: '',
            init: '',
            value: [
                { n: '全部', v: '' },
                { n: '电影', v: 'movie' },
                { n: '电视剧', v: 'tv' },
            ],
        },
        {
            key: 'cate',
            name: '',
            init: 'all',
            value: [
                { n: '全部', v: 'all' },
                { n: '豆瓣片单', v: 'official' },
                { n: '精选', v: 'selected' },
                { n: '经典', v: 'classical' },
                { n: '获奖', v: 'prize' },
                { n: '高分', v: 'high_score' },
                { n: '榜单', v: 'movie_list' },
                { n: '冷门佳片', v: 'dark_horse' },
                { n: '主题', v: 'topic' },
                { n: '导演', v: 'director' },
                { n: '演员', v: 'actor' },
                { n: '系列', v: 'series' },
            ],
        },
        {
            key: 'cate',
            name: '',
            init: 'all',
            value: [
                { n: '华语', v: 'chinese' },
                { n: '欧美', v: 'western' },
                { n: '日本', v: 'japanese' },
                { n: '韩国', v: 'korea' },
            ],
        },
        {
            key: 'cate',
            name: '',
            init: 'all',
            value: [
                { n: '喜剧', v: 'comedy' },
                { n: '动作', v: 'action' },
                { n: '爱情', v: 'love' },
                { n: '科幻', v: 'science_fiction' },
                { n: '动画', v: 'cartoon' },
                { n: '悬疑', v: 'mystery' },
                { n: '惊悚', v: 'panic' },
                { n: '恐怖', v: 'horrible' },
                { n: '犯罪', v: 'criminal' },
                { n: '同性', v: 'lgbt' },
                { n: '战争', v: 'war' },
                { n: '奇幻', v: 'fantasy' },
                { n: '情色', v: 'erotica' },
                { n: '音乐', v: 'music' },
                { n: '纪录片', v: 'documentary' },
                { n: '治愈', v: 'cure' },
                { n: '艺术', v: 'art' },
                { n: '黑色幽默', v: 'dark_humor' },
                { n: '青春', v: 'youth' },
                { n: '女性', v: 'female' },
                { n: '真实事件改编', v: 'real_event' },
                { n: '暴力', v: 'violence' },
                { n: '黑白', v: 'black_white' },
                { n: '美食', v: 'food' },
                { n: '旅行', v: 'travel' },
                { n: '儿童', v: 'child' },
                { n: '人性', v: 'humanity' },
                { n: '家庭', v: 'family' },
                { n: '文艺', v: 'literary_art' },
                { n: '小说改编', v: 'novel' },
                { n: '感人', v: 'moving' },
                { n: '励志', v: 'inspiration' },
            ],
        },
    ];
    let filterAll = [];
    for (const tag of data.tags) {
        if (tag.type == '特色') continue;
        let f = {
            key: tag.type,
            name: '',
            init: tag.data[0],
        };
        let fValues = [];
        if (tag.type == '年代' && tag.data.indexOf(dayjs().year().toString()) < 0) {
            tag.data.splice(1, 0, dayjs().year().toString());
            if (tag.data.indexOf((dayjs().year() - 1).toString()) < 0) {
                tag.data.splice(2, 0, (dayjs().year() - 1).toString());
            }
        }
        for (const v of tag.data) {
            let n = v;
            if (v.indexOf('全部') >= 0) n = '全部';
            fValues.push({ n: n, v: v });
        }
        f['value'] = fValues;
        filterAll.push(f);
    }
    let sort = {
        key: 'sort',
        name: '',
        init: data.sorts[0].name,
    };
    let sortValues = [];
    for (const sort of data.sorts) {
        sortValues.push({ n: sort.text, v: sort.name });
    }
    sort['value'] = sortValues;
    filterAll.push(sort);
    filterObj['t2'] = filterAll;
    return {
        class: classes,
        filters: filterObj,
    };
}

async function category(inReq, _outResp) {
    const tid = inReq.body.id;
    const pg = inReq.body.page;
    const extend = inReq.body.filters;
    let page = pg || 1;
    if (page == 0) page = 1;
    if (tid == 't1') {
        const link = sig(`${domain}/api/v2/${extend.u || 'movie/hot_gaia'}?area=全部&sort=recommend&playable=0&loc_id=0&start=${(page - 1) * 30}&count=30`);
        const data = await request(link);
        let videos = [];
        for (const vod of data.items || data.subject_collection_items) {
            let score = (vod.rating ? vod.rating.value || '' : '').toString();
            videos.push({
                vod_id: vod.id,
                vod_name: vod.title,
                vod_pic: vod.pic.normal || vod.pic.large,
                vod_remarks: score.length > 0 ? '评分:' + score : '',
            });
        }
        return {
            page: parseInt(page),
            pagecount: Math.ceil(data.total / 30),
            list: videos,
        };
    } else if (tid == 't250') {
        const link = sig(`${domain}/api/v2/subject_collection/movie_top250/items?area=全部&sort=recommend&playable=0&loc_id=0&start=${(page - 1) * 30}&count=30`);
        const data = await request(link);
        let videos = [];
        for (const vod of data.items || data.subject_collection_items) {
            let score = (vod.rating ? vod.rating.value || '' : '').toString();
            videos.push({
                vod_id: vod.id,
                vod_name: vod.title,
                vod_pic: vod.pic.normal || vod.pic.large,
                vod_remarks: score.length > 0 ? '评分:' + score : '',
            });
        }
        return {
            page: parseInt(page),
            pagecount: Math.ceil(data.total / 30),
            list: videos,
        };
    } else if (tid == 't2') {
        const link = sig(`${domain}/api/v2/movie/tag?sort=${extend.sort || 'U'}&start=${(page - 1) * 30}&count=30&q=${extend['形式'] || '全部形式'},${extend['类型'] || '全部类型'},${extend['地区'] || '全部地区'},${extend['年代'] || '全部年代'}&score_rang=0,10`);
        const data = await request(link);
        let videos = [];
        for (const vod of data.data) {
            let score = (vod.rating ? vod.rating.value || '' : '').toString();
            videos.push({
                vod_id: vod.id,
                vod_name: vod.title,
                vod_pic: vod.pic.normal || vod.pic.large,
                vod_remarks: score.length > 0 ? '评分:' + score : '',
            });
        }
        return {
            page: parseInt(page),
            pagecount: Math.ceil(data.total / 30),
            list: videos,
        };
    } else if (tid == 't3') {
        let link = sig(`${domain}/api/v2/movie/category_ranks?count=30&category=recent_hot`);
        let data = await request(link);
        let videos = [];
        for (const vod of data.selected_collections) {
            videos.push({
                vod_id: 'cr_' + vod.id,
                vod_name: vod.short_name || vod.title,
                vod_pic: vod.cover_url,
                vod_remarks: '',
                cate: {},
            });
        }
        link = sig(`${domain}/api/v2/tv/category_ranks?count=30&category=recent_hot`);
        data = await request(link);
        for (const vod of data.selected_collections) {
            videos.push({
                vod_id: 'cr_' + vod.id,
                vod_name: vod.short_name || vod.title,
                vod_pic: vod.cover_url,
                vod_remarks: '',
                cate: {},
            });
        }
        return {
            page: 1,
            pagecount: 1,
            list: videos,
        };
    } else if (tid == 't4') {
        const link = sig(`${domain}/api/v2/skynet/new_playlists?subject_type=${extend['type'] || ''}&category=${extend['cate'] || 'all'}&loc_id=0&start=${(page - 1) * 30}&count=30`);
        const data = await request(link);
        let videos = [];
        for (const vod of data.data[0].items) {
            videos.push({
                vod_id: vod.owner ? 'dl_' + vod.id : 'cr_' + vod.id,
                vod_name: vod.title,
                vod_pic: vod.cover_url,
                vod_remarks: '',
                cate: {},
            });
        }
        return {
            page: parseInt(page),
            pagecount: Math.ceil(data.total / 30),
            list: videos,
        };
    } else if (tid.startsWith('cr_')) {
        const link = sig(`${domain}/api/v2/subject_collection/${tid.substring(3)}/items?start=${(page - 1) * 30}&count=30&updated_at=&items_only=1`);
        const data = await request(link);
        let videos = [];
        for (const vod of data.subject_collection_items) {
            let score = (vod.rating ? vod.rating.value || '' : '').toString();
            videos.push({
                vod_id: vod.id,
                vod_name: vod.title,
                vod_pic: vod.pic.normal || vod.pic.large,
                vod_remarks: score.length > 0 ? '评分:' + score : '',
            });
        }
        return {
            page: parseInt(page),
            pagecount: Math.ceil(data.total / 30),
            list: videos,
        };
    } else if (tid.startsWith('dl_')) {
        const link = sig(`${domain}/api/v2/doulist/${tid.substring(3)}/posts?start=${(page - 1) * 30}&count=30&updated_at=&items_only=1`);
        const data = await request(link);
        let videos = [];
        for (const it of data.items) {
            const vod = it.content.subject;
            if (!vod) continue;
            let score = (vod.rating ? vod.rating.value || '' : '').toString();
            videos.push({
                vod_id: vod.id,
                vod_name: vod.title,
                vod_pic: vod.pic.normal || vod.pic.large,
                vod_remarks: score.length > 0 ? '评分:' + score : '',
            });
        }
        return {
            page: parseInt(page),
            pagecount: Math.ceil(data.total / 30),
            list: videos,
        };
    }
}

async function detail(_inReq, _outResp) {
    return {};
}

async function play(_inReq, _outResp) {
    return {};
}

async function search(_inReq, _outResp) {
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
        key: 'douban',
        name: '豆瓣电影',
        type: 3,
        indexs: 1,
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
