import { dayjs, Crypto, Uri, _ } from './lib/cat.js';

let siteKey = '';
let siteType = 0;
const host = "https://api.9cec79d.com";
const token = "97630f5f85d9f3c639fb7790ca881ef2.4cccf48dc340fe8bded39cfe4ef9ac2adb27425a9069e6cd121210fc7ba518ea8c1cc5629261e94bb6ccb66d8548449c72076c956a2fb46c253008909a6c66347eb458fe3c06d1fcc993ca03a298328f9229f1994a608250c7d1ae124c4520e6e14ce8bf9f4404119a6bbf53cf592a8df2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.473433979755ccd5ec1b4581ccef76e8209b9e0c6ff819917f12dffad47d0d5e";
const rsaKey = "-----BEGIN PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcKZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcWV9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdIDblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVMiMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUMWBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZK7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1bL3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oat5lYKfpe8k83ZA==\n-----END PRIVATE KEY-----";
const reqeustKeys = "bMTqITVqBsbq9UjLufsQuBvRiIyfqHLqAWUx0gj0ZUe9DMNDTmJDVZzAh45AZ5LtkC39Y0DU4Ufqm/9gliIJaj7cI/dhmoM5fib5HcslzyGONEwZY5fHBvokBreGaT8bPoaxmnWdTRjRfJzYZV6T06O7GsYVa6DuKTVArb0g48Q=";
const headers = {
    "Version": "2406025",
    "PackageName": "com.j64f4b21072.ha69699879.dfea0a9826ba.ibf50c9b1d",
    "Ver": "1.9.2",
    "Referer": "https://api.9cec79d.com",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "okhttp/3.12.0",
}
async function request(url, data) {
    let dt = dayjs().unix();
    let request_key = aesEncode(data, 'U823n8pKnAAbWOST', 'wgr8N6BCs7426wf1', 'hex');
    let signature = Crypto.MD5("token_id=,token="+token+",phone_type=1,request_key=" + request_key + ",app_id=1,time=" + dt + ",keys=" + reqeustKeys + "*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br").toString(Crypto.enc.Hex).toUpperCase();
    let param = {
        'token': token,
        'token_id': '',
        'phone_type': 1,
        'time': dt,
        'phone_model': 'xiaomi-2206123sc',
        'keys': reqeustKeys,
        'request_key': request_key,
        'signature': signature,
        'app_id': '1',
        'ad_version': '1',

    }
    let res = await req(host + url, {
        headers: headers,
        method: 'post',
        data: param,
    });
    let result = JSON.parse(res.content);
    let aesKeys = JSON.parse(rsaX('RSA/ECB/PKCS1', false, false, result.data.keys, true, rsaKey, false));
    return aesDecode(result.data.response_key, aesKeys.key, aesKeys.iv, 'hex');
}

function aesEncode(str, keyStr, ivStr, type) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    let encData = Crypto.AES.encrypt(str, key, {
        iv: Crypto.enc.Utf8.parse(ivStr),
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    });
    if (type === 'hex') return encData.ciphertext.toString(Crypto.enc.Hex);
    return encData.toString(Crypto.enc.Utf8);
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

 async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        host = cfg.ext;
    }
}

