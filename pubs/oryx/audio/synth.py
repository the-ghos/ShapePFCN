"""Bande son ORYX (sans voix) : tic-tac, nappe, whooshes, scintillements, montée, impact.
Tous les temps sont en frames (30 fps) pour rester calés sur la vidéo Remotion.
Usage : python3 audio/synth.py out/son.wav
"""
import sys
import wave

import numpy as np

SR = 48000
FPS = 30
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
Rt = np.zeros(N)


def at(frame):
    return int(frame / FPS * SR)


def add(sig, frame, gain=1.0, pan=0.0):
    """Ajoute un signal mono (ou un couple (pan_debut, pan_fin) en pan)."""
    i = at(frame)
    sig = sig[: max(0, N - i)]
    if isinstance(pan, tuple):
        pn = np.linspace(pan[0], pan[1], len(sig))
    else:
        pn = np.full(len(sig), pan)
    L[i:i + len(sig)] += sig * gain * np.sqrt((1 - pn) / 2)
    Rt[i:i + len(sig)] += sig * gain * np.sqrt((1 + pn) / 2)


def band(noise, lo, hi):
    spec = np.fft.rfft(noise)
    fr = np.fft.rfftfreq(len(noise), 1 / SR)
    spec[(fr < lo) | (fr > hi)] = 0
    out = np.fft.irfft(spec, len(noise))
    return out / (np.abs(out).max() + 1e-9)


