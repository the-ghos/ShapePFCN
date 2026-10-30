"""Bande son « Chez Deborah Dollars » : groove afro-pop synthétisé + effets + voix off, avec ducking.
Les temps des effets sont en frames vidéo (30 fps) pour rester calés sur la composition Remotion.
Usage : python3 audio/mix.py public/voix.mp3 out/son.wav
"""
import subprocess
import sys
import wave

import numpy as np

SR = 48000
FPS = 30
DUR = 54.0
N = int(SR * DUR)
V = 0.7  # décalage de la voix off (identique à src/lib.tsx)
rng = np.random.default_rng(3)


def at(sec):
    return int(sec * SR)


def fr(frame):
    return frame / FPS


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, sig, sec, gain=1.0, pan=0.0):
        i = at(sec)
        if i >= N:
            return
        sig = sig[: N - i]
        pn = np.linspace(pan[0], pan[1], len(sig)) if isinstance(pan, tuple) else np.full(len(sig), pan)
        self.L[i:i + len(sig)] += sig * gain * np.sqrt((1 - pn) / 2)
        self.R[i:i + len(sig)] += sig * gain * np.sqrt((1 + pn) / 2)


def band(x, lo, hi):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(spec, len(x))
    return y / (np.abs(y).max() + 1e-9)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ───────────────────────────── instruments ─────────────────────────────
def kick(g=1.0):
    t = tt(0.45)
    f = 48 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * g + band(rng.standard_normal(len(t)), 1000, 5000) * np.exp(-t * 300) * 0.15


def clap():
    t = tt(0.35)
    n = band(rng.standard_normal(len(t)), 900, 7000)
    e = np.exp(-t * 28) + 0.6 * np.exp(-np.maximum(0, t - 0.012) * 40) * (t > 0.012) + 0.5 * np.exp(-np.maximum(0, t - 0.024) * 30) * (t > 0.024)
    return n * e * 0.7


def shaker(acc=1.0):
    t = tt(0.08)
    return band(rng.standard_normal(len(t)), 5000, 14000) * np.exp(-t * 70) * 0.25 * acc


def logdrum(m, dur=0.5):
    # basse « log drum » : sinus qui glisse vers le bas, attaque percussive
    t = tt(dur)
    f = note(m) * (1 + 0.6 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(2.2 * s) * np.exp(-t * 5)
    return s * 0.55


def kalimba(m, dur=0.9):
    t = tt(dur)
    f = note(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 18) + 0.2 * np.sin(2 * np.pi * f * 2 * t)
    return s * np.exp(-t * 6) * np.minimum(1, t / 0.002) * 0.3


def pad(ms, dur):
    t = tt(dur)
    s = np.zeros(len(t))
    for m in ms:
        for d in (-0.1, 0.1):
            s += np.sin(2 * np.pi * note(m) * (1 + d / 100) * t + rng.uniform(0, 6.28))
    e = np.minimum(1, t / 0.4) * np.minimum(1, (t[-1] - t) / 0.4)
    return s * e / (len(ms) * 2) * 0.35


def whoosh(dur, bright=1.0):
    n = int(dur * SR) + int(0.3 * SR)
    x = rng.standard_normal(n)
    lo, mid, hi = band(x, 150, 900), band(x, 600, 3500), band(x, 2500, 10000)
    k = np.linspace(0, 1, n)
    pk = 0.55
    e = np.where(k < pk, (k / pk) ** 2, np.exp(-(k - pk) * 10))
    sw = np.clip(np.sin(np.pi * np.minimum(k / pk, 1) * 0.5), 0, 1)
    return (lo * (1 - sw) + mid * sw + hi * sw ** 3 * 0.5 * bright) * e


def pop():
    t = tt(0.18)
    f = 500 + 900 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.8


def thud():
    t = tt(0.6)
    f = 55 + 80 * np.exp(-t * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + band(rng.standard_normal(len(t)), 100, 2500) * np.exp(-t * 25) * 0.5


def sparkle(dur=1.4):
    t = tt(dur)
    s = np.zeros(len(t))
    for k, m in enumerate([84, 88, 91, 96, 100]):
        on = k * 0.05
        tk = np.maximum(0, t - on)
        s += np.sin(2 * np.pi * note(m) * tk) * np.exp(-tk * 5) * (t >= on)
    return s * 0.18


def ding():
    t = tt(0.9)
    return (np.sin(2 * np.pi * note(88) * t) * np.exp(-t * 6) + 0.6 * np.sin(2 * np.pi * note(95) * np.maximum(0, t - 0.09)) * np.exp(-np.maximum(0, t - 0.09) * 6) * (t > 0.09)) * 0.3


def impact(dur=2.5):
    t = tt(dur)
    s = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t * 20)) / SR) * np.exp(-t * 2.2)
    s += band(rng.standard_normal(len(t)), 80, 6000) * np.exp(-t * 10) * 0.45
    return s


