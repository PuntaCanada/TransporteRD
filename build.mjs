import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const html=readFileSync('public/index.html','utf8');
const langs=['de','es','en','fr','pt','it'];
const titles=JSON.parse(html.match(/titles=(\[[^\]]+\])/)[1]);
const intros=JSON.parse(html.match(/intro=(\[[^\]]+\])/)[1]);
const origin=process.env.SITE_URL?.replace(/\/$/,'');
if(origin && !/^https:\/\/[a-z0-9.-]+$/i.test(origin)) throw Error('Invalid SITE_URL');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const alternates=langs.map(l=>'<link rel="alternate" hreflang="'+l+'" href="'+(origin||'')+'/'+l+'/">').join('')+'<link rel="alternate" hreflang="x-default" href="'+(origin||'')+'/">';
for(const [i,l] of langs.entries()){
mkdirSync('public/'+l,{recursive:true});
let page=html.replace('<html lang="es">','<html lang="'+l+'">').replace(/<title>.*?<\/title>/,'<title>'+esc(titles[i])+' | TransporteRD</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+esc(intros[i])+'">').replace(/(<h1 id="heading">).*?(<\/h1>)/,'$1'+esc(titles[i])+'$2').replace(/(<p id="intro">).*?(<\/p>)/,'$1'+esc(intros[i])+'$2').replace('</head>',alternates+(origin?'<link rel="canonical" href="'+origin+'/'+l+'/">':'')+'</head>').replace("apply(stored||navigator.language.slice(0,2))","apply('"+l+"')").replace("apply(s.value);","location.href='../'+s.value+'/';");
writeFileSync('public/'+l+'/index.html',page);
}
writeFileSync('public/robots.txt','User-agent: *\nAllow: /\n'+(origin?'Sitemap: '+origin+'/sitemap.xml\n':''));
if(origin)writeFileSync('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+langs.map(l=>'<url><loc>'+origin+'/'+l+'/</loc></url>').join('')+'</urlset>');
