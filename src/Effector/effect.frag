precision mediump float;

uniform sampler2D u_imageTarget;
uniform sampler2D u_imageMask;
uniform vec2 u_resolution;

varying vec2 v_texCoord;
float PI = 3.14159265358979323846264;

void main() {
  vec2 iUV = vec2(1.0 - v_texCoord.x, v_texCoord.y);
  vec4 displacement = texture2D(u_imageMask, iUV);
  float d = displacement.a;
  float intensity = d;
  if (d > 0.7) {
    intensity = d * pow(8.0, (0.7 - d) * 5.0);
  } else {
    intensity = d * pow(-8.0, d * 5.0);
  }
  float theta = d * 2. * PI;
  vec2 direction = vec2(cos(theta), sin(theta));
  vec2 uv = v_texCoord + direction * d * 0.01;
  float monochromeIntensity = 0.8;
  vec4 c = texture2D(u_imageTarget, uv) * monochromeIntensity;
  gl_FragColor = vec4(c.r * (1. + uv.y * 5.0 * d), c.g * (1. + uv.x * 5.0 * d) ,c.b, 1.0);
}