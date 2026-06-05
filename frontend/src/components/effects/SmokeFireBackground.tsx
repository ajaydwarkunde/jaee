import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const vertexSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

/** Hybrid smoke + fire fluid shader (inspired by Lightswind Pro smoke-fire-background). */
const fragmentSource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_fireColor;
uniform vec3 u_smokeColor;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.45;
    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 9.0; i++) {
        distortion.x += 0.45 / i * cos(i * 2.1 * distortion.y + time * 1.1 + rippleCenter.x * 3.1415);
        distortion.y += 0.45 / i * sin(i * 1.9 * distortion.x + time * 0.95 + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float fireBand = smoothstep(0.15, 0.95, 1.0 - uv.y);
    float smokeBand = smoothstep(0.0, 0.55, uv.y);
    float glow = smoothstep(0.92, 0.08, wave);

    vec3 fire = u_fireColor * glow * fireBand * 1.35;
    vec3 smoke = u_smokeColor * glow * smokeBand * 0.55;
    vec3 color = fire + smoke;
    float alpha = clamp(glow * (fireBand * 0.85 + smokeBand * 0.35), 0.0, 1.0);

    fragColor = vec4(color, alpha);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.substring(0, 2), 16) / 255
  const g = parseInt(normalized.substring(2, 4), 16) / 255
  const b = parseInt(normalized.substring(4, 6), 16) / 255
  return [r, g, b]
}

export interface SmokeFireBackgroundProps {
  fireColor?: string
  smokeColor?: string
  className?: string
  opacity?: number
}

export default function SmokeFireBackground({
  fireColor = '#E8A04A',
  smokeColor = '#923C5B',
  className,
  opacity = 0.55,
}: SmokeFireBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution')
    const iTimeLocation = gl.getUniformLocation(program, 'iTime')
    const iMouseLocation = gl.getUniformLocation(program, 'iMouse')
    const fireColorLocation = gl.getUniformLocation(program, 'u_fireColor')
    const smokeColorLocation = gl.getUniformLocation(program, 'u_smokeColor')

    const [fr, fg, fb] = hexToRgb(fireColor)
    const [sr, sg, sb] = hexToRgb(smokeColor)
    gl.uniform3f(fireColorLocation, fr, fg, fb)
    gl.uniform3f(smokeColorLocation, sr, sg, sb)

    const startTime = Date.now()
    let frameId = 0

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) {
        frameId = requestAnimationFrame(render)
        return
      }

      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)

      gl.uniform2f(iResolutionLocation, width, height)
      gl.uniform1f(iTimeLocation, (Date.now() - startTime) / 1000)
      gl.uniform2f(
        iMouseLocation,
        isHovering ? mousePosition.x : width * 0.5,
        isHovering ? height - mousePosition.y : height * 0.35,
      )

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      frameId = requestAnimationFrame(render)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => {
      setIsHovering(false)
      setMousePosition({ x: 0, y: 0 })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseenter', handleMouseEnter)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [fireColor, smokeColor, isHovering, mousePosition.x, mousePosition.y])

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      style={{ opacity }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-cream/20 backdrop-blur-[1px]" />
    </div>
  )
}
