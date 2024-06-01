import { Crypto, load, _ } from './lib/cat.js';
/**
 * 爱看资源
 * author：Leospring
 * 公众号：蚂蚁科技杂谈
 */
var charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
let siteUrl = 'https://ikan6.vip';
let siteKey = '';
let siteType = 0;
let COOKIE = 'PHPSESSID=' + randStr(26, true);
let headers = {
    'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 13_2_3 like Mac OS X) AppleWebKit/537.36  (KHTML, like Gecko) Version/13.0 Mobile/13B14 Safari/537.36',
    'Referer': siteUrl + '/',
    'Cookie': COOKIE
};

async function request(reqUrl, postData, post) {

    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: headers,
        data: postData || {},
        postType: post ? 'form' : '',
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
        type_id: '1',
        type_name: '电影',
    },{
        type_id: '2',
        type_name: '剧集',
    },{
        type_id: '3',
        type_name: '综艺',
    },{
        type_id: '4',
        type_name: '动漫',
    },{
        type_id: '15',
        type_name: '日韩剧',
    },{
        type_id: '16',
        type_name: '美剧',
    },{
        type_id: '14',
        type_name: '港台剧',
    },{
        type_id: '20',
        type_name: '纪录片',
    },{
        type_id: '25',
        type_name: '体育赛事',
    }];
    let filterObj = genFilterObj();
    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function homeVod() {
    let url = siteUrl;
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.public-list-div.public-list-bj > u > a')
    let videos = _.map(cards, (n) => {
        let id = $(n).attr('href');
        let name = $(n).attr('title');
        let pic = $($(n).find('div')[0]).attr('data-original');
        let remarks = $($(n).find('span.public-list-prb.hide.ft2')[0]).text().trim();
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remarks,
        };
    });
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, ext) {
    let url = siteUrl + '/index.php/api/vod';
    let nowTime = parseInt(new Date()/1000);
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let param = {
        type: tid,
        pg: pg,
        time: nowTime,
        key: Crypto.MD5('DS' + nowTime + 'DCC147D11943AF75').toString().toLowerCase(),
    };
    if(ext['id'] && ext['id'].length > 0) {
        param['type'] = ext['id'];
    }
    if(ext['year'] && ext['year'].length > 0) {
        param['year'] = ext['year'];
    }
    if(ext['area'] && ext['area'].length > 0) {
        param['area'] = ext['area'];
    }
    let d = await request(url, param, true);
    let res = JSON.parse(d);
    
    let videos = [];
    res['list'].forEach(item => {
        let pic = item['vod_pic'];
        if (pic.startsWith('mac')) pic = pic.replaceAll('mac', 'http');
        if(!pic.startsWith('http')) pic = siteUrl + '/' + pic;
        videos.push({
            vod_id: '/voddetail/' + item.vod_id,
            vod_name: item.vod_name,
            vod_pic: pic,
            vod_remarks: item.vod_remarks,
        });
    });
    return JSON.stringify({
        list: videos,
        page: res.page,
        limit: res.limit,
        pagecount: res.pagecount,
        total: res.total,
    });
    
}

