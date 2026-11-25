import json, sys
N=32
PAL={'K':'#000000','W':'#ffffff','S':'#c0c0c0','L':'#dfdfdf','D':'#808080','Y':'#ffff00','O':'#808000','B':'#000080','b':'#0000ff','C':'#00ffff','R':'#ff0000','r':'#800000','N':'#008000','g':'#00ff00','T':'#008080'}
class Cv:
    def __init__(s): s.g=[['.']*N for _ in range(N)]
    def p(s,x,y,c):
        if 0<=x<N and 0<=y<N: s.g[y][x]=c
    def rect(s,x0,y0,x1,y1,c):
        for y in range(y0,y1+1):
            for x in range(x0,x1+1): s.p(x,y,c)
    def frame(s,x0,y0,x1,y1,c):
        for x in range(x0,x1+1): s.p(x,y0,c); s.p(x,y1,c)
        for y in range(y0,y1+1): s.p(x0,y,c); s.p(x1,y,c)
    def hl(s,x0,x1,y,c):
        for x in range(x0,x1+1): s.p(x,y,c)
    def vl(s,x,y0,y1,c):
        for y in range(y0,y1+1): s.p(x,y,c)
    def line(s,x0,y0,x1,y1,c):
        dx,dy=abs(x1-x0),-abs(y1-y0); sx=1 if x0<x1 else -1; sy=1 if y0<y1 else -1; e=dx+dy
        while True:
            s.p(x0,y0,c)
            if x0==x1 and y0==y1: break
            e2=2*e
            if e2>=dy: e+=dy; x0+=sx
            if e2<=dx: e+=dx; y0+=sy
    def poly(s,pts,c):
        ys=[p[1] for p in pts]
        for y in range(min(ys),max(ys)+1):
            xs=[]
            for i in range(len(pts)):
                (xa,ya),(xb,yb)=pts[i],pts[(i+1)%len(pts)]
                if ya==yb: continue
                if min(ya,yb)<=y<max(ya,yb): xs.append(xa+(y-ya)*(xb-xa)/(yb-ya))
            xs.sort()
            for i in range(0,len(xs)-1,2):
                for x in range(round(xs[i]),round(xs[i+1])+1): s.p(x,y,c)
    def outline(s,pts,c):
        for i in range(len(pts)): s.line(*pts[i],*pts[(i+1)%len(pts)],c)
    def bevel(s,x0,y0,x1,y1,face,hi,sh):
        s.rect(x0,y0,x1,y1,face)
        s.hl(x0,x1,y0,hi); s.vl(x0,y0,y1,hi)
        s.hl(x0,x1,y1,sh); s.vl(x1,y0,y1,sh)
    def rows(s): return ["".join(r) for r in s.g]

def review():
    c=Cv()
    # back card
    c.bevel(9,3,27,19,'Y','W','O'); c.frame(8,2,28,20,'K')
    c.hl(11,24,6,'O'); c.hl(11,24,9,'O'); c.hl(11,20,12,'O')
    # front card
    c.bevel(4,10,22,28,'W','W','D'); c.frame(3,9,23,29,'K')
    c.rect(6,12,20,14,'B')
    for y in (17,20,23): c.hl(6,19 if y!=23 else 14,y,'D')
    c.vl(21,11,27,'L')
    return c
def cards():
    c=Cv()
    c.rect(6,3,25,29,'W')
    c.frame(5,2,26,30,'K')
    # fold
    c.poly([(19,2),(26,2),(26,9)],'.'); 
    c.rect(19,2,26,9,'.'); 
    c.rect(5,2,18,2,'K')
    c.hl(6,25,29,'D'); c.vl(25,10,29,'D')
    # redraw page with cut corner
    c.__init__()
    c.poly([(6,3),(18,3),(25,10),(25,29),(6,29)],'W')
    c.outline([(5,2),(18,2),(26,9),(26,30),(5,30)],'K')
    c.poly([(18,3),(18,9),(25,9)],'S'); c.outline([(18,2),(18,9),(26,9)],'K')
    c.vl(25,10,29,'D'); c.hl(6,25,29,'D')
    for y,x1 in ((13,22),(16,22),(19,22),(22,22),(25,16)): c.hl(8,x1,y,'D')
    return c
