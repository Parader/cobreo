"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SHADER_MARKS_EXPERIMENT } from "@/components/cobreo/motion-flags";
import { cx } from "@/utils/cx";

type LogoTextureProps = {
    src: string;
    className?: string;
    /** Overall strength 0–1 */
    intensity?: number;
    tone?: "sage" | "ink" | "brand" | "onDark";
    alt?: string;
    /** CSS mix-blend for reading on dark/light surfaces */
    blend?: "normal" | "soft-light" | "overlay" | "screen" | "multiply";
};

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/**
 * Aspect-correct “contain” sampling + calm continuous fill.
 * Soft brand drift only — no dissolve / flicker.
 */
const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_intensity;
uniform vec2 u_res;
uniform vec2 u_texRes;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 containUV(vec2 uv) {
  float ra = u_res.x / max(u_res.y, 1.0);
  float ta = u_texRes.x / max(u_texRes.y, 1.0);
  vec2 scale = ra > ta ? vec2(ta / ra, 1.0) : vec2(1.0, ra / ta);
  return (uv - 0.5) / scale + 0.5;
}

void main() {
  vec2 uv = containUV(v_uv);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    discard;
  }

  vec4 tex = texture2D(u_tex, uv);
  float mask = max(tex.a, max(tex.r, max(tex.g, tex.b)));
  mask = smoothstep(0.02, 0.22, mask * 5.2);

  // Slow, subtle color drift along the stroke (opacity stays steady)
  float flow = noise(uv * 2.8 + vec2(u_time * 0.045, -u_time * 0.03));
  float mixAmt = 0.5 + 0.5 * sin(uv.x * 2.2 + uv.y * 1.4 + flow * 1.8 + u_time * 0.08);
  vec3 col = mix(u_c1, u_c2, mixAmt);
  col = mix(col, u_c3, flow * 0.22);

  float alpha = clamp(mask * u_intensity, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

const TONES: Record<NonNullable<LogoTextureProps["tone"]>, [number, number, number][]> = {
    sage: [
        [0.86, 0.88, 0.83],
        [0.61, 0.64, 0.56],
        [0.3, 0.42, 0.59],
    ],
    brand: [
        [0.3, 0.42, 0.59],
        [0.5, 0.62, 0.76],
        [0.77, 0.8, 0.72],
    ],
    ink: [
        [0.09, 0.09, 0.09],
        [0.3, 0.42, 0.59],
        [0.4, 0.45, 0.4],
    ],
    onDark: [
        [0.86, 0.88, 0.83],
        [0.65, 0.71, 0.8],
        [0.3, 0.42, 0.59],
    ],
};

const BLEND_CLASS: Record<NonNullable<LogoTextureProps["blend"]>, string> = {
    normal: "",
    "soft-light": "mix-blend-soft-light",
    overlay: "mix-blend-overlay",
    screen: "mix-blend-screen",
    multiply: "mix-blend-multiply",
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * Logo / ring texture: aspect-correct soft fill with a calm color drift.
 * Falls back to a contained SVG image if WebGL is unavailable.
 */
export function LogoTexture({
    src,
    className,
    intensity = 0.72,
    tone = "sage",
    alt = "",
    blend = "normal",
}: LogoTextureProps) {
    const reduce = useReducedMotion();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(!SHADER_MARKS_EXPERIMENT || !!reduce);

    useEffect(() => {
        if (!SHADER_MARKS_EXPERIMENT || reduce) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", {
            alpha: true,
            premultipliedAlpha: false,
            antialias: true,
        });
        if (!gl) {
            setFailed(true);
            return;
        }

        const vs = compile(gl, gl.VERTEX_SHADER, VERT);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) {
            setFailed(true);
            return;
        }

        const program = gl.createProgram();
        if (!program) {
            setFailed(true);
            return;
        }
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            setFailed(true);
            return;
        }
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        const aPos = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uTex = gl.getUniformLocation(program, "u_tex");
        const uTime = gl.getUniformLocation(program, "u_time");
        const uIntensity = gl.getUniformLocation(program, "u_intensity");
        const uRes = gl.getUniformLocation(program, "u_res");
        const uTexRes = gl.getUniformLocation(program, "u_texRes");
        const uC1 = gl.getUniformLocation(program, "u_c1");
        const uC2 = gl.getUniformLocation(program, "u_c2");
        const uC3 = gl.getUniformLocation(program, "u_c3");

        const colors = TONES[tone];
        gl.uniform3fv(uC1, colors[0]);
        gl.uniform3fv(uC2, colors[1]);
        gl.uniform3fv(uC3, colors[2]);
        gl.uniform1f(uIntensity, intensity);
        gl.uniform1i(uTex, 0);
        gl.uniform2f(uTexRes, 1, 1);

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        let raf = 0;
        let alive = true;
        const start = performance.now();

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.max(1, Math.floor(rect.width * dpr));
            const h = Math.max(1, Math.floor(rect.height * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
            gl.uniform2f(uRes, w, h);
        };

        const draw = (t: number) => {
            if (!alive) return;
            resize();
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(uTime, (t - start) / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            raf = requestAnimationFrame(draw);
        };

        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => {
            if (!alive) return;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.uniform2f(uTexRes, img.naturalWidth || img.width, img.naturalHeight || img.height);
            raf = requestAnimationFrame(draw);
        };
        img.onerror = () => setFailed(true);
        img.src = src;

        const ro = new ResizeObserver(() => resize());
        if (canvas.parentElement) ro.observe(canvas.parentElement);

        return () => {
            alive = false;
            cancelAnimationFrame(raf);
            ro.disconnect();
            gl.deleteTexture(texture);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, [src, intensity, tone, reduce]);

    const blendClass = BLEND_CLASS[blend];

    if (failed) {
        return (
            <Image
                src={src}
                alt={alt}
                fill
                className={cx("object-contain opacity-40", blendClass, className)}
            />
        );
    }

    return <canvas ref={canvasRef} aria-hidden className={cx("absolute inset-0 h-full w-full", blendClass, className)} />;
}

/** @deprecated Use LogoTexture */
export const ShaderMark = LogoTexture;
