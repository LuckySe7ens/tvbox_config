import { Crypto, load, _ } from './lib/cat.js';

let siteUrl = 'https://www.cs1369.com';
let siteKey = '';
let siteType = 0;
let headers = {
    'Content-Type': 'application/json',
    'origin': 'https://tool.liumingye.cn',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
};
async function request(reqUrl, postData, get) {
    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
    });
    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    const classes = [{
        type_id: '1',
        type_name: '歌手'
    }];
    let filters = [];
    for(let i=0;i<=27;i++) {
        let name = String.fromCodePoint(i+64);
        if(i <= 0) name = '热门';
        if(i >= 27) name = '#';
        filters.push({
            'v': String(i),
            'n': name
        })
    }
    return JSON.stringify({
        class: classes,
        filters: {
            '1': [
                {
                    'key': 'word', 
                    'name': '首字母',
                    'init':'0', 
                    'value': filters
                 }
            ]
        }
    });
}

async function homeVod() {
    
}

async function category(tid, pg, filter, extend) {
    if(!pg || pg <=0) pg = 1;
    let url = 'https://api.liumingye.cn/m/api/artist/list';
    let param = {
        'initial': extend['word'] || '0',
        'page': pg,
        '_t': new Date().getTime()
    }
    param['token'] = genToken(param);
    let data = JSON.parse(await request(url, param)).data;
    let videos = [];
    for (const vod of data.list) {
        videos.push({
            vod_id: vod.name,
            vod_name: vod.name,
            vod_pic: vod.pic,
            vod_remarks: ``,
        });
    }
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: 20,
    });
}

async function searchSongs(name,pg){
    if (!pg || pg <=0) pg = 1;
    let params = {
        "type":"YQM",
        "text":name,
        "page":pg,
        "v":"beta",
        "_t": new Date().getTime()
    }
    let token = genToken(params);
    params['token'] = token;
    let data = JSON.parse(await request('https://api.liumingye.cn/m/api/search', params)).data;
    //console.log(data);
    let videos = [];
    for (const vod of data.list) {
        if (vod.hash || vod.id) {
            videos.push({
                vod_id: vod.hash || vod.id,
                vod_name: vod.name,
                vod_pic: vod.pic || '',
                vod_remarks: vod.time?`${Math.floor(vod.time/60)}:${vod.time % 60}`:'',
            });
        }    
    }
    return videos;
}

async function detail(id) {
    try {
        let vod = {
            vod_id: id,
            vod_play_from: 'Leospring',
            vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
        };
        if(id.length > 15) {
            vod.vod_play_url = '播放$' + id;
        } else {
            let list1 = await searchSongs(id, 1);
            let list2 = await searchSongs(id, 2);
            let list3 = await searchSongs(id, 3);
            let videos = list1.concat(list2).concat(list3);
            vod.vod_name = id,
            vod.vod_play_url = _.map(videos, item => {
                return item.vod_name + '$' + item.vod_id;
            }).join('#');            
        }
        return JSON.stringify({
            list: [vod],
        });
    } catch (e) {
       console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let videos = await searchSongs(wd, pg);
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let url = getMp3(id);
    return JSON.stringify({
        parse: 0,
        url: url,
        header: headers,
    });
}

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

const Es = "mLIXG/KZejUbq85HWdvlVtpAFrQsR0ciYEDPJwn321zu4=ToxygSM67OkafC9hNB+";
const t= 'xeLO3Wq54bYyE5q59B1WU0ju26bg5GzZTr7wN40aOYOEZEy9IWm9XU51an5nv2jp';
function Bs(ee){
	let f=0,h='';
	do{
		let s=ee[f++],
		o=ee[f++],
		i=ee[f++],
		 u=(s << 16 | o << 8) | i,
		 a = ((u >> 18) & 63),
		l = (u >> 12) & 63,
		r = 63 & (u >> 6),
		c = (u & 63);
		h += (Es.charAt(a)+ Es.charAt(l)) + Es.charAt(r) + Es.charAt(c);
	} while(f<ee.length);
    if(ee.length % 3) {
        h = h.substring(0, h.length-2) + '==';
    }
    return h;
}


function genToken(data) {
    let res = encodeURIComponent(JSON.stringify(data));
    let arr = [];
    for(let i=0;i<res.length;i++) {
        arr[i] = res.charCodeAt(i) ^ t.charCodeAt(i%64);
    }
    return '20241016.' + md5X(Bs(arr));
}

function getMp3(musicId) {
    let data = {
        id: musicId,
        quality: "128",
        _t: String(new Date().getTime())
    }
    let token = genToken(data);
    let url = `https://api.liumingye.cn/m/api/link?id=${data.id}&quality=${data.quality}&_t=${data._t}&token=${token}`;
    //console.log(url);
    return url;
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
        //test: test,
    };
}