def riser(dur):
    t = tt(dur)
    k = t / t[-1]
    return band(rng.standard_normal(len(t)), 400, 9000) * k ** 3 * 0.5 + np.sin(2 * np.pi * np.cumsum(220 + 1100 * k ** 2) / SR) * k ** 2.5 * 0.25


def splash():
    t = tt(0.7)
    plink = np.sin(2 * np.pi * np.cumsum(900 + 700 * np.exp(-t * 60)) / SR) * np.exp(-t * 25) * 0.6
    water = band(rng.standard_normal(len(t)), 300, 6000) * np.exp(-t * 9) * 0.5
    return plink + water


def crack():
    t = tt(0.6)
    s = band(rng.standard_normal(len(t)), 1500, 12000) * (np.exp(-t * 40) + 0.5 * (np.sin(2 * np.pi * 37 * t) > 0.6) * np.exp(-t * 10))
    return s * 0.6 + thud() * 0.5


def beep():
    t = tt(0.12)
    return np.sin(2 * np.pi * 880 * t) * np.minimum(1, (t[-1] - t) / 0.01) * 0.2


# ───────────────────────────── musique ─────────────────────────────
music = Bus()
BPM = 104
beat = 60 / BPM
bar = 4 * beat
CHORDS = [(57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (48, [48, 55, 60, 64]), (55, [55, 59, 62, 67])]  # Am F C G
MEL = [69, 72, 76, 74, 72, 69, 67, 69, 72, 74, 76, 79, 76, 74, 72, 74]  # pentatonique, 2 mesures en croches

A_END = fr(185)        # fin de l'accroche
B_END = fr(341)        # fin du problème
CTA = fr(1271)         # appel à l'action
END = fr(1438)         # logo final


def groove(t0, t1, energy=1.0, drums=True):
    t = t0
    i = 0
    while t < t1 - 1e-6:
        ch_root, ch = CHORDS[(i // 16) % 4]
        step = i % 16  # double-croches dans une mesure
        if drums:
            if step % 4 == 0:
                music.add(kick(0.9), t, 0.55 * energy)
            if step in (4, 12):
                music.add(clap(), t, 0.35 * energy, 0.1)
            music.add(shaker(1.0 if step % 4 == 2 else 0.5), t, 0.5 * energy, 0.35)
            if step in (0, 3, 6, 10, 11, 14):
                m = ch_root - 12 + (7 if step in (10, 11) else 0)
                music.add(logdrum(m, 0.45), t, 0.55 * energy)
        if step % 2 == 0:
            music.add(kalimba(MEL[(i // 2) % 16], 0.8), t, 0.22 * energy, -0.3 + 0.6 * ((i // 2) % 2))
        if step == 0:
            music.add(pad(ch, bar + 0.3), t, 0.5)
        t += beat / 4
        i += 1


# intro douce : kalimba + nappe
groove(0.25, A_END, energy=0.75, drums=False)
# problème : drone sombre, battement de cœur
d = tt(B_END - A_END)
drone = (np.sin(2 * np.pi * 55 * d) + 0.5 * np.sin(2 * np.pi * 58.27 * d) + 0.3 * np.sin(2 * np.pi * 82.4 * d)) * np.minimum(1, d / 0.3) * np.minimum(1, (d[-1] - d) / 0.2) * 0.18
music.add(drone, A_END)
hb = A_END + 0.2
while hb < B_END - 0.3:
    music.add(kick(0.6), hb, 0.35)
    music.add(kick(0.4), hb + 0.22, 0.25)
    hb += 0.9
# groove principal
groove(B_END, CTA, energy=1.0)
groove(CTA, END, energy=1.15)
groove(END, 52.6, energy=0.8)
music.add(pad([57, 64, 69, 72], 3.5), 50.5, 0.9)
music.add(kalimba(81, 2.5), 52.6, 0.35)

# ───────────────────────────── effets ─────────────────────────────
sfx = Bus()
sfx.add(splash(), fr(30), 0.6)
for frm, dur, pan in [(109, 0.7, 0.0), (183, 0.4, (0.8, -0.8)), (326, 0.7, (-0.8, 0.8)), (536, 0.5, 0.0), (812, 0.4, (0.8, -0.8)),
                      (922, 0.6, 0.0), (1136, 0.4, (-0.8, 0.8)), (1269, 0.4, (0.8, -0.8)), (1406, 0.7, 0.0), (1381, 0.6, (-0.9, 0.6))]:
    sfx.add(whoosh(dur), fr(frm), 0.35, pan)
for frm in (243, 267, 1273, 1279, 1312):
    sfx.add(thud(), fr(frm), 0.45)
sfx.add(crack(), fr(293), 0.45)
for frm in (681, 724, 777, 948, 972, 996, 1144, 1200):
    sfx.add(pop(), fr(frm), 0.35)
sfx.add(impact(), fr(580), 0.55)
sfx.add(sparkle(), fr(580), 0.6)
sfx.add(sparkle(), fr(638), 0.7)
sfx.add(ding(), fr(1320), 0.6)
sfx.add(ding(), fr(1466), 0.5)
sfx.add(beep(), fr(1395), 1.0)
sfx.add(beep(), fr(1400), 1.0)
sfx.add(riser(fr(1438) - fr(1396)), fr(1396), 0.35)
sfx.add(splash(), fr(1438), 0.5)
sfx.add(impact(3.0), fr(1438), 0.6)
sfx.add(sparkle(2.0), fr(1440), 0.7)

# ───────────────────────────── voix + ducking ─────────────────────────────
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                     capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype='<i2').astype(np.float64) / 32768
voice = voice / (np.abs(voice).max() + 1e-9) * 0.9
vb = np.zeros(N)
i0 = at(V)
vb[i0:i0 + len(voice)] = voice[: N - i0]

# enveloppe de la voix (attaque rapide, relâchement lent) → baisse la musique quand elle parle
blk = 480
env = np.sqrt(np.convolve(vb ** 2, np.ones(blk) / blk, 'same'))
env = env / (env.max() + 1e-9)
sm = np.zeros(N)
a_att, a_rel = np.exp(-1 / (0.02 * SR / blk)), np.exp(-1 / (0.35 * SR / blk))
cur = 0.0
for k in range(0, N, blk):
    x = env[k]
    cur = a_att * cur + (1 - a_att) * x if x > cur else a_rel * cur + (1 - a_rel) * x
    sm[k:k + blk] = cur
duck = 1 - 0.6 * np.clip(sm * 3, 0, 1)


def reverb(x, seed, length=1.6, decay=3.2):
    r = np.random.default_rng(seed)
    t = tt(length)
    ir = band(r.standard_normal(len(t)), 200, 8000) * np.exp(-t * decay)
    m = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return y / (np.abs(y).max() + 1e-9)


mL = music.L * duck
mR = music.R * duck
mL += reverb(mL, 1) * np.abs(mL).max() * 0.2
mR += reverb(mR, 2) * np.abs(mR).max() * 0.2
sL = sfx.L + reverb(sfx.L, 3) * np.abs(sfx.L).max() * 0.25
sR = sfx.R + reverb(sfx.R, 4) * np.abs(sfx.R).max() * 0.25
mpk = max(np.abs(mL).max(), np.abs(mR).max())
spk = max(np.abs(sL).max(), np.abs(sR).max())
L = mL / mpk * 0.36 + sL / spk * 0.5 + vb
R = mR / mpk * 0.36 + sR / spk * 0.5 + vb
st = np.stack([L, R], 1)
st = np.tanh(st / np.abs(st).max() * 1.4) / np.tanh(1.4) * 0.92
fade = np.ones(N)
fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 2
st *= fade[:, None]

with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', sys.argv[2])