def glossary():
    c=Cv()
    c.rect(5,3,25,27,'B'); c.frame(4,2,26,28,'K')
    c.vl(5,3,27,'b'); c.vl(6,3,27,'b'); c.hl(5,25,3,'b')
    c.vl(24,4,27,'r') if False else None
    c.rect(10,7,22,15,'W'); c.frame(10,7,22,15,'K')
    for y,x1 in ((9,20),(11,20),(13,16)): c.hl(12,x1,y,'D')
    # page block
    c.rect(7,29,27,30,'W'); c.hl(7,27,31,'K'); c.vl(28,5,30,'K'); c.rect(27,5,27,28,'W'); c.vl(28,5,31,'K')
    c.hl(27,27,29,'W')
    c.vl(26,3,28,'K')
    for y in (8,11,14,17,20,23): c.p(27,y,'D')
    c.hl(8,26,29,'D'); c.hl(4,28,31,'K')
    return c
def progress():
    c=Cv()
    c.bevel(3,4,28,27,'S','W','D'); c.frame(2,3,29,28,'K')
    c.rect(5,6,26,9,'B')
    c.rect(5,11,26,25,'W'); c.hl(5,26,11,'D'); c.vl(5,11,25,'D'); c.hl(5,26,25,'W'); c.vl(26,11,25,'W')
    c.rect(8,18,11,24,'N'); c.rect(14,14,17,24,'b'); c.rect(20,16,23,24,'R')
    for x0,x1,y in ((8,11,18),(14,17,14),(20,23,16)): c.hl(x0,x1,y,'W') if False else None
    c.hl(7,24,24,'K')
    return c
def desk():
    c=Cv()
    c.rect(3,6,13,9,'Y'); c.frame(2,5,14,10,'K')
    c.bevel(3,9,28,26,'Y','W','O'); c.frame(2,8,29,27,'K')
    c.hl(4,26,13,'W'); c.hl(4,26,14,'O')
    c.hl(3,3,9,'K')
    return c
def lab():
    c=Cv()
    pts=[(12,3),(19,3),(19,12),(27,27),(4,27),(12,12)]
    c.poly(pts,'W')
    # liquid
    c.poly([(8,20),(23,20),(27,27),(4,27)],'N')
    c.outline([(11,2),(20,2),(20,12),(28,27),(3,27),(11,12)],'K')
    c.hl(11,20,3,'S'); c.hl(10,21,2,'K'); 
    c.hl(7,24,20,'g') ; c.hl(5,26,26,'N')
    c.p(10,23,'g'); c.p(12,22,'g'); c.p(16,24,'g')
    c.vl(19,4,11,'D')
    c.hl(4,27,27,'K'); c.hl(4,27,28,'K')
    return c
def home():
    # a desktop computer, the stock icon of the time for "this machine / home"
    c=Cv()
    c.bevel(4,3,27,20,'S','W','D'); c.frame(3,2,28,21,'K')
    c.rect(8,7,23,16,'T'); c.frame(7,6,24,17,'D'); c.hl(7,24,17,'W'); c.vl(24,6,17,'W'); c.hl(7,23,6,'K'); c.vl(7,6,16,'K')
    c.rect(10,9,16,14,'W'); c.rect(10,9,16,10,'B'); c.frame(10,9,16,14,'K')
    c.p(26,18,'g'); c.p(25,18,'g')
    c.rect(13,22,18,23,'S'); c.vl(12,22,23,'K'); c.vl(19,22,23,'K')
    c.bevel(9,24,22,26,'S','W','D'); c.frame(8,23,23,27,'K')
    c.bevel(4,28,27,30,'S','W','D'); c.frame(3,27,28,31,'K')
    for x in range(6,26,3): c.p(x,29,'D')
    return c
