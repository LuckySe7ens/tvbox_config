import { __jsEvalReturn } from './ys996_open.js';

var spider = __jsEvalReturn();

async function test() {
    var spType = null;
    var spVid = null;
    spType = '2';
    await spider.init({ skey: 'siteKey', ext: undefined });

    // var search = JSON.parse(await spider.search('一念关山', true,1));
    // console.log(search);

    // var home = JSON.parse(await spider.home(true));
    // console.log(home);

    // var homeVod = JSON.parse(await spider.homeVod());
    // console.log(homeVod);

    // var cate = JSON.parse(await spider.category('1', 1, true, {year: '2023'}));
    // console.log(cate);

    // var detail = JSON.parse(await spider.detail('/detail/228.html'));
    // console.log(detail);

    var detail = JSON.parse(await spider.play('','/play/228-1-1.html', []));
    console.log(detail);

    // spVid = '95873';
    /** 
    
    
    var page = JSON.parse(await spider.category('azz', 3, undefined, {}));
    console.log(page);
    var page = JSON.parse(await spider.detail('97008'));
    console.log(page);
    var page = JSON.parse(await spider.search('周杰伦'));
    console.log(page);
    **/
    
    

    
}

export { test };

