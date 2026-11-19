# Lee content.json, genera audios (edge-tts) y site/data.js. Uso: python3 build.py
import json, hashlib, asyncio, os, edge_tts
C=json.load(open('content.json'))
L="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
LES=["a","be","ce","de","e","efe","ge","hache","i","jota","ka","ele","eme","ene","o","pe","cu","erre","ese","te","u","uve","uve doble","equis","ye","zeta"]
NUMS=[("one","uno"),("two","dos"),("three","tres"),("four","cuatro"),("five","cinco"),("six","seis"),("seven","siete"),("eight","ocho"),("nine","nueve"),("ten","diez")]
for t in C['topics']:
    if t.get('auto')=='alphabet': t['items']=[{"en":l,"es":LES[i],"text":l,"sayEn":l+".","sayEs":"la letra "+LES[i]} for i,l in enumerate(L)]
    if t.get('auto')=='numbers': t['items']=[{"en":a,"es":b,"text":str(i+1)} for i,(a,b) in enumerate(NUMS)]
    for i in t['items']:
        if 'img' in i:
            if not os.path.exists(f"site/img/{i['img']}.webp"): raise SystemExit("falta imagen "+i['img'])
            i['img']="img/"+i['img']+".webp"
for q in C['exam']:
    if 'img' in q: q['img']="img/"+q['img']+".webp"
FB={"ok_en":"Great job!","ok_es":"¡Muy bien!","bad_en":"Oops! Try again."}
V={"en":"en-US-AnaNeural","es":"es-EC-AndreaNeural"}
jobs={}
def key(text,lang):
    h=hashlib.md5((lang+"|"+text).encode()).hexdigest()[:10]; jobs[h]=(text,lang); return h
for t in C['topics']:
    for i in t['items']:
        i.setdefault('sayEn',i['en']); i.setdefault('sayEs',i['es'])
        i['aEn']=key(i['sayEn'],'en'); i['aEs']=key(i['sayEs'],'es')
for q in C['exam']:
    if 'listen' in q: q['aL']=key(q['listen'],'en')
FBK={k:key(v,k[-2:]) for k,v in FB.items()}
async def gen(h,text,lang,sem):
    p=f"site/audio/{h}.mp3"
    if os.path.exists(p) and os.path.getsize(p)>0: return
    async with sem:
        for _ in range(5):
            try: await edge_tts.Communicate(text,V[lang],rate="-15%").save(p); return
            except Exception as ex: print("retry",text); await asyncio.sleep(2)
async def main():
    sem=asyncio.Semaphore(6); await asyncio.gather(*[gen(h,t,l,sem) for h,(t,l) in jobs.items()])
asyncio.run(main())
for f in os.listdir('site/audio'):
    if f[:-4] not in jobs: os.remove('site/audio/'+f)
with open("site/data.js","w") as f:
    f.write("window.TOPICS="+json.dumps(C['topics'],ensure_ascii=False)+";\nwindow.EXAM="+json.dumps(C['exam'],ensure_ascii=False)+";\nwindow.FB="+json.dumps(FBK)+";\n")
print(len(jobs),"audios")
