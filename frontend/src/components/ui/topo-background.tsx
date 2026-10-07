"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color_bg;
  uniform vec3 u_color_line;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st.x *= u_resolution.x / u_resolution.y;

      // We make the noise slowly drift
      vec2 pos = st * 1.5; // Scale of the topographic map
      pos.x -= u_time * 0.03; // Drift speed x
      pos.y -= u_time * 0.04; // Drift speed y

      // Add a bit of fractal detail
      float n = snoise(pos) * 0.5 + 0.5; 
      n += snoise(pos * 2.0 - u_time * 0.01) * 0.1;
      
      // Topographic contour lines
      float contours = 20.0;
      float v = n * contours;
      float f = fract(v);
      
      // Calculate fwidth for anti-aliasing
      float fw = fwidth(v);
      
      // Calculate line thickness
      float thickness = 0.1;
      
      // Smoothstep for anti-aliasing
      float line = smoothstep(0.0, fw, f) - smoothstep(thickness, thickness + fw, f);
      
      vec3 color = mix(u_color_bg, u_color_line, line);
      
      gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface TopoBackgroundProps {
  className?: string;
  lineColor?: [number, number, number]; // RGB 0-1
  bgColor?: [number, number, number]; // RGB 0-1
}

export function TopoBackground({ 
  className,
  lineColor = [0.85, 0.85, 0.85], 
  bgColor = [1.0, 1.0, 1.0]
}: TopoBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use webgl with OES_standard_derivatives for fwidth
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;
    
    (gl as WebGLRenderingContext).getExtension("OES_standard_derivatives");

    const vertexShader = createShader(gl as WebGLRenderingContext, (gl as WebGLRenderingContext).VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl as WebGLRenderingContext, (gl as WebGLRenderingContext).FRAGMENT_SHADER, `#extension GL_OES_standard_derivatives : enable\n${fragmentShaderSource}`);

    if (!vertexShader || !fragmentShader) return;

    const program = (gl as WebGLRenderingContext).createProgram();
    if (!program) return;
    
    (gl as WebGLRenderingContext).attachShader(program, vertexShader);
    (gl as WebGLRenderingContext).attachShader(program, fragmentShader);
    (gl as WebGLRenderingContext).linkProgram(program);

    if (!(gl as WebGLRenderingContext).getProgramParameter(program, (gl as WebGLRenderingContext).LINK_STATUS)) {
      console.error((gl as WebGLRenderingContext).getProgramInfoLog(program));
      return;
    }

    (gl as WebGLRenderingContext).useProgram(program);

    const positionBuffer = (gl as WebGLRenderingContext).createBuffer();
    (gl as WebGLRenderingContext).bindBuffer((gl as WebGLRenderingContext).ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ];
    (gl as WebGLRenderingContext).bufferData((gl as WebGLRenderingContext).ARRAY_BUFFER, new Float32Array(positions), (gl as WebGLRenderingContext).STATIC_DRAW);

    const positionLocation = (gl as WebGLRenderingContext).getAttribLocation(program, "position");
    (gl as WebGLRenderingContext).enableVertexAttribArray(positionLocation);
    (gl as WebGLRenderingContext).vertexAttribPointer(positionLocation, 2, (gl as WebGLRenderingContext).FLOAT, false, 0, 0);

    const resolutionLocation = (gl as WebGLRenderingContext).getUniformLocation(program, "u_resolution");
    const timeLocation = (gl as WebGLRenderingContext).getUniformLocation(program, "u_time");
    const bgColorLocation = (gl as WebGLRenderingContext).getUniformLocation(program, "u_color_bg");
    const lineColorLocation = (gl as WebGLRenderingContext).getUniformLocation(program, "u_color_line");

    (gl as WebGLRenderingContext).uniform3fv(bgColorLocation, bgColor);
    (gl as WebGLRenderingContext).uniform3fv(lineColorLocation, lineColor);

    let animationFrameId: number;
    let startTime = performance.now();
    let isDestroyed = false;

    const resize = () => {
      if (isDestroyed) return;
      // Get physical pixel size
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth  = Math.round(rect.width * dpr);
      const displayHeight = Math.round(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
      }
      
      (gl as WebGLRenderingContext).viewport(0, 0, canvas.width, canvas.height);
      (gl as WebGLRenderingContext).uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    const render = (time: number) => {
      if (isDestroyed) return;
      const elapsed = (time - startTime) / 1000;
      (gl as WebGLRenderingContext).uniform1f(timeLocation, elapsed);
      (gl as WebGLRenderingContext).drawArrays((gl as WebGLRenderingContext).TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lineColor, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover", className)}
    />
  );
}
