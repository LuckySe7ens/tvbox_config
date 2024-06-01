import { __jsEvalReturn } from './star_open.js';

var spider = __jsEvalReturn();

async function test() {
    var spType = null;
    var spVid = null;
    spType = '2';
    await spider.init({ skey: 'siteKey', ext: 'https://proxy.leospring.eu.org/url=https://www.histar.tv/' });

    var page = JSON.parse(await spider.search('与卿书'));
    console.log(page);
    var classes = JSON.parse(await spider.home(true));
    console.log(classes);

    var homeVod = JSON.parse(await spider.homeVod());
    console.log(homeVod);

    var page = JSON.parse(await spider.category('movie', 1, true, {year: '2023'}));
    console.log(page);

    var page = JSON.parse(await spider.detail('363131'));
    console.log(page);

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

