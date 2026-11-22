import fs from 'node:fs';
import { mergeEnrichment } from './merge-enrichment.mjs';
import { applyScope } from './apply-scope.mjs';
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const baseline=read('research/baseline.json');
const additions=read('research/catalog-additions.json');
const review=read('research/catalog-review.json');
const publicSource=read('research/public-venues.json');
const defaults={type:'컨벤션',phone:null,parking:'공개자료에서 확인되지 않음',parkingKnown:false,website:null,aliases:[],note:'',checkedAt:'2026-11-22'};
let venues=baseline.venues.filter(v=>v.type!=='공공 예식').map(v=>({...defaults,...v,status:'official',parkingKnown:!v.parking.includes('확인 필요')}));
for(const v of venues){
 if(['베네치아웨딩부페','웨스턴빌리프'].includes(v.name))v.status='listed';
 if(v.name==='라비앙루미'){v.parking=defaults.parking;v.parkingKnown=false;}
 if(v.name==='베네치아웨딩부페'){v.parking='자료별 250~1,000대로 상충 · 운영처 확인 필요';v.parkingKnown=false;}
 if(v.name==='더베뉴지서울')v.phone='02-2657-2100';
 if(v.name==='여의도웨딩컨벤션')v.phone='02-761-3800';
 if(v.name==='그래머시 킨텍스')v.note='킨텍스 공식 매뉴얼의 연회·웨딩 예약번호. 제1·2전시장 위치를 구분해 확인하세요.';
}
venues.push(...additions.map(v=>({...defaults,...v})));
venues.push(...review.map(v=>({...defaults,...v,status:'pending'})));
const publicNames={3480:'월드컵공원 평화잔디광장',3203:'서대문 안산 잔디마당',3194:'여의도 루프탑 웨딩홀',3193:'망원 루프탑 웨딩홀',3192:'서울수상레포츠센터 루프탑 웨딩홀',3211:'청년예술청 SAPY',3210:'서교생활문화센터 서교스퀘어',3209:'서울식물원 사색의 정원',3206:'월드컵공원 새록결혼식',3201:'서울식물원 잔디마당',3215:'영중종합사회복지관',3213:'서울문화예술교육센터 은평',3214:'어울림플라자 공연장',1519:'은평역사한옥박물관 은평마당',395:'선유도공원 원형무대',588:'문화비축기지',758:'마곡광장 썬큰마당',527:'여의도 한강공원 물빛무대'};
const guIds={마포구:'mapo',서대문구:'seodaemun',강서구:'gangseo',영등포구:'yeongdeungpo',은평구:'eunpyeong',양천구:'yangcheon'};
for(const item of publicSource.venues){
 const id=item.url.split('/').pop();
 const address=item.detail.match(/주소 및 위치 지도를 움직이려면 클릭 또는 터치하세요 (.*?) 공간 전담업체/)?.[1];
 const parking=item.detail.match(/주\s*차\s*[:：]\s*(.*?)(?:협력전문|대중교통 :|예약현황)/)?.[1]?.trim();
 if(!publicNames[id]||!address)throw new Error(`공공예식 파싱 실패 ${id}`);
 const facilityNote=id==='588'?'2026년 자체 행사로 예약 불가 안내. 2027년은 협력업체 문의.':id==='1519'||id==='395'?'공식 페이지에 2026년 예약 마감 안내. 향후 일정은 원문 확인.':'예식일·예약 자격·피로연 조건은 시설별 원문 확인.';
 venues.push({...defaults,region:guIds[item.text.split(' ')[0]],name:publicNames[id],address,type:'공공 예식',status:'official',source:item.url,website:item.url,phone:'1899-2154',phoneLabel:'서울시 공공예식 상담',parking:parking??defaults.parking,parkingKnown:!!parking,note:facilityNote});
}
const find = name => {const v=venues.find(v=>v.name===name);if(!v)throw new Error(name);return v;};
Object.assign(find('월드컵컨벤션'),{status:'official',website:'https://wocon.co.kr/',source:'https://wocon.co.kr/',phone:'02-3152-7700',parking:'경기장 서측 1·2주차장 · 등록 시 90분 무료',parkingKnown:true,note:'홈플러스 주차장은 무료 주차 불가. 주차장 검색 시 상암월드컵컨벤션 입력.'});
Object.assign(find('베뉴지1995'),{website:'https://venueg1995.com/',source:'https://venueg1995.com/',phone:'031-910-2100',note:'공식 웨딩 안내와 예약실 확인. 2027년 10월 개장 예정 표기가 별도 자료에 있어 실제 첫 예식일 확인 필요. 과거 기사 번호 대신 현 공식 번호 사용.'});
venues.push({...defaults,region:'ilsan-east',name:'일산호수공원 작은결혼식',address:'경기 고양시 일산동구 노루목로 10, 호수공원',type:'공공 예식',status:'official',website:'https://www.goyang.go.kr/park/park04/park04_4.jsp',source:'https://www.goyang.go.kr/park/park04/park04_4.jsp',note:'고양시 공식 작은결혼식 프로그램 안내 확인. 공원 내 세부 예식 구역·예약일·담당 전화는 미확인. 구역 이름을 독립 업체로 중복 집계하지 않음.'});
const excluded=[
 {region:'seodaemun',name:'연세대학교 동문회관·연세플라자',address:'서울 서대문구 연세로 50',reason:'대학 운영 시설·동문회관',source:'https://yonsein.yonsei.ac.kr/'},
 {region:'seodaemun',name:'연세대학교 알렌관(알렌하우스)',address:'서울 서대문구 연세로 50, 연세대학교 알렌관',reason:'대학 부속 예식 시설. 동문회관과는 별도 공간.',source:'https://devcms.yonsei.ac.kr/designcenter/board/notice.do?articleNo=144208&attachNo=124119&mode=download'},
 {region:'mapo',name:'서강대학교 성 이냐시오 성당',address:'서울 마포구 백범로 35, 서강대학교 이냐시오관',reason:'대학 내 종교 예식 시설·혼배 공간',source:'https://bbs.catholic.or.kr/bbsm/bbs_view.asp?id=2128450&menu=4791&num=487'},
 {region:'mapo',name:'곤자가컨벤션',address:'서울 마포구 백범로 35, 서강대학교 곤자가플라자',reason:'2026년 8월 시설 철거·예식 차질 보도로 운영 중단 확인. 대학 직영으로 단정하지 않음.',source:'https://www.yna.co.kr/view/AKR20260826083700004?input=1301p'},
 {region:'yeongdeungpo',name:'공군호텔 웨딩홀(공군회관)',address:'서울 영등포구 여의대방로 259',reason:'군 관련 회관·호텔',source:'https://airforcehotel.co.kr/'},
 {region:'yeongdeungpo',name:'해군호텔 W웨딩홀',address:'서울 영등포구 가마산로 538',reason:'군 관련 회관·호텔',source:'https://www.navywedding.co.kr/index'},
 {region:'yeongdeungpo',name:'중앙보훈회관 예식부',address:'서울 영등포구 국회대로76길 33',reason:'군·보훈 관련 회관',source:'https://lov999.com/region/seoul/yeongdeungpo/'}
];
const nonVenues=[
 {region:'deogyang',name:'예은웨딩부페',address:'경기 고양시 덕양구 충장로350번길 일대',reason:'출장 케이터링 업체로 독립된 예식장 미확인',source:'https://www.saramin.co.kr/zf_user/company-info/view/csn/ck00MFdoTXhQekJWd0hXVVdlNThXdz09/company_nm/뉴월드부페'},
 {region:'gangseo',name:'태평양웨딩부페',address:'서울 강서구 양천로 36-4',reason:'자체 예식홀 대신 케이터링·종교장소 출장 상품',source:'https://www.directwedding.co.kr/weddinghall/hall0475'},
 {region:'outside',name:'육군회관',address:'서울 용산구 용산동5가, 국방부 영내',reason:'요청한 9개 지역 밖·군 관련 회관',source:'https://www.itwed.co.kr/store/hall.htm?idx=188&loc=경기도&mode=totalview'}
];
Object.assign(find('향림도시농업체험원'),{address:'서울 은평구 연서로43길 16-15',phone:'02-382-8001',phoneLabel:'체험원 대표전화 · 예식 운영 미확인',website:'https://www.syteam.kr/'});
Object.assign(find('블리스웨딩컨벤션'),{address:'서울 강서구 내발산동 647',aliases:['만추웨딩홀'],source:'https://www.itwed.co.kr/store/hall.htm?idx=167&mode=realview',note:'과거 웨딩업체 안내에서 내발산동 647 확인. 최근 크롤링 날짜는 최근 예식 운영의 증거가 아니므로 운영 확인 필요로 유지.'});
Object.assign(find('캠퍼스웨딩홀(서울부페)'),{aliases:['귀족웨딩뷔페'],note:'청첩장 목록에서 같은 주소·전화의 귀족웨딩뷔페 표기를 통합. 현행 운영 및 대학 직영 여부 미확인.'});
Object.assign(find('서울물재생공원'),{source:'https://www.khan.co.kr/article/202503281115001',note:'2025-03-28 공단 발표 보도로 예식 대관 이력 확인. 현재 73개 공식 목록에는 없어 현행 예약 여부 확인 필요.'});
Object.assign(find('아모리스 타임스퀘어'),{status:'official',source:'https://m.amoris.co.kr/mobile/board/wedding/time_hall.htm',website:'https://m.amoris.co.kr/mobile/board/wedding/time_hall.htm',address:'서울 영등포구 영중로 15, 타임스퀘어 명품관 5층',phone:'02-2638-2500',parking:'공식 구형 페이지: 2,000대·2시간 30분 무료 (공용 주차장 제외)',parkingKnown:true,note:'공식 모바일 예식 안내는 남아 있으나 현재 대표 사이트는 역삼점 중심. 타임스퀘어점의 실제 신규 예약 및 주차 조건은 재확인 필요.'});
Object.assign(find('마리나컨벤션센터'),{name:'서울마리나 컨벤션',status:'official',source:'https://seoulmarina.club/marina/13/?page=3',website:'https://seoulmarina.club/',phone:'02-2088-4015',parking:'전용 주차장 · 시설 이용 시 차량번호 등록 후 무료, 국회 둔치 별도 유료',parkingKnown:true,aliases:['마리나컨벤션센터'],note:'공식 4층 M라운지 스몰웨딩 소개와 찾아오시는 길 확인. 구형 공공주소록 전화 대신 현 운영사 대표번호 사용.'});
Object.assign(find('플로렌스 오목교점'),{status:'official',source:'https://www.onulin.co.kr/branches/omokgyo/',website:'https://www.onulin.co.kr/branches/omokgyo/',address:'서울 영등포구 영등포로 33, 목동비즈타워 8층',phone:'02-579-2114',phoneLabel:'지점번호 · 예약업체 목록과 대조',parking:'지하 1~3층 200대 · 하객·주인공 2시간 30분~최대 6시간 30분 무료',parkingKnown:true,aliases:['오느린 웨딩 오목교점'],note:'공식 오느린 지점 예식 안내 확인. 지점명은 오목교지만 소재지는 영등포구.'});
Object.assign(find('63컨벤션센터'),{source:'https://korean.miceseoul.com/kor/pgm/smaMng/miceVenueView.do?fcltySn=51&menuNo=800010&smaSn=53',status:'listed',note:'서울관광재단 MICE 시설 소개에 웨딩 용도 기재. 현 운영사 웨딩 예약 안내·대표번호는 미확인.'});
Object.assign(find('포시즌어데이'),{phone:'02-357-9090',phoneLabel:'야외웨딩·행사 문의'});
Object.assign(find('더힐파노라마'),{address:'경기 고양시 덕양구 북한산로 451-9, 1층',source:'https://www.weddingbook.com/weddinghall/113aa20b-d6cf-11ef-9d4f-023379a10fd2',website:null,note:'포시즌어데이와 같은 주소를 쓰는 별도 웨딩 상품. 운영사 총괄운영 안내는 확인했지만 독립 시설 여부 미확인. 중복 가능성 있음.'});
venues.push({...defaults,region:'eunpyeong',name:'알프스웨딩홀',address:'서울 은평구 불광동 308-19',status:'pending',source:'https://www.cardmaul.com/location_pop.php?ml_code=00521',note:'옛 청첩장 약도만 확인. 현행 운영·폐업을 단정할 근거 없음.'});
// 일반 예식장으로 분류된 교회는 운영사의 예식 상품이 없어 별도 검토 기록으로 이동.
const church=find('열방선교교회 예식공간');
venues=venues.filter(v=>v!==church);
nonVenues.push({region:church.region,name:church.name,address:'경기 고양시 일산동구 백마로 195, 2층 2125호',reason:'교회 공식 채널에서 주소만 확인. 일반인 대상 예식 대관 상품은 확인되지 않음.',source:'https://www.youtube.com/channel/UCDjWD09VDxgTD4UXrPsCjMg'});
// 같은 부지의 홀별 상품은 독립 업체 수에 더하지 않고 한 시설로 합산.
const hill=find('더힐파노라마');
const season=find('포시즌어데이');
season.aliases=[...season.aliases,hill.name];
season.note='운영사에 더힐파노라마 총괄운영 안내가 있으며 같은 주소로 소개됨. 독립 시설 여부 미확인으로 한 부지로 합산. 두 상품의 조건은 별도 상담 필요.';
nonVenues.push({region:hill.region,name:hill.name,address:hill.address,reason:'포시즌어데이와 같은 주소의 웨딩 상품. 별도 시설이 확인될 때까지 부지 중복 집계 방지.',source:hill.source});
venues=venues.filter(v=>v!==hill);
const catalog={checkedAt:'2026-11-22',regions:baseline.regions,publicDirectory:{total:publicSource.total,inScope:publicSource.venues.length},statusLabels:{official:'공식 예식 안내 있음',listed:'외부 목록 수록',pending:'운영 확인 필요',planned:'개장 예정'},venues:venues.map((v,i)=>({...v,id:'venue-'+String(i+1).padStart(3,'0')})),excluded,nonVenues};
const amend=(name,values)=>Object.assign(catalog.venues.find(v=>v.name===name),values);
amend('보타닉파크웨딩',{phone:'02-2662-8300',source:'https://botanicparkwedding.imweb.me/location?mode=privacy',parking:'보타닉파크웨딩 주차장 이용 · 대수·무료 시간 미확인',parkingKnown:true});
amend('더뉴컨벤션웨딩',{parking:'지하 4~1층 및 외부 주차장 · 대수·무료 시간 미공개',parkingKnown:true,source:'https://thenewwed.kr/THENEWStory'});
amend('웨딩여율리',{parking:'무료 주차 2시간 · 주차요원 안내, 대수 미공개',parkingKnown:true,source:'https://www.yyrwed.com/main/'});
amend('더베르G',{parking:'건물 내 400대 · 하객 2시간 무료, 혼주 5대 5시간 무료',parkingKnown:true,source:'https://www.theverde-g.kr/reservation'});
amend('예서헌',{phone:'0507-1314-5439',phoneLabel:'운영사 공식 공개 안심번호',source:'https://www.yeseoheon.com/20'});
amend('관세비스타',{parking:'대형버스 포함 약 120대 이상 · 무료 시간 미확인',parkingKnown:true,source:'https://www.kwanseivista.com/'});
amend('하우스 오브 콩두',{phone:'02-722-7002'});
amend('마리앤코 코지가든',{parking:'기계식 40대 · 예식 고객 3시간 무료',parkingKnown:true,source:'https://www.marieenco.co.kr/place/43'});
amend('마리앤코 영등포역점',{parking:'운영사 개장 안내 약 100대 / 외부 플랫폼 700대로 상충 · 재확인 필요',parkingKnown:false,source:'https://www.marieenco.co.kr/issue/26'});
const counts=Object.fromEntries(baseline.regions.map(r=>[r.name,venues.filter(v=>v.region===r.id).length]));
applyScope(catalog);
mergeEnrichment(catalog);
const pricingPath='research/pricing/all-regions.json';
if(fs.existsSync(pricingPath)){const pricing=JSON.parse(fs.readFileSync(pricingPath,'utf8'));catalog.pricingScope={checkedAt:pricing.checkedAt,region:pricing.region,planning:pricing.planning,requestedHistory:pricing.requestedHistory,scopeNote:pricing.scopeNote};for(const v of catalog.venues)if(pricing.venues[v.id])v.pricing=pricing.venues[v.id];}
fs.writeFileSync('catalog.json',JSON.stringify(catalog,null,2));
fs.writeFileSync('catalog.js','// catalog.json에서 생성. research/build-catalog.mjs로 재생성합니다.\nconst venueCatalog = '+JSON.stringify(catalog,null,2)+';\n');
console.log(JSON.stringify({total:catalog.venues.length,statuses:Object.fromEntries(['official','listed','pending','planned'].map(s=>[s,catalog.venues.filter(v=>v.status===s).length])),excluded:catalog.excluded.length,counts:Object.fromEntries(catalog.regions.map(r=>[r.name,catalog.venues.filter(v=>v.region===r.id).length]))},null,2));
