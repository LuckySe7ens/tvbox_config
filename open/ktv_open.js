import { Crypto, load, _ } from './lib/cat.js';

let key = 'ktv';
//let HOST = 'https://vpsdn.leuse.top/searchmv';
let mktvUrl = 'http://txysong.mysoto.cc/songs/';
const HOST = 'https://api.cloudflare.com/client/v4/accounts/1ecc4a947c5a518427141f4a68c86ea1/d1/database/4f1385ab-f952-404a-870a-e4cfef4bd9fd/query';
let host = '';
let siteKey = '';
let siteType = 0;

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';
const headers = {
    'User-Agent': MOBILE_UA,
    'Content-Type': 'application/json',
    'Authorization': 'Bearer LueNrycW-6jks7xBjPqX9mjFq2A2M5Kul6Ig3D8z',
};
async function request(reqUrl, params) {

    const res = await req(reqUrl, {
        method: 'post',
        data: params,
        headers: headers,
    });
    //console.log('res', res.content)
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    let classes = [{
            type_id: 1,
            type_name: '歌手',
        },{
            type_id: 2,
            type_name: '曲库',
    }];
    const filterObj = {
        1: [{ key: 'region', name: '地区', init: '', value: [{ n: '全部', v: '' }, { v: '1', n: '大陆' }, { v: '2', n: '港台' }, { v: '3', n: '国外' }] },{ key: 'form', name: '类别', init: '', value: [{ n: '全部', v: '' }, { v: '1', n: '男' }, { v: '2', n: '女' }, { v: '3', n: '组合' }] }],
        2: [{ key: 'lan', name: '语言', init: '2', value: [{ n: '全部', v: '' }, { v: '1', n: '藏语' }, { v: '2', n: '国语' }, { v: '3', n: '韩语' }, { v: '4', n: '日语' }, { v: '5', n: '闽南语' }, { v: '6', n: '英语' }, { v: '7', n: '粤语' }, { v: '8', n: '其他' }, { v: '9', n: '马来语' }, { v: '10', n: '泰语' }, { v: '11', n: '印尼语' }, { v: '12', n: '越南语' }] },{ key: 'type', name: '类型', init: '', value: [{ n: '全部', v: '' }, { v: '1', n: '流行' }, { v: '2', n: '合唱' }, { v: '3', n: '怀旧' },{ v: '4', n: '儿歌' }, { v: '5', n: '革命' }, { v: '6', n: '民歌' }, { v: '7', n: '舞曲' },{ v: '8', n: '喜庆' }, { v: '9', n: '迪高' }, { v: '10', n: '无损DISCO' }, { v: '11', n: '影视' }] }],
    };
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0 || typeof (pg) == 'undefined') pg = 1;
    let url = HOST;
    let videos = [];
    let params = [];
    let sql = '';
    const size = 30;
    if(tid == 1) {
        sql = 'select name, id from singer where 1=1';
        if(extend['region']) {
            params.push(extend['region']);
            sql += ' and region_id = ?';
        }
        if(extend['form']) {
            params.push(extend['form']);
            sql += ' and form_id = ?';
        }
        sql += ` order by id limit ${(pg-1)*20},20;`;
        //url = url + `?table=singer&pg=${pg}`;
        //if(extend['region']) url = url + '&where=region_id&keywords=' + extend['region'];
        //if(extend['form']) url += '&where=form_id&keywords=' + extend['form'];
        //console.log(sql, params);
        let res = JSON.parse(await request(url, {params: params, sql: sql}));
        videos = _.map(res.result[0].results, item => {
            return {
                vod_id: item.name,
                vod_name: item.name,
                vod_pic: mktvUrl + item.id + '.jpg',
                vod_remarks: '',
            }
        });
    } else if(tid == 2) {
        sql = 'select number, name from song where 1=1';
        if(extend['lan']) {
            params.push(extend['lan']);
            sql += ' and language_id = ?';
        }
        if(extend['type']) {
            params.push(extend['type']);
            sql += ' and type_id = ?';
        }
        sql += ` order by number limit ${(pg-1)*20},20;`;
        //url = url + `?table=song&pg=${pg}`;
        //if(extend['lan']) url = url + '&where=language_id&keywords=' + extend['lan'];
        //if(extend['type']) url += '&where=type_id&keywords=' + extend['type'];
        let res = JSON.parse(await request(url, {params:params, sql:sql}));
        videos = _.map(res.result[0].results, item => {
            return {
                vod_id: mktvUrl + item.number + '.mkv',
                vod_name: item.name,
                vod_pic: '',
                vod_remarks: '',
            }
        });
    }
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: 20,
        pagecount: 999,
    });
}

async function detail(id) {
    const vod = {
        vod_id: id,
        vod_name: id,
        vod_play_from: 'Leospring',
        vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
    }
    if (id.endsWith('.mkv')) {
        vod.vod_play_url = '播放$' + id;
    } else {
        let params = [id];
        let sql = 'select number,name from song where singer_names = ? order by number limit 0,999';
        //let url = HOST + '?table=song&where=singer_names&keywords=' + id + '&size=999';
        let res = JSON.parse(await request(HOST, {params:params,sql:sql}));
        vod.vod_play_url = (_.map(res.result[0].results, item => {
            return item.name + '$' + mktvUrl + item.number + '.mkv';
        })).join('#');
    }
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
    });
}

async function search(wd, quick) {
    let sql = "select number,name from song where name like '%"+wd+"%' or single_names like '%"+wd+"%'";
    let data = JSON.parse(await request(HOST,{sql:sql}));
    let videos = _.map(data.result[0].results, (it) => {
        return {
            vod_id: mktvUrl + it.number + '.mkv',
            vod_name: it.name,
            vod_pic: '',
            vod_remarks: '',
        }
    });
    return JSON.stringify({
        list: videos,
        limit: 50,
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
        search: search,
    };
}
