'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// The one place GSAP plugins are registered. Every animated component
// imports gsap / ScrollTrigger / SplitText / useGSAP from here rather than from the
// packages directly, so registration happens exactly once and only in client
// bundles.
//
// useGSAP (not useEffect) scopes each component's tweens and ScrollTriggers
// and reverts them on unmount, so route changes don't leave triggers behind.
//
// Reduced motion is a hard requirement on this site (CLAUDE.md): wrap every
// animation in gsap.matchMedia() under MOTION_OK, so a reduced-motion visitor
// gets the final, static state with nothing moving. Content must be fully
// visible in the server HTML; animate *from* a hidden state in JS, never hide
// it in CSS, or it stays hidden if the script doesn't run.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, SplitText, useGSAP }
