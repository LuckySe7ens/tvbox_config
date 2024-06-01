import { __jsEvalReturn } from './lsq_open.js';

var spider = __jsEvalReturn();

var saohuo_rule = 'https://agit.ai/564892076/box/raw/branch/main/js/cat/rules/saohuo.rule';
var wzznl_rule = {
  host: 'https://wzznl.buzz',
  class_name: '电影&电视&综艺&动漫',
  class_url: '1&2&3&4',
  homeVod: '.myui-vodlist__box;a&&title;a&&href;a&&style||data-original&&\\((.*?)\\);span.text-right&&Text',
  url: '/list/?fyclass-fypage.html',
  categoryVod: '.myui-vodlist__box;a&&title;a&&href;a&&style||data-original&&\\((.*?)\\);span.text-right&&Text',
  detailVod: {
    content: '#jq div div.tab-content.myui-panel_bd&&Text',
    playFrom: '.bottom-line:has(h3:contains(播放地址)) > ul > li > a&&Text',
    playUrl: '.tab-pane .myui-content__list;li a;&&Text;&&href',
  },
  lazy: `
    let match = html.match(/var now="(.*?)";/);
    if(match) playUrl = match[1];
  `,
  searchUrl: '/search.php?page=fypage&searchword=**&searchtype=',
  searchParse: 'a.myui-vodlist__thumb;&&title;&&href;&&data-original;span.text-right&&Text'
}
var bt0_rule = {
  host: 'https://www.2bt0.com',
  //class_parse: '.tabs li;span&&Text;&&onclick&&\\((.*?)\\)',
  homeUrl: '/?sc=3',
  class_name: '电影&电视',
  class_url: '1&2',
  url: 'https://www.2bt0.com/movie/fyclass.html?sb=&sc=&sct=&scn=&sd=&sdt=&sdn=&se=&set=&sen=&sf=&sft=&sfn=&sg=1&sh=&sht=&shn=&page=fypage',
  detailUrl: '/fyid',
  推荐: '.masonry_item;h5&&Text&&(.*?) ;a&&href;.bgimgcov&&style&&\\((.*?)\\);.inblock&&Text',
  一级: '.masonry_item;h5&&Text&&(.*?) ;a&&href;.bgimgcov&&style&&\\((.*?)\\);.inblock&&Text',
  二级: {
    director: '.directors div&&Text&&(.*?) ',
    actor: 'span[itemprop=actor]&&Text&&(.*?) ',
    content: 'article&&Text',
    tabNames: '.tab_title&&Text',
    tabs: '.tab__content',
    lists: 'div.container',
    list_text: 'a.torrent-title&&Text',
    list_url: 'a:has(div:contains(磁力链接))&&href',
  }
};

async function test() {
    var spType = null;
    var spVid = null;
    spType = '2';
    await spider.init({ skey: 'siteKey', ext:  wzznl_rule});
    //let jiexi = await spider.jiexi('https://v.qq.com/x/cover/mzc00200094m6mo/y4100ek7dly.html');
    //console.log(jiexi);
    //spider.test()
     //var home = await spider.home(true);
     //console.log(JSON.parse(home));

     //spider.hmacSHA1()
     //var homeVod = JSON.parse(await spider.homeVod());
     //console.log(homeVod);

      var cate = JSON.parse(await spider.category('2', 1, true, {'type': '古装'}));
      console.log(cate);

      var detail = JSON.parse(await spider.detail('/detail/?38576.html'));
      console.log(detail);

      var play = await spider.play('','/video/?38576-0-0.html', []);
      console.log(play);
    //await spider.validCode('https://www.hdmyy.com/index.php/verify/index.html?');
    // spVid = '95873';
     

    //var page = JSON.parse(await spider.category('azz', 3, undefined, {}));
    //console.log(page);
    //var page = JSON.parse(await spider.detail('/movie/47797.html'));
    //console.log(page);
    
    //var page = JSON.parse(await spider.search('三体'));
    //console.log(page);

    
    // var validCode = JSON.parse(await spider.validCode('https://ikan6.vip/verify/index.html'));
    // console.log(validCode);

    //await spider.getImgBs64('https://img.kfhklzn.com/file/short-video/avatar/0af68f2aa53842fda48282b01b55dba7.jpg');

    
}

export { test };