def env(n, a, d, curve=3.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e


# --- tic-tac mécanique ---------------------------------------------------
def tick(hi=True, soft=1.0):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f0 = 3400 if hi else 2500
    body = np.sin(2 * np.pi * f0 * t) * np.exp(-t * 90) + 0.5 * np.sin(2 * np.pi * f0 * 1.52 * t) * np.exp(-t * 130)
    click = band(rng.standard_normal(n), 1500, 9000) * np.exp(-t * 400)
    wood = np.sin(2 * np.pi * (900 if hi else 700) * t) * np.exp(-t * 60) * 0.4
    return (0.5 * body + 0.6 * click + wood) * soft


def kick(gain=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 55 + 60 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * gain


for k, fr in enumerate(range(0, 511, 30)):
    soft = 0.55 if fr < 40 else 0.8
    add(tick(k % 2 == 0, soft), fr, 0.5, 0.0)
    if 240 <= fr <= 450:
        add(kick(), fr, 0.35)
# rafale d'index : le fil pose les 12 index
for i in range(12):
    add(tick(i % 2 == 0, 0.35), 150 + i * 2.6, 0.45, -0.6 + i * 0.1)
# verrouillage des aiguilles sur 10:10
n = int(0.2 * SR)
t = np.arange(n) / SR
clack = band(rng.standard_normal(n), 800, 6000) * np.exp(-t * 70) + 0.6 * np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 50)
add(clack, 214, 0.45)
# dernier tic, seul dans le silence
add(tick(True, 1.0), 590, 0.6)


# --- whooshes ---------------------------------------------------------------
def whoosh(frames, bright=1.0):
    n = int(frames / FPS * SR) + int(0.4 * SR)
    noise = rng.standard_normal(n)
    lo, mid, hi = band(noise, 150, 900), band(noise, 600, 3500), band(noise, 2500, 9000)
    x = np.linspace(0, 1, n)
    peak = 0.55
    e = np.where(x < peak, (x / peak) ** 2.2, np.exp(-(x - peak) * 9))
    sweep = np.clip(np.sin(np.pi * np.minimum(x / peak, 1) * 0.5), 0, 1)
    sig = lo * (1 - sweep) + mid * sweep + hi * sweep ** 3 * 0.5 * bright
    return sig * e


add(whoosh(72), 42, 0.42, (-0.7, 0.7))
add(whoosh(30), 118, 0.3, (-0.4, 0.0))
add(whoosh(20, 0.6), 182, 0.25, 0.2)
add(whoosh(52), 248, 0.38, (0.6, -0.6))
add(whoosh(34, 0.5), 352, 0.3, 0.0)
add(whoosh(60, 0.7), 362, 0.25, (0.0, -0.4))
add(whoosh(34, 0.5), 448, 0.28, 0.0)
add(whoosh(22, 1.3), 522, 0.55, (-0.9, 0.9))


# --- scintillements (étincelles, révélations) -------------------------------
def shimmer(dur=1.6, base=2093.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, mult in enumerate([1, 1.5, 2, 2.67, 3, 4]):
        ph = rng.uniform(0, 6.28)
        trem = 0.6 + 0.4 * np.sin(2 * np.pi * (5 + k) * t + ph)
        out += np.sin(2 * np.pi * base * mult * t + ph) * trem / (1 + k * 0.6)
    return out * env(n, 0.03, dur, 4)


add(shimmer(1.8, 1567.98), 30, 0.11)
add(shimmer(1.4, 2093.0), 176, 0.07)
add(shimmer(2.2, 1174.66), 238, 0.10)
for fr, b in [(382, 1760.0), (402, 2093.0), (422, 2349.3)]:
    add(shimmer(1.0, b), fr, 0.06, -0.4)
add(shimmer(3.0, 1174.66), 556, 0.12)


# --- nappe harmonique ---------------------------------------------------------
def pad(freqs, start, end, fade_in, fade_out, gain):
    i0, i1 = at(start), at(end)
    n = i1 - i0
    t = np.arange(n) / SR
    sigL = np.zeros(n)
    sigR = np.zeros(n)
    for f in freqs:
        for det, side in [(-0.12, 0), (0.12, 1), (0.0, 2)]:
            ph = rng.uniform(0, 6.28)
            s = np.sin(2 * np.pi * f * (1 + det / 100) * t + ph) + 0.25 * np.sin(2 * np.pi * 2 * f * t + ph)
            if side != 1:
                sigL += s
            if side != 0:
                sigR += s
    e = np.minimum(1, t / fade_in) * np.minimum(1, (t[-1] - t) / fade_out)
    e *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * t)
    norm = gain / (len(freqs) * 2)
    L[i0:i1] += sigL * e * norm
    Rt[i0:i1] += sigR * e * norm


D2, A2, F3, C4, E4 = 73.42, 110.0, 174.61, 261.63, 329.63
Bb1, F2, A3, D4 = 58.27, 87.31, 220.0, 293.66
pad([D2, A2, F3, C4, E4], 30, 262, 2.5, 1.0, 0.16)
pad([Bb1, F2, A3, D4, C4 * 2], 236, 372, 1.0, 1.2, 0.2)
pad([D2, A2, F3, A3, E4 * 2], 348, 452, 1.0, 1.5, 0.17)
pad([D2, A2, D4], 440, 552, 1.5, 0.15, 0.10)

# --- montée puis impact --------------------------------------------------------
n = at(549) - at(470)
t = np.arange(n) / SR
x = t / t[-1]
riser = band(rng.standard_normal(n), 400, 8000) * x ** 3 * 0.6
riser += np.sin(2 * np.pi * np.cumsum(200 + 900 * x ** 2) / SR) * x ** 2.5 * 0.35
add(riser, 470, 0.35)

n = int(3.5 * SR)
t = np.arange(n) / SR
boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t * 18)) / SR) * np.exp(-t * 1.6)
boom += band(rng.standard_normal(n), 60, 3000) * np.exp(-t * 14) * 0.5
boom += np.sin(2 * np.pi * 146.8 * t) * np.exp(-t * 1.2) * 0.25 + np.sin(2 * np.pi * 220 * t) * np.exp(-t * 1.5) * 0.15
add(boom, 549, 0.75)


# --- réverbération (convolution) + mastering ---------------------------------
def reverb(x, seed):
    r = np.random.default_rng(seed)
    n = int(2.4 * SR)
    t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 2.6)
    ir = band(ir, 200, 7000) * np.exp(-t * 2.6)
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
    return y / (np.abs(y).max() + 1e-9)


wetL, wetR = reverb(L, 1), reverb(Rt, 2)
mixL = L + wetL * np.abs(L).max() * 0.35
mixR = Rt + wetR * np.abs(Rt).max() * 0.35
st = np.stack([mixL, mixR], 1)
st = np.tanh(st / np.abs(st).max() * 1.6) / np.tanh(1.6) * 0.89
fade = np.ones(N)
fade[-int(0.25 * SR):] = np.linspace(1, 0, int(0.25 * SR))
st *= fade[:, None]

out = sys.argv[1] if len(sys.argv) > 1 else 'son.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', out)