def repo():
    c=Cv()
    c.bevel(3,5,28,26,'S','W','D'); c.frame(2,4,29,27,'K')
    c.rect(5,7,26,10,'B')
    c.rect(5,12,26,24,'W'); c.hl(5,26,12,'D'); c.vl(5,12,24,'D'); c.hl(5,26,24,'L'); c.vl(26,12,24,'L')
    for pts in ([(13,15),(10,18),(13,21)],[(14,15),(11,18),(14,21)]):
        c.line(*pts[0],*pts[1],'K'); c.line(*pts[1],*pts[2],'K')
    for pts in ([(18,15),(21,18),(18,21)],[(19,15),(22,18),(19,21)]):
        c.line(*pts[0],*pts[1],'K'); c.line(*pts[1],*pts[2],'K')
    c.line(17,14,15,22,'D')
    return c
def login():
    c=Cv()
    # shackle
    c.rect(10,4,21,17,'S'); c.rect(14,8,17,17,'.')
    c.frame(9,3,22,17,'K'); c.frame(13,7,18,17,'K'); c.rect(14,8,17,17,'.') 
    c.hl(10,21,4,'W'); c.vl(10,4,17,'W'); c.vl(21,5,17,'D'); c.hl(14,17,8,'D')
    # body
    c.bevel(5,15,26,29,'Y','W','O'); c.frame(4,14,27,30,'K')
    c.rect(14,19,17,22,'K'); c.rect(15,22,16,25,'K')
    return c
ICONS={'review':review,'cards':cards,'glossary':glossary,'progress':progress,'desk':desk,'lab':lab,'home':home,'repo':repo,'login':login}

def circle(c,cx,cy,r,fill,outline):
    import math
    for y in range(N):
        for x in range(N):
            d=math.hypot(x-cx,y-cy)
            if d<=r: c.p(x,y,fill)
    for y in range(N):
        for x in range(N):
            d=math.hypot(x-cx,y-cy)
            if r-1.1<d<=r: c.p(x,y,outline)
def error():
    c=Cv(); circle(c,15.5,15.5,13.5,'R','K')
    # light and shadow edges
    for y in range(N):
        for x in range(N):
            import math
            d=math.hypot(x-15.5,y-15.5)
            if 11.2<d<=12.6 and (x+y)<31: c.p(x,y,'W') if False else None
    for t in range(0,3):
        c.line(10,10+t,21-t,21,'W'); c.line(21,10+t,10+t,21,'W')
    return c
def info():
    c=Cv(); circle(c,15.5,15.5,13.5,'b','K')
    c.rect(15,8,16,9,'W'); c.rect(14,12,16,12,'W'); c.rect(15,13,16,21,'W'); c.rect(13,22,18,23,'W')
    return c
def warning():
    c=Cv()
    c.poly([(16,3),(30,28),(2,28)],'Y'); c.outline([(16,2),(31,29),(1,29)],'K'); c.outline([(16,3),(30,28),(2,28)],'K') if False else None
    c.rect(15,11,16,19,'K'); c.rect(15,22,16,24,'K')
    return c
ICONS.update({'error':error,'info':info,'warning':warning})
out={k:f().rows() for k,f in ICONS.items()}
import os
HERE=os.path.dirname(os.path.abspath(__file__))
json.dump(out,open(os.path.join(HERE,'icons.json'),'w'))
# contact sheet
S=8
parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{(N*S+16)*len(out)}" height="{N*S+16}"><rect width="100%" height="100%" fill="#008080"/>']
for i,(k,rows) in enumerate(out.items()):
    ox=i*(N*S+16)+8
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            if ch!='.': parts.append(f'<rect x="{ox+x*S}" y="{8+y*S}" width="{S}" height="{S}" fill="{PAL[ch]}"/>')
parts.append('</svg>')
open(os.path.join(HERE,'sheet.svg'),'w').write("".join(parts))
print("ok",list(out))