async function home(filter) {
    let classes = [];
    let classStr = JSON.parse(await request('/App/Index/indexPid', '{}'));
    let filters = {};
    for(let i=0;i<classStr.length;i++){
        let item = classStr[i];
        if (item.t_id > 0) {
            filters[item.t_id + ''] = [];
            let areaVals = [];
            let yearVals = [];
            let subVals = [];
            let sortVals = [];
            classes.push({
                type_id: item.t_id + '',
                type_name: item.name,
            });
            let filter = JSON.parse(await request('/App/IndexList/indexScreen', JSON.stringify({'t_id': item.t_id})));
            if(filter.area) {
                _.forEach(filter.area, t => {
                    areaVals.push({n:t.name,v:t.value});
                })
                filters[item.t_id + ''].push({key: 'area', name: '地区', init: '0', value: areaVals});
            }
            if(filter.year) {
                _.forEach(filter.year, t => {
                    yearVals.push({n:t.name,v:t.value});
                })
                filters[item.t_id + ''].push({key: 'year', name: '年份', init: '0', value: yearVals});
            }
            if(filter.sub) {
                _.forEach(filter.sub, t => {
                    subVals.push({n:t.name,v:t.value});
                })
                filters[item.t_id + ''].push({key: 'sub', name: '类型', init: '0', value: subVals});
            }
            if(filter.sort) {
                _.forEach(filter.sort, t => {
                    sortVals.push({n:t.name,v:t.value});
                })
                filters[item.t_id + ''].push({key: 'sort', name: '排序', init: 'd_id', value: sortVals});
            }
            
        }
        
    };
    return JSON.stringify({
        class: classes,
        filters: filters,
    });
}

async function category(tid, pg, filter, extend) {
    let param = {
        tid: tid,
        page: pg,
        sort: extend.sort || 'd_id',
        area: extend.area || '0',
        sub: extend.sub || '0',
        year: extend.year || '0',
        pageSize: '30',
    }
    let data = JSON.parse(await request('/App/IndexList/indexList', JSON.stringify(param)));
    return JSON.stringify({
        page: pg,
        limit: 30,
        total: data.total,
        list: data.list,
    });
}

async function detail(id) {
    let param = {
        'token_id': '1009464',
        'vod_id': id,
        'mobile_time': dayjs().unix()+'',
        'token': token,
    }
    let info = JSON.parse(await request('/App/IndexPlay/playInfo', JSON.stringify(param))).vodInfo;
    let videos = {
        vod_id: info.vod_id,
        vod_title: info.vod_title,
        vod_year: info.vod_year,
        vod_name: info.vod_name,
        vod_score: info.vod_scroe,
        vod_area: info.vod_area,
        vod_director: info.vod_director,
        vod_actor: info.vod_actor,
        vod_pic: info.vod_pic,
        vod_content: info.vod_use_content,
        type_name: info.videoTag.join(','),
    }

    let data2 = JSON.parse(await request('/App/Resource/Vurl/show', JSON.stringify({'vurl_cloud_id': '2','vod_d_id': id}))).list;
    let fromUrl = {};
    data2.forEach(item => {
        for (const key in item.play) {
            if (item.play[key].show_type == '2') {
                continue;
            }
            if (!fromUrl.hasOwnProperty(key)) {
                fromUrl[key] = [];
            } 
            fromUrl[key].push(item.title + '$' + item.play[key].param);
        }
    });
    videos.vod_play_from = _.keys(fromUrl).join('$$$');
    let urls = _.values(fromUrl);
    let vod_play_url = [];
    for (const urlist of urls) {
        vod_play_url.push(urlist.join('#'));
    }
    videos.vod_play_url = vod_play_url.join('$$$');
    return JSON.stringify({
        list: [videos],
    });
}

async function play(flag, id, flags) {
    let arr = id.split('&');
    let param = {};
    _.forEach(arr, item => {
        let kv = item.split('=');
        param[kv[0]] = kv[1];
    });
    let data = JSON.parse(await request('/App/Resource/VurlDetail/showOne', JSON.stringify(param))).url;
    return JSON.stringify({
        parse: 0,
        url: data,
    });
}

async function search(wd, quick, pg) {
    let param = {
        'keywords': wd,
        'order_val': '1',
    }
    let data = JSON.parse(await request('/App/Index/findMoreVod', JSON.stringify(param))).list;
    let videos = [];
    _.map(data, item => {
        videos.push({
            vod_id: item.vod_id,
            vod_name: item.vod_name,
            vod_pic: item.vod_pic,
            vod_remarks: item.vod_scroe,
        })
    })
    return JSON.stringify({
        list: videos,
    });
}


export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
       //homeVod: homeVod,
       category: category,
       detail: detail,
       play: play,
       search: search,
       //validCode: validCode,
    };
}