async function detail(id) {
    try {
        const html = await request(siteUrl + id);
        let $ = load(html);
        let content = $('#height_limit').text();
        let type = _.map($('div.detail-info.rel.flex-auto > div:nth-child(5) > a'), (n) => {
            return $(n).text();
        }).join(' ');

        let director = _.map($('div.detail-info.rel.flex-auto > div:nth-child(3) > a'), (n) => {
            return $(n).text();
        }).join(' ');

        let actor = _.map($('div.detail-info.rel.flex-auto > div:nth-child(4) > a'), (n) => {
            return $(n).text();
        }).join(' ');
        let playFroms = _.map($('u > a.swiper-slide'), (n) => {
            return $(n).text();
        }).join('$$$');
        let playUrls =  _.map($('div.anthology-list-box.none'), (n) => {
            return _.map($(n).find('li.box > u > a.hide'), (m) => {
                return $(m).text() +'$'+$(m).attr('href');
            }).join('#');
        }).join('$$$');
        
        const video = {
            vod_play_from: playFroms,
            vod_play_url: playUrls,
            vod_content: content,
            vod_director: director,
            vod_actor: actor,
            vod_type: type,
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
    let url = siteUrl + '/vodsearch/-------------/?wd=' + wd;
    //TODO验证码处理 body > div.box-width > div > div.row-9 > div > div:nth-child(2)
    const html = await request(url);
    if (html.indexOf('请输入验证码') >0) {
        //进行验证码处理
        /**
         * https://akanhd.com/vodsearch/-------------/?wd=xxxx
            验证码：https://akanhd.com/verify/index.html?r=random()
            https://akanhd.com/index.php/ajax/verify_check?type=search&verify=9068
            {"code":1002,"msg":"验证码错误"}
         */

    }
    const $ = load(html);
    const cards = $('div.search-box.flex.rel')
    let videos = _.map(cards, (n) => {
        let id = $($(n).find('div.left > a.public-list-exp')[0]).attr('href');
        let name = $($(n).find('div.right > div.thumb-content > div.thumb-txt.cor4.hide')[0]).text();
        let pic = $($(n).find('div.left > a.public-list-exp > div')[0]).attr('data-original');
        let remarks = $($(n).find('div.left > a.public-list-exp > span.public-list-prb')[0]).text().trim();
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remarks,
        };
    });
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let playUrl = siteUrl + id;
    try {
        const html = await request(playUrl);
        const $ = load(html);
        for(const n of $('script')) {
            if($(n).text().indexOf("var player_data=") >= 0) {
                let url = unescape(JSON.parse($(n).text().split("var player_data=")[1]).url);
                //console.log('url', url);
                if(url.startsWith('http')) {
                    playUrl = url;
                } else {
                    playUrl = await getRealUrl(url);
                }
                return JSON.stringify({
                    parse: 0,
                    url: playUrl,
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
    return JSON.stringify({
        parse: 1,
        url: playUrl,
    });
}

async function getRealUrl(data) {
    let url = 'https://cms.akanhd.com/ikanbfqmuip/nicaibudaowozainadebfq.php?url=' + data;
    let html = await request(url);
    let $ = load(html);
    let str = $('meta[name="viewport"]').attr('id').replaceAll('now_','');
    let idx = $('meta[charset="UTF-8"]').attr('id').replaceAll('now_','');
    
    let enUrl = '';
    for(const n of $('script')) {
       if($(n).text().indexOf("var config = ") >= 0) {
           let conf = $(n).text().split('var config = ')[1];
           enUrl = conf.split('\n')[2].split('"')[3];
       }	
   }
   
    let d='';
    let obj = {};
    for(let i=0;i<idx.length;i++){
        let n = parseInt(idx.charAt(i));
        let c = str.charAt(n);
        obj[n] = str.charAt(i);
    }
    
    for(let i=0;i<10;i++) {
        d += obj[i];
    }
     let md5 = Crypto.MD5(d + 'ikanysbfq66bielaizhanbian').toString().toLowerCase();
     let ivStr = md5.substring(0x10);
     let keyStr = md5.substring(0x0,0x10);
     return aesDecode(enUrl, ivStr, keyStr);

}

async function validCode(url) {
    url = 'https://ikan6.vip/verify/index.html';
    try {
        const resp = await req(url, {
            buffer: 1,
            //headers: headers
        });
        const data1 = new Blob([resp.content]);

        const formData = new FormData();
        formData.append('image', data1, {
            filename: 'validateCode.png',
            contentType: 'image/png'
        });
        const response = await req('https://api.nn.ci/ocr/img/json', {
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            filename: 'validateCode.png',
            contentType: 'image/png'
          },
        });
        //console.log('data', response);
        return response.content;
      } catch (error) {
        //console.error(error);
      }
}

   
//aes解密
function aesDecode(str, keyStr, ivStr) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    var bytes = Crypto.AES.decrypt(str, key, {
        iv: Crypto.enc.Utf8.parse(ivStr),
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    });
    return bytes.toString(Crypto.enc.Utf8);
}

function genFilterObj() {
    return {
        '1':[
            {
                key: 'id',
                name: '类型', 
                value: [{n:'全部',v:''},{n:'动作片',v:'6'},{n:'喜剧片',v:'7'},{n:'爱情片',v:'8'},{n:'科幻片',v:'9'},{n:'恐怖片',v:'10'},{n:'剧情片',v:'11'},{n:'战争片',v:'12'},{n:'灾难片',v:'24'}]
            },{
                key: 'class',
                name: '剧情', 
                value: [{n:'全部',v:''},{n:'喜剧',v:'喜剧'},{n:'爱情',v:'爱情'},{n:'恐怖',v:'恐怖'},{n:'动作',v:'动作'},{n:'科幻',v:'科幻'},{n:'剧情',v:'剧情'},{n:'战争',v:'战争'},{n:'警匪',v:'警匪'},{n:'犯罪',v:'犯罪'},{n:'动画',v:'动画'},{n:'奇幻',v:'奇幻'},{n:'武侠',v:'武侠'},{n:'冒险',v:'冒险'},{n:'枪战',v:'枪战'},{n:'悬疑',v:'悬疑'},{n:'惊悚',v:'惊悚'},{n:'经典',v:'经典'},{n:'青春',v:'青春'},{n:'文艺',v:'文艺'},{n:'微电影',v:'微电影'},{n:'古装',v:'古装'},{n:'历史',v:'历史'},{n:'运动',v:'运动'},{n:'农村',v:'农村'},{n:'儿童',v:'儿童'},{n:'网络电影',v:'网络电影'}]
            },{
                key: 'area',
                name: '地区', 
                value: [{n:'全部',v:''},{n:'大陆',v:'大陆'},{n:'香港',v:'香港'},{n:'台湾',v:'台湾'},{n:'美国',v:'美国'},{n:'韩国',v:'韩国'},{n:'日本',v:'日本'},{n:'泰国',v:'泰国'},{n:'新加坡',v:'新加坡'},{n:'马来西亚',v:'马来西亚'},{n:'印度',v:'印度'},{n:'英国',v:'英国'},{n:'法国',v:'法国'},{n:'加拿大',v:'加拿大'},{n:'西班牙',v:'西班牙'},{n:'俄罗斯',v:'俄罗斯'}]
            },{
                key: 'year',
                name: '年份', 
                value: [{n:'全部',v:''},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'},{n:'2009',v:'2009'},{n:'2008',v:'2008'},{n:'2007',v:'2007'},{n:'2006',v:'2006'},{n:'2005',v:'2005'},{n:'2004',v:'2004'},{n:'2003',v:'2003'},{n:'2002',v:'2002'},{n:'2001',v:'2001'},{n:'2000',v:'2000'}]
            }],
        '2':[{
                key: 'id',
                name: '类型', 
                value: [{n:'全部',v:''},{n:'国产剧',v:'13'}]
            },{
                key: 'class',
                name: '剧情', 
                value: [{n:'全部',v:''},{n:'古装',v:'古装'},{n:'战争',v:'战争'},{n:'青春偶像',v:'青春偶像'},{n:'喜剧',v:'喜剧'},{n:'家庭',v:'家庭'},{n:'犯罪',v:'犯罪'},{n:'动作',v:'动作'},{n:'奇幻',v:'奇幻'},{n:'剧情',v:'剧情'},{n:'历史',v:'历史'},{n:'经典',v:'经典'},{n:'乡村',v:'乡村'},{n:'情景',v:'情景'},{n:'商战',v:'商战'},{n:'网剧',v:'网剧'}]
            },{
                key: 'area',
                name: '地区', 
                value: [{n:'全部',v:''},{n:'内地',v:'内度'},{n:'香港',v:'香港'},{n:'台湾',v:'台湾'},{n:'美国',v:'美国'},{n:'韩国',v:'韩国'},{n:'日本',v:'日本'},{n:'泰国',v:'泰国'},{n:'新加坡',v:'新加坡'},{n:'马来西亚',v:'马来西亚'},{n:'印度',v:'印度'},{n:'英国',v:'英国'},{n:'法国',v:'法国'},{n:'加拿大',v:'加拿大'},{n:'西班牙',v:'西班牙'},{n:'俄罗斯',v:'俄罗斯'}]
            },{
                key: 'year',
                name: '年份', 
                value: [{n:'全部',v:''},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'},{n:'2009',v:'2009'},{n:'2008',v:'2008'},{n:'2007',v:'2007'},{n:'2006',v:'2006'},{n:'2005',v:'2005'},{n:'2004',v:'2004'},{n:'2003',v:'2003'},{n:'2002',v:'2002'},{n:'2001',v:'2001'},{n:'2000',v:'2000'}]
            }],
        '3':[{
            key: 'class',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'情感',v:'情感'},{n:'选秀',v:'选秀'},{n:'访谈',v:'访谈'},{n:'播报',v:'播报'},{n:'旅游',v:'旅游'},{n:'音乐',v:'音乐'},{n:'美食',v:'美食'},{n:'纪实',v:'纪实'},{n:'曲艺',v:'曲艺'},{n:'生活',v:'生活'},{n:'游戏互动',v:'游戏互动'},{n:'财经',v:'财经'},{n:'求职',v:'求职'}]
        },{
            key: 'area',
            name: '地区', 
            value: [{n:'全部',v:''},{n:'内地',v:'内地'},{n:'港台',v:'港台'},{n:'日韩',v:'日韩'},{n:'欧美',v:'欧美'}]
        },{
            key: 'year',
            name: '年份', 
            value: [{n:'全部',v:''},{n:'2023',v:'2023'},{n:'2022',v:'2022'},{n:'2021',v:'2021'},{n:'2020',v:'2020'},{n:'2019',v:'2019'},{n:'2018',v:'2018'},{n:'2017',v:'2017'},{n:'2016',v:'2016'},{n:'2015',v:'2015'},{n:'2014',v:'2014'},{n:'2013',v:'2013'},{n:'2012',v:'2012'},{n:'2011',v:'2011'},{n:'2010',v:'2010'},{n:'2009',v:'2009'},{n:'2008',v:'2008'},{n:'2007',v:'2007'},{n:'2006',v:'2006'},{n:'2005',v:'2005'},{n:'2004',v:'2004'},{n:'2003',v:'2003'},{n:'2002',v:'2002'},{n:'2001',v:'2001'},{n:'2000',v:'2000'}]
        }]
    }
}

function randStr(len, withNum) {
    var _str = '';
    let containsNum = withNum === undefined ? true : withNum;
    for (var i = 0; i < len; i++) {
        let idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx];
    }
    return _str;
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
        validCode: validCode,
    };
}