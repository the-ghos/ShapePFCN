#!/usr/bin/env bash
# Synthesizes every sound effect used by the video (no external assets needed).
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
SR=48000
ff() { ffmpeg -loglevel error -y "$@"; }

# Water drop "bloop": fast falling pitch + short decay, with a tiny room
ff -f lavfi -i "aevalsrc='0.8*exp(-t*22)*sin(2*PI*(500*t+1500*(1-exp(-t*45))/45))':s=$SR:d=0.6" \
   -af "aecho=0.6:0.5:40|70:0.25|0.15,afade=t=out:st=0.45:d=0.15" drip.wav

# Deep cinematic impact: pitch-dropping sub + noise crack
ff -f lavfi -i "aevalsrc='0.9*exp(-t*2.6)*sin(2*PI*(38*t+90*(1-exp(-t*7))/7))':s=$SR:d=2.5" \
   -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:d=2.5:r=$SR" \
   -filter_complex "[1]afade=t=out:st=0:d=0.5,lowpass=f=1800[n];[0][n]amix=inputs=2:weights=1 0.6:normalize=0,aecho=0.7:0.6:120|260:0.3|0.2,afade=t=out:st=1.8:d=0.7" impact.wav

# Whoosh: band-passed noise with a swelling envelope
ff -f lavfi -i "anoisesrc=color=pink:amplitude=0.9:d=0.9:r=$SR" \
   -af "highpass=f=300,lowpass=f=4500,volume='sin(PI*min(t/0.9,1))^3':eval=frame,aecho=0.5:0.4:60:0.3" whoosh.wav

# Riser: rising tone + noise, 1.2s
ff -f lavfi -i "aevalsrc='0.35*(t/1.2)^2*sin(2*PI*(200*t+600*t*t/1.2))':s=$SR:d=1.2" \
   -f lavfi -i "anoisesrc=color=white:amplitude=0.25:d=1.2:r=$SR" \
   -filter_complex "[1]highpass=f=2000,volume='(t/1.2)^3':eval=frame[n];[0][n]amix=inputs=2:normalize=0" riser.wav

# Shimmer / glint for light sweeps
ff -f lavfi -i "aevalsrc='0.25*exp(-t*3)*(sin(2*PI*1760*t)+0.7*sin(2*PI*2637*t)+0.5*sin(2*PI*3520*t+sin(2*PI*6*t)))':s=$SR:d=1.6" \
   -af "afade=t=in:d=0.05,aecho=0.8:0.7:90|180:0.4|0.25" shimmer.wav

# Ambient pad (A minor add9) with slow movement, 30s
ff -f lavfi -i "aevalsrc='0.10*sin(2*PI*55*t)+0.07*sin(2*PI*110.3*t)+0.05*sin(2*PI*164.8*t)*(0.6+0.4*sin(2*PI*0.11*t))+0.045*sin(2*PI*220*t+0.5*sin(2*PI*0.2*t))+0.04*sin(2*PI*261.6*t)*(0.5+0.5*sin(2*PI*0.07*t))+0.03*sin(2*PI*329.6*t)+0.025*sin(2*PI*493.9*t)*(0.5+0.5*sin(2*PI*0.13*t+1))':s=$SR:d=30" \
   -af "aecho=0.8:0.85:300|520:0.35|0.25,lowpass=f=2400,afade=t=in:d=2,afade=t=out:st=26.5:d=3.5" pad.wav

# Pulse: soft sub kick pattern at 100 BPM for the merch section, 11s
ff -f lavfi -i "aevalsrc='0.7*exp(-mod(t,0.6)*9)*sin(2*PI*(45*mod(t,0.6)+70*(1-exp(-mod(t,0.6)*25))/25))':s=$SR:d=11" \
   -af "afade=t=in:d=0.5,afade=t=out:st=9.5:d=1.5" pulse.wav
ls -la
